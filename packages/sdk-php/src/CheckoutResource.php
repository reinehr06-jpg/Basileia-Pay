<?php

namespace Basileia;

class CheckoutResource
{
    public function __construct(private BasileiaClient $client) {}

    public function create(array $input, ?string $idempotencyKey = null): array
    {
        return $this->client->request('POST', '/checkout-sessions', [
            'body'             => $input,
            'idempotency_key'  => $idempotencyKey ?? $this->generateKey(),
        ]);
    }

    public function get(string $sessionId): array
    {
        return $this->client->request('GET', "/checkout-sessions/{$sessionId}");
    }

    private function generateKey(): string
    {
        return 'bsdk_' . time() . '_' . bin2hex(random_bytes(6));
    }
}
