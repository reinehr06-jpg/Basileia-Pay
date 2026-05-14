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
 * Recebe callbacks do Asaas para o sistema de Checkout.
 * Diferente do ApiV1\WebhookController (que serve a API externa),
 * este controller processa eventos internos do checkout.
 *
 * [QA-03] statusMap inline removido — usa PaymentStatusMapper.
 */
class CheckoutWebhookController extends Controller
{
    private const ASAAS_IP_WHITELIST = ['13.90.0.0/16', '13.91.0.0/16'];
    private const LOCK_TIMEOUT       = 300;

    public function handle(Request $request): JsonResponse
    {
        if (! $this->validateAsaasIp($request)) {
            Log::warning('CheckoutWebhookController: IP não autorizado', ['ip' => $request->ip()]);
            return response()->json(['message' => 'Forbidden'], Response::HTTP_FORBIDDEN);
        }

        $payload              = $request->all();
        $signature            = $request->header('asaas-access-token');
        $integration          = $this->resolveIntegrationBySignature($signature);
        $gatewayTransactionId = $payload['payment']['id'] ?? $payload['paymentId'] ?? null;
        $eventType            = $payload['event']         ?? $payload['notificationType'] ?? null;

        if (! $integration) {
            Log::warning('CheckoutWebhookController: assinatura inválida', ['ip' => $request->ip()]);
            return response()->json(['message' => 'Unauthorized'], Response::HTTP_UNAUTHORIZED);
        }

        if (! $gatewayTransactionId || ! $eventType) {
            return response()->json(['message' => 'Invalid payload'], Response::HTTP_BAD_REQUEST);
        }

        // Idempotência
        $idempotencyKey = 'asaas.' . $gatewayTransactionId . '.' . $eventType;
        if (WebhookEvent::where('idempotency_key', $idempotencyKey)->exists()) {
            Log::debug('CheckoutWebhookController: já processado', ['key' => $idempotencyKey]);
            return response()->json(['message' => 'Already processed']);
        }

        // Lock distribuído
        $lockKey = 'webhook_lock.' . $gatewayTransactionId;
        if (! Cache::lock($lockKey, self::LOCK_TIMEOUT)->get()) {
            Log::warning('CheckoutWebhookController: lock ativo', [
                'gateway_transaction_id' => $gatewayTransactionId,
            ]);
            return response()->json(['message' => 'Processing'], 409);
        }

        try {
            $transaction = Transaction::where('gateway_transaction_id', $gatewayTransactionId)
                ->whereHas('integration', fn ($q) => $q->where('id', $integration->id))
                ->first();

            if (! $transaction) {
                Log::warning('CheckoutWebhookController: transação não encontrada', [
                    'gateway_transaction_id' => $gatewayTransactionId,
                ]);
                return response()->json(['message' => 'Transaction not found'], Response::HTTP_NOT_FOUND);
            }

            // [QA-03] NUNCA usa statusMap inline — usa PaymentStatusMapper
            $rawStatus = $payload['payment']['status'] ?? '';
            $newStatus = PaymentStatusMapper::mapStatus($rawStatus);
            $paidAt    = PaymentStatusMapper::isPaid($rawStatus) ? now() : null;

            if ($newStatus) {
                $transaction->update(['status' => $newStatus, 'paid_at' => $paidAt]);
                $transaction->payments()->update(['status' => $newStatus]);
            }

            WebhookEvent::create([
                'integration_id'  => $integration->id,
                'transaction_id'  => $transaction->id,
                'event_type'      => $eventType,
                'idempotency_key' => $idempotencyKey,
                'payload'         => $payload,
            ]);

            return response()->json(['message' => 'Processed']);
        } finally {
            Cache::lock($lockKey)->release();
        }
    }

    private function validateAsaasIp(Request $request): bool
    {
        $ip = $request->ip();
        foreach (self::ASAAS_IP_WHITELIST as $range) {
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
