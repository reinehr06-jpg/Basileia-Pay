<?php

namespace App\Services\Vault;

use Illuminate\Support\Facades\Crypt;

class EncryptionKeyManager
{
    public function getCurrentVersion(): string
    {
        return (string) config('security.kek_version', 'v1');
    }

    public function getKeyForVersion(string $version): string
    {
        // Priorizar SECURITY_ENCRYPTION_KEY
        $securityKey = config('security.encryption_key');
        
        if (!empty($securityKey)) {
            // Remover prefixo "base64:" se presente
            if (str_starts_with($securityKey, 'base64:')) {
                $securityKey = substr($securityKey, 7);
            }
            return base64_decode($securityKey);
        }
        
        // Em desenvolvimento, gerar chave determinística a partir de APP_KEY
        if (app()->environment('local', 'testing')) {
            $appKey = config('app.key');
            if (str_starts_with($appKey, 'base64:')) {
                $appKey = substr($appKey, 7);
            }
            return base64_decode($appKey);
        }
        
        throw new \RuntimeException(
            'SECURITY_ENCRYPTION_KEY não configurada. Gere com: php -r "echo \'base64:\' . base64_encode(random_bytes(32));"'
        );
    }

    public function getCompanyKeyForVersion(string $version, int $companyId): string
    {
        $masterKey = $this->getKeyForVersion($version);
        // HKDF para derivar uma chave de 256-bit (32 bytes) única por company_id
        return hash_hkdf('sha256', $masterKey, 32, 'vault_company_' . $companyId);
    }
}
