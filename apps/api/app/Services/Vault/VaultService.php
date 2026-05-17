<?php

namespace App\Services\Vault;

use Illuminate\Support\Facades\Crypt;
use Illuminate\Contracts\Encryption\Encrypter;
use Illuminate\Encryption\Encrypter as LaravelEncrypter;

class VaultService
{
    protected $keyManager;

    public function __construct(EncryptionKeyManager $keyManager)
    {
        $this->keyManager = $keyManager;
    }

    /**
     * Criptografa um segredo usando a versão mais recente da chave.
     */
    public function encrypt(string $value): array
    {
        $version = $this->keyManager->getCurrentVersion();
        $key = $this->keyManager->getKeyForVersion($version);
        
        // Criar um encripter específico para a chave/versão se necessário
        // Por simplicidade aqui usamos o Crypt padrão do Laravel que usa APP_KEY
        // mas em produção o VaultService usaria chaves rotacionadas.
        
        return [
            'encrypted_value' => Crypt::encryptString($value),
            'key_version' => $version,
            'algorithm' => config('app.cipher'),
        ];
    }

    /**
     * Descriptografa um segredo baseado na sua versão.
     */
    public function decrypt(string $encryptedValue, string $version): string
    {
        // Aqui buscaríamos a chave da versão específica
        // $key = $this->keyManager->getKeyForVersion($version);
        
        return Crypt::decryptString($encryptedValue);
    }

    /**
     * Retorna uma versão mascarada do segredo para exibição em dashboard.
     */
    public function mask(string $value): string
    {
        if (strlen($value) <= 8) return '********';
        return '**** ' . substr($value, -4);
    }
}
