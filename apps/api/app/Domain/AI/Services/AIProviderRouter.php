<?php

namespace App\Domain\AI\Services;

use App\Models\AiProvider;
use Illuminate\Support\Facades\Crypt;

class AIProviderRouter
{
    public function resolve(int $companyId, string $feature): AiProvider
    {
        $custom = AiProvider::where('company_id', $companyId)
            ->where('status', 'active')
            ->first();

        if ($custom) return $custom;

        $platform = AiProvider::whereNull('company_id')
            ->where('status', 'active')
            ->first();

        if (!$platform) {
            throw new \Exception("Nenhum provedor de IA configurado.");
        }

        return $platform;
    }

    public function encryptKey(string $key): string
    {
        return Crypt::encryptString($key);
    }

    public function decryptKey(string $encrypted): string
    {
        return Crypt::decryptString($encrypted);
    }
}
