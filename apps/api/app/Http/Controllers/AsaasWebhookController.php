<?php

namespace App\Http\Controllers;

use App\Models\Subscription;
use App\Models\Transaction;
use App\Models\WebhookEvent;
use App\Services\WebhookNotifierService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class AsaasWebhookController extends Controller
{
    private const LOCK_TIMEOUT = 300;

    public function __construct(
        private WebhookNotifierService $webhookNotifier,
    ) {
    }

    public function handle(Request $request)
    {
        $event = $request->input('event');
        $data = $request->input('payment') ?? $request->input('subscription');

        if (!$event || !$data) {
            Log::warning('AsaasWebhook: Missing data in payload', ['payload_keys' => array_keys($request->all())]);
            return response()->json(['error' => 'Invalid payload'], 400);
        }

        $paymentId = $data['id'] ?? null;

        Log::info('AsaasWebhook: Event received', [
            'event' => $event,
            'id' => $paymentId,
        ]);

        // Search in both Transactions and Subscriptions
        $transaction = Transaction::where('asaas_payment_id', $paymentId)->first()
            ?? Transaction::where('gateway_transaction_id', $paymentId)->first()
            ?? Subscription::where('gateway_subscription_id', $paymentId)->first();

        // --- Per-Gateway Token Validation ---
        // Even if transaction not found, we should try to validate with a global token if available
        $gateway = $transaction?->gateway;
        $expectedToken = $gateway ? $gateway->getConfig('webhook_token') : config('services.asaas.webhook_token');
        $receivedToken = $request->header('asaas-access-token');

        if ($expectedToken && $receivedToken !== $expectedToken) {
            Log::warning('AsaasWebhook: Invalid token', [
                'gateway_id' => $gateway->id ?? 'global',
                'payment_id' => $paymentId
            ]);
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        if (!$transaction) {
            Log::warning('AsaasWebhook: Resource not found locally', [
                'asaas_id' => $paymentId,
            ]);
            return response()->json(['ok' => true]);
        }

        // --- Idempotency check: skip if already processed ---
        $idempotencyKey = 'asaas_webhook:' . $paymentId . ':' . $event;
        if (WebhookEvent::where('idempotency_key', $idempotencyKey)->exists()) {
            Log::debug('AsaasWebhook: Already processed', ['idempotency_key' => $idempotencyKey]);
            return response()->json(['ok' => true, 'status' => 'already_processed']);
        }

        // Distributed lock to prevent concurrent processing
        $lock = Cache::lock('webhook:asaas:' . $paymentId, self::LOCK_TIMEOUT);
        if (!$lock->get()) {
            Log::warning('AsaasWebhook: Already processing', ['payment_id' => $paymentId]);
            return response()->json(['ok' => true, 'status' => 'processing'], 409);
        }

        try {
            $newStatus = \App\Helpers\PaymentStatusMapper::mapStatus($data['status'] ?? '');
            $paidAt    = \App\Helpers\PaymentStatusMapper::isPaid($data['status'] ?? '') ? now() : $transaction->paid_at;
            
            $transaction->update([
                'status' => $newStatus,
                'paid_at' => $paidAt,
            ]);

            // Register idempotency record
            WebhookEvent::create([
                'company_id' => $transaction->company_id,
                'transaction_id' => $transaction->id,
                'event_type' => $event,
                'idempotency_key' => $idempotencyKey,
                'payload' => $data,
            ]);

            $this->webhookNotifier->notify($transaction);

            return response()->json(['ok' => true]);
        } finally {
            $lock->release();
        }
    }
}
