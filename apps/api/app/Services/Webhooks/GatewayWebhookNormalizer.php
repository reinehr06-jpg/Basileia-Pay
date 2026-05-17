<?php

namespace App\Services\Webhooks;

class GatewayWebhookNormalizer
{
    public function normalize(string $provider, array $payload): array
    {
        return match ($provider) {
            'asaas'     => $this->normalizeAsaas($payload),
            'stripe'    => $this->normalizeStripe($payload),
            'pagseguro' => $this->normalizePagSeguro($payload),
            default     => throw new \Exception("Provedor de webhook não suportado: {$provider}"),
        };
    }

    protected function normalizeAsaas(array $p): array
    {
        $statusMap = [
            'PAYMENT_CONFIRMED' => 'approved',
            'PAYMENT_RECEIVED'  => 'approved',
            'PAYMENT_DELETED'   => 'cancelled',
            'PAYMENT_OVERDUE'   => 'failed',
            'PAYMENT_REFUNDED'  => 'refunded',
        ];

        return [
            'provider'           => 'asaas',
            'event_type'         => $p['event'],
            'gateway_payment_id' => $p['payment']['id'] ?? null,
            'status'             => $statusMap[$p['event']] ?? 'processing',
            'amount'             => (int)($p['payment']['value'] * 100),
            'occurred_at'        => $p['payment']['confirmedDate'] ?? null,
            'raw'                => $p,
        ];
    }

    protected function normalizeStripe(array $p): array
    {
        $statusMap = [
            'payment_intent.succeeded' => 'approved',
            'payment_intent.payment_failed' => 'failed',
            'charge.refunded' => 'refunded',
        ];

        $obj = $p['data']['object'];

        return [
            'provider'           => 'stripe',
            'event_type'         => $p['type'],
            'gateway_payment_id' => $obj['id'],
            'status'             => $statusMap[$p['type']] ?? 'processing',
            'amount'             => $obj['amount'] ?? 0,
            'occurred_at'        => isset($obj['created']) ? date('Y-m-d H:i:s', $obj['created']) : null,
            'raw'                => $p,
        ];
    }

    protected function normalizePagSeguro(array $p): array
    {
        // PagSeguro v3 simplification
        return [
            'provider'           => 'pagseguro',
            'event_type'         => 'notification',
            'gateway_payment_id' => $p['id'] ?? null,
            'status'             => 'approved', // Placeholder
            'raw'                => $p,
        ];
    }
}
