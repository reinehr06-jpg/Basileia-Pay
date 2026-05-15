<?php

namespace App\Security\ApiKey;

use Illuminate\Support\Str;

class ApiKeyGenerator
{
    /**
     * Generate a new API key pair.
     *
     * @return array{full_key: string, key_prefix: string, key_hash: string}
     */
    public function generate(string $environment): array
    {
        $prefix = $environment === 'production' ? 'bp_live' : 'bp_test';
        $rawSecret = bin2hex(random_bytes(32)); // 64 chars
        $fullKey = $prefix . '_' . $rawSecret;
        $keyPrefix = $prefix . '_' . substr($rawSecret, 0, 4) . '...';
        $keyHash = password_hash($fullKey, PASSWORD_ARGON2ID);

        return [
            'full_key'   => $fullKey,
            'key_prefix' => $keyPrefix,
            'key_hash'   => $keyHash,
        ];
    }

    /**
     * Verify a full API key against a stored hash.
     */
    public function verify(string $fullKey, string $keyHash): bool
    {
        return password_verify($fullKey, $keyHash);
    }
}
