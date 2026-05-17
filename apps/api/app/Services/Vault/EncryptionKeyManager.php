<?php

namespace App\Services\Vault;

use Illuminate\Support\Facades\Crypt;

class EncryptionKeyManager
{
    /**
     * Obtém a versão atual da chave mestra do ambiente.
     */
    public function getCurrentVersion(): string
    {
        return config('vault.master_key_version', 'v1');
    }

    /**
     * Retorna a chave de criptografia para uma versão específica.
     * Em um cenário real, isso buscaria em um Secret Manager (AWS KMS, GCP Secret Manager).
     */
    public function getKeyForVersion(string $version): string
    {
        // Fallback para APP_KEY se não houver chaves específicas de vault
        return config("vault.keys.{$version}", config('app.key'));
    }
}
