<?php

namespace App\Domain\Payment\Idempotency;

use Illuminate\Support\Facades\Cache;

class IdempotencyGuard
{
    public function check(string $key, string $context): ?array
    {
        $cached = Cache::get("idempotency:{$context}:{$key}");
        return $cached ? json_decode($cached, true) : null;
    }

    public function store(string $key, string $context, array $response, int $ttlSeconds = 86400): void
    {
        Cache::put(
            "idempotency:{$context}:{$key}",
            json_encode($response),
            $ttlSeconds
        );
    }
}
