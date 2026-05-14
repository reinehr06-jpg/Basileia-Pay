<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Helpers\PaymentStatusMapper;
use App\Http\Controllers\Controller;
use App\Models\Integration;
use App\Models\Transaction;
use App\Models\WebhookEvent;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

/**
 * Recebe webhooks do Asaas (IP whitelist + asaas-access-token).
 *
 * [QA-03] statusMap inline removido — usa PaymentStatusMapper::mapStatus()
 *         e PaymentStatusMapper::isPaid() como fonte única de verdade.
 */
class WebhookController extends Controller
{
    private const LOCK_TIMEOUT = 300;

    private function getAsaasIpWhitelist(): array
    {
        $configured = config('services.asaas.webhook_ip_whitelist');
        if ($configured) {
            return array_map('trim', explode(',', $configured));
        }
        // IPs oficiais do Asaas — configure via ASAAS_WEBHOOK_IP_WHITELIST no .env
        return ['13.90.0.0/16', '13.91.0.0/16'];
    }

    public function asaas(Request $request): JsonResponse
    {
        if (! $this->validateAsaasIp($request)) {
            Log::warning('Api\V1\WebhookController: IP não autorizado', [
                'ip'      => $request->ip(),
                'payload' => $request->all(),
            ]);
            return response()->json(['message' => 'Forbidden'], Response::HTTP_FORBIDDEN);
        }

        $payload   = $request->all();
        $signature = $request->header('asaas-access-token');

        $integration = $this->resolveIntegrationBySignature($signature);
        if (! $integration) {
            Log::warning('Api\V1\WebhookController: assinatura inválida', ['ip' => $request->ip()]);
            return response()->json(['message' => 'Unauthorized'], Response::HTTP_UNAUTHORIZED);
        }

        $gatewayTransactionId = $payload['payment']['id'] ?? $payload['paymentId'] ?? null;
        $eventType            = $payload['event']         ?? $payload['notificationType'] ?? null;

        if (! $gatewayTransactionId || ! $eventType) {
            return response()->json(['message' => 'Invalid payload'], Response::HTTP_BAD_REQUEST);
        }

        // Idempotência
        $idempotencyKey = 'asaas.' . $gatewayTransactionId . '.' . $eventType;
        if (WebhookEvent::where('idempotency_key', $idempotencyKey)->exists()) {
            Log::debug('Api\V1\WebhookController: webhook já processado', ['key' => $idempotencyKey]);
            return response()->json(['message' => 'Already processed']);
        }

        // Lock distribuído
        $lockKey = 'webhook_lock.' . $gatewayTransactionId;
        if (! Cache::lock($lockKey, self::LOCK_TIMEOUT)->get()) {
            Log::warning('Api\V1\WebhookController: processamento bloqueado (lock)', [
                'gateway_transaction_id' => $gatewayTransactionId,
            ]);
            return response()->json(['message' => 'Processing'], 409);
        }

        try {
            $transaction = Transaction::where('gateway_transaction_id', $gatewayTransactionId)
                ->whereHas('integration', fn ($q) => $q->where('id', $integration->id))
                ->first();

            if (! $transaction) {
                Log::warning('Api\V1\WebhookController: transação não encontrada', [
                    'gateway_transaction_id' => $gatewayTransactionId,
                ]);
                return response()->json(['message' => 'Transaction not found'], Response::HTTP_NOT_FOUND);
            }

            // [QA-03] Usa PaymentStatusMapper — NUNCA statusMap inline
            $rawStatus = $payload['payment']['status'] ?? '';
            $newStatus = PaymentStatusMapper::mapStatus($rawStatus);
            $paidAt    = PaymentStatusMapper::isPaid($rawStatus) ? now() : null;

            if ($newStatus && $transaction->status !== $newStatus) {
                $transaction->update(['status' => $newStatus, 'paid_at' => $paidAt]);
                $transaction->payments()->update(['status' => $newStatus]);

                Log::info('Api\V1\WebhookController: status atualizado', [
                    'gateway_transaction_id' => $gatewayTransactionId,
                    'event'                  => $eventType,
                    'new_status'             => $newStatus,
                ]);
            }

            WebhookEvent::create([
                'integration_id'  => $integration->id,
                'transaction_id'  => $transaction->id,
                'event_type'      => $eventType,
                'idempotency_key' => $idempotencyKey,
                'payload'         => $payload,
            ]);

            $this->dispatchCheckoutWebhook($transaction, $eventType);

            return response()->json(['message' => 'Processed']);
        } finally {
            Cache::lock($lockKey)->release();
        }
    }

    public function stripe(Request $request): JsonResponse
    {
        Log::info('Api\V1\WebhookController: Stripe webhook recebido', [
            'event_type' => $request->input('type', 'unknown'),
        ]);
        return response()->json(['message' => 'Received']);
    }

    public function pagseguro(Request $request): JsonResponse
    {
        Log::info('Api\V1\WebhookController: PagSeguro webhook recebido', [
            'event_type' => $request->input('notificationType', 'unknown'),
        ]);
        return response()->json(['message' => 'Received']);
    }

    private function dispatchCheckoutWebhook(Transaction $transaction, string $eventType): void
    {
        $integration = $transaction->integration;
        if (! $integration || ! $integration->webhook_url) {
            return;
        }

        // [QA-03] Usa PaymentStatusMapper para mapear para evento semântico
        $checkoutEvent = PaymentStatusMapper::mapToWebhookEvent($transaction->status);

        $webhookPayload = array_filter([
            'event'       => $checkoutEvent,
            'transaction' => array_filter([
                'uuid'        => $transaction->uuid,
                'external_id' => $transaction->external_id,
                'status'      => $transaction->status,
                'gateway_id'  => $transaction->gateway_transaction_id,
            ], fn ($v) => ! is_null($v)),
            'timestamp'   => now()->toIso8601String(),
        ]);

        $jsonPayload = json_encode($webhookPayload, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
        $secret      = $integration->webhook_secret;
        $signature   = $secret ? hash_hmac('sha256', $jsonPayload, $secret) : null;

        $headers = ['Content-Type' => 'application/json', 'User-Agent' => 'Checkout/1.0'];
        if ($signature) {
            $headers['X-Checkout-Signature']  = $signature;
            $headers['X-Hub-Signature-256']   = 'sha256=' . $signature;
        }

        try {
            $response = \Illuminate\Support\Facades\Http::timeout(30)
                ->withHeaders($headers)
                ->withBody($jsonPayload, 'application/json')
                ->post($integration->webhook_url);

            if ($response->successful()) {
                Log::info('Api\V1\WebhookController: webhook enviado', [
                    'transaction_id' => $transaction->id,
                    'event'          => $checkoutEvent,
                ]);
            } else {
                Log::error('Api\V1\WebhookController: webhook falhou', [
                    'transaction_id' => $transaction->id,
                    'status'         => $response->status(),
                ]);
            }
        } catch (\Throwable $e) {
            Log::error('Api\V1\WebhookController: exceção ao enviar webhook', [
                'transaction_id' => $transaction->id,
                'error'          => $e->getMessage(),
            ]);
        }
    }

    private function validateAsaasIp(Request $request): bool
    {
        $ip = $request->ip();
        foreach ($this->getAsaasIpWhitelist() as $range) {
            if ($this->ipInRange($ip, $range)) return true;
        }
        return false;
    }

    private function ipInRange(string $ip, string $range): bool
    {
        if (! str_contains($range, '/')) {
            return $ip === $range;
        }
        [$subnet, $bits] = explode('/', $range);
        $ip     = ip2long($ip);
        $subnet = ip2long($subnet);
        $mask   = -1 << (32 - (int) $bits);
        return ($ip & $mask) === ($subnet & $mask);
    }

    private function resolveIntegrationBySignature(?string $signature): ?Integration
    {
        if (! $signature) return null;
        return Integration::where('webhook_secret', $signature)
            ->where('status', 'active')
            ->first();
    }
}
