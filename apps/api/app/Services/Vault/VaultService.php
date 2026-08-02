<?php

namespace App\Services\Vault;

use Illuminate\Encryption\Encrypter;
use Illuminate\Contracts\Encryption\Encrypter as EncrypterContract;

class VaultService
{
    protected EncryptionKeyManager $keyManager;
    protected array $encrypters = [];

    public function __construct(EncryptionKeyManager $keyManager)
    {
        $this->keyManager = $keyManager;
    }

    public function encrypt(string $value): array
    {
        $version = $this->keyManager->getCurrentVersion();
        $encrypter = $this->getEncrypterForVersion($version);
        
        return [
            'encrypted_value' => $encrypter->encryptString($value),
            'key_version' => $version,
            'algorithm' => 'AES-256-GCM',
        ];
    }

    public function decrypt(string $encryptedValue, string $version): string
    {
        $encrypter = $this->getEncrypterForVersion($version);
        return $encrypter->decryptString($encryptedValue);
    }

    public function mask(string $value): string
    {
        if (strlen($value) <= 8) return '********';
        return '**** ' . substr($value, -4);
    }

    /**
     * Resolve card token para dados do cartão (método estático para compatibilidade).
     */
    public static function resolveToken(int $companyId, string $cardToken): ?array
    {
        $service = app(self::class);
        // Implementar lógica de resolução de token
        // Por ora, retorna null (placeholder)
        return null;
    }

    private function getEncrypterForVersion(string $version): Encrypter
    {
        if (!isset($this->encrypters[$version])) {
            $key = $this->keyManager->getKeyForVersion($version);
            $this->encrypters[$version] = new Encrypter($key, 'AES-256-GCM');
        }
        
        return $this->encrypters[$version];
    }
}
