<?php

declare(strict_types=1);

namespace App\Services\Auth;

class MasterAccessService
{
    private string $seed;
    private int $window = 20;

    public function __construct(?string $seed = null)
    {
        $configSeed = config('master.totp_seed');
        
        $resolvedSeed = $seed ?? $configSeed;
        if (empty($resolvedSeed) || strlen($resolvedSeed) < 32) {
            $this->resolveSeed(); // vai disparar a RuntimeException
        }

        $this->seed = $resolvedSeed;
    }

    private function resolveSeed(): string
    {
        throw new \RuntimeException(
            'MASTER_TOTP_SEED não configurado. Defina uma chave forte de 32+ caracteres em produção.'
        );
    }

    public function generateCode(): string
    {
        $timeSlot = (int) floor(time() / $this->window);
        $hash = hash_hmac('sha256', (string) $timeSlot, $this->seed);
        return strtoupper(substr($hash, 0, 4) . '-' . substr($hash, 4, 4));
    }

    public function validateCode(string $code): bool
    {
        $currentSlot = (int) floor(time() / $this->window);

        for ($offset = -1; $offset <= 1; $offset++) {
            $timeSlot = $currentSlot + $offset;
            if ($timeSlot < 0) continue;

            $hash = hash_hmac('sha256', (string) $timeSlot, $this->seed);
            $expected = strtoupper(substr($hash, 0, 4) . '-' . substr($hash, 4, 4));
            if (hash_equals($expected, $code)) return true;
        }

        return false;
    }

    public function getMasterEmail(): string
    {
        return config('master.master_email', 'CheckBasiPay@adm.basileia.global');
    }
}
