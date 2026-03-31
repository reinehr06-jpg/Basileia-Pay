<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Integration;
use App\Models\Transaction;
use App\Models\WebhookEvent;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class CheckoutWebhookController extends Controller
{
    private const ASAAS_IP_WHITELIST = [
        '13.90.0.0/16',
        '13.91.0.0/16',
    ];

    private const LOCK_TIMEOUT = 300;

    public function handle(Request $request)
    {
        if (!$this->validateAsaasIp($request)) {
            Log::warning('Asaas webhook: invalid IP', [
                'ip' => $request->ip(),
            ]);
            return response()->json(['message' => 'Forbidden'], Response::HTTP_FORBIDDEN);
        }

        $payload = $request->all();
        $signature = $request->header('asaas-access-token');

        $integration = $this->resolveIntegrationBySignature($signature);

        if (!$integration) {
            Log::warning('Asaas webhook with invalid signature', [
                'ip' => $request->ip(),
            ]);
            return response()->json(['message' => 'Unauthorized'], Response::HTTP_UNAUTHORIZED);
        }

        $gatewayTransactionId = $payload['payment']['id'] ?? null;
        $eventType = $payload['event'] ?? $payload['notificationType'] ?? null;

        if (!$gatewayTransactionId || !$eventType) {
            return response()->json(['message' => 'Invalid payload'], Response::HTTP_BAD_REQUEST);
        }

        $idempotencyKey = 'asaas_' . $gatewayTransactionId . '_' . $eventType;

        if (WebhookEvent::where('idempotency_key', $idempotencyKey)->exists()) {
            Log::debug('Asaas webhook: already processed', [
                'idempotency_key' => $idempotencyKey,
            ]);
            return response()->json(['message' => 'Already processed']);
        }

        $lockKey = 'webhook_lock:' . $gatewayTransactionId;
        if (!Cache::lock($lockKey, self::LOCK_TIMEOUT)->get()) {
            Log::warning('Asaas webhook: processing locked', [
                'gateway_transaction_id' => $gatewayTransactionId,
            ]);
            return response()->json(['message' => 'Processing'], 409);
        }

        try {
            $transaction = Transaction::where('gateway_transaction_id', $gatewayTransactionId)
                ->whereHas('integration', fn ($q) => $q->where('id', $integration->id))
                ->first();

            if (!$transaction) {
                Log::warning('Asaas webhook: transaction not found', [
                    'gateway_transaction_id' => $gatewayTransactionId,
                ]);
                return response()->json(['message' => 'Transaction not found'], Response::HTTP_NOT_FOUND);
            }

            $statusMap = [
                'PAYMENT_RECEIVED' => 'approved',
                'PAYMENT_CONFIRMED' => 'approved',
                'PAYMENT_OVERDUE' => 'overdue',
                'PAYMENT_DELETED' => 'cancelled',
                'PAYMENT_REFUNDED' => 'refunded',
                'PAYMENT_REFUND_IN_PROGRESS' => 'pending_refund',
            ];

            $newStatus = $statusMap[$eventType] ?? null;

            if ($newStatus) {
                $transaction->update(['status' => $newStatus]);
                $transaction->payments()->update(['status' => $newStatus]);
            }

            WebhookEvent::create([
                'integration_id' => $integration->id,
                'transaction_id' => $transaction->id,
                'event_type' => $eventType,
                'idempotency_key' => $idempotencyKey,
                'payload' => $payload,
            ]);

            $this->dispatchCheckoutWebhook($transaction, $eventType);

            return response()->json(['message' => 'Processed']);
        } finally {
            Cache::lock($lockKey)->release();
        }
    }

    private function dispatchCheckoutWebhook(Transaction $transaction, string $eventType): void
    {
        $integration = $transaction->integration;
        
        if (!$integration || !$integration->webhook_url) {
            Log::debug('Checkout webhook: no webhook_url configured', [
                'transaction_id' => $transaction->id,
                'integration_id' => $integration?->id,
            ]);
            return;
        }

        $eventMap = [
            'PAYMENT_RECEIVED' => 'payment.approved',
            'PAYMENT_CONFIRMED' => 'payment.approved',
            'PAYMENT_OVERDUE' => 'payment.overdue',
            'PAYMENT_DELETED' => 'payment.cancelled',
            'PAYMENT_REFUNDED' => 'payment.refunded',
            'PAYMENT_REFUND_IN_PROGRESS' => 'payment.refund_pending',
        ];

        $checkoutEvent = $eventMap[$eventType] ?? $eventType;

        $webhookPayload = [
            'event' => $checkoutEvent,
            'transaction' => [
                'uuid' => $transaction->uuid,
                'external_id' => $transaction->external_id,
                'amount' => (float) $transaction->amount,
                'status' => $transaction->status,
                'payment_method' => $transaction->payment_method,
            ],
            'payment' => [
                'gateway_payment_id' => $transaction->payments->first()?->gateway_payment_id,
                'amount' => (float) $transaction->payments->first()?->amount,
                'billing_type' => $transaction->payments->first()?->billing_type,
            ],
            'timestamp' => now()->toIso8601String(),
        ];

        $secret = $integration->webhook_secret ?? config('checkout.webhook_secret');
        $signature = $secret ? hash_hmac('sha256', json_encode($webhookPayload), $secret) : null;

        try {
            $headers = [
                'Content-Type' => 'application/json',
            ];
            
            if ($signature) {
                $headers['X-Checkout-Signature'] = $signature;
            }

            $response = Http::timeout(30)
                ->withHeaders($headers)
                ->post($integration->webhook_url, $webhookPayload);

            if ($response->successful()) {
                Log::info('Checkout webhook sent successfully', [
                    'transaction_id' => $transaction->id,
                    'event' => $checkoutEvent,
                    'webhook_url' => $integration->webhook_url,
                ]);
            } else {
                Log::error('Checkout webhook failed', [
                    'transaction_id' => $transaction->id,
                    'status' => $response->status(),
                    'response' => $response->body(),
                ]);
            }
        } catch (\Exception $e) {
            Log::error('Checkout webhook exception', [
                'transaction_id' => $transaction->id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    private function validateAsaasIp(Request $request): bool
    {
        $ip = $request->ip();
        
        foreach (self::ASAAS_IP_WHITELIST as $range) {
            if ($this->ipInRange($ip, $range)) {
                return true;
            }
        }

        return false;
    }

    private function ipInRange(string $ip, string $range): bool
    {
        if (strpos($range, '/') === false) {
            return $ip === $range;
        }

        [$subnet, $bits] = explode('/', $range);
        $ip = ip2long($ip);
        $subnet = ip2long($subnet);
        $mask = -1 << (32 - $bits);
        $subnet &= $mask;

        return ($ip & $mask) == $subnet;
    }

    private function resolveIntegrationBySignature(?string $signature): ?Integration
    {
        if (!$signature) {
            return null;
        }

        return Integration::where('webhook_secret', $signature)
            ->where('status', 'active')
            ->first();
    }
}
