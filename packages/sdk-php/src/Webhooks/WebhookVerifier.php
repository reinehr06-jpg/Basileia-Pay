<?php

namespace Basileia\Webhooks;

class WebhookVerifier
{
    public static function verify(
        string $secret,
        string $rawBody,
        string $signature,
        string $timestamp,
        int    $maxAgeSeconds = 300
    ): bool {
        $ts  = (int) $timestamp;
        $now = time();

        if (abs($now - $ts) > $maxAgeSeconds) {
            throw new \Exception('Webhook fora da janela de tempo permitida.');
        }

        $expected = hash_hmac('sha256', "{$timestamp}.{$rawBody}", $secret);
        $received = str_replace('v1=', '', $signature);

        return hash_equals($expected, $received);
    }
}
