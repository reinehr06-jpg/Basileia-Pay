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
        $vault = app(\App\Services\Vault\VaultService::class);
        return json_encode($vault->encrypt($key));
    }

    public function decryptKey(string $encrypted): string
    {
        $data = json_decode($encrypted, true);
        
        if (is_array($data) && isset($data['encrypted_value'], $data['key_version'])) {
            $vault = app(\App\Services\Vault\VaultService::class);
            return $vault->decrypt($data['encrypted_value'], $data['key_version']);
        }
        
        // Fallback para senhas antigas usando a APP_KEY normal
        return \Illuminate\Support\Facades\Crypt::decryptString($encrypted);
    }
}
