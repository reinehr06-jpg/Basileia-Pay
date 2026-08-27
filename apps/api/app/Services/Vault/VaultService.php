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

    public function encrypt(string $value, ?int $companyId = null): array
    {
        $version = $this->keyManager->getCurrentVersion();
        $encrypter = $this->getEncrypterForVersion($version, $companyId);
        
        return [
            'encrypted_value' => $encrypter->encryptString($value),
            'key_version' => $version,
            'algorithm' => 'AES-256-GCM',
        ];
    }

    public function decrypt(string $encryptedValue, string $version, ?int $companyId = null): string
    {
        $encrypter = $this->getEncrypterForVersion($version, $companyId);
        return $encrypter->decryptString($encryptedValue);
    }

    public function mask(string $value): string
    {
        if (strlen($value) <= 8) return '********';
        return '**** ' . substr($value, -4);
    }

    /**
     * Resolve card token para dados do cartão descriptografados.
     */
    public static function resolveToken(int $companyId, string $cardToken): ?array
    {
        $service = app(self::class);
        
        $record = \Illuminate\Support\Facades\DB::table('card_vault')
            ->where('company_id', $companyId)
            ->where('card_token', $cardToken)
            ->first();

        if (!$record) {
            return null;
        }

        // Se usar o payload antigo com IV e TAG soltos (fallback)
        if (empty($record->key_version)) {
            $key = \App\Services\Vault\VaultKeyService::forCompany($companyId);
            $plaintext = openssl_decrypt(
                $record->ciphertext,
                'aes-256-gcm',
                $key,
                OPENSSL_RAW_DATA,
                $record->iv,
                $record->tag
            );
            if ($plaintext === false) return null;
            return json_decode($plaintext, true);
        }

        try {
            $decrypted = $service->decrypt($record->ciphertext, $record->key_version, $companyId);
            return json_decode($decrypted, true);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error("Falha ao resolver token de cartão", ['token' => $cardToken, 'error' => $e->getMessage()]);
            return null;
        }
    }

    private function getEncrypterForVersion(string $version, ?int $companyId = null): Encrypter
    {
        $cacheKey = $companyId ? "{$version}_{$companyId}" : $version;

        if (!isset($this->encrypters[$cacheKey])) {
            $key = $companyId 
                ? $this->keyManager->getCompanyKeyForVersion($version, $companyId)
                : $this->keyManager->getKeyForVersion($version);
                
            $this->encrypters[$cacheKey] = new Encrypter($key, 'AES-256-GCM');
        }
        
        return $this->encrypters[$cacheKey];
    }
}
