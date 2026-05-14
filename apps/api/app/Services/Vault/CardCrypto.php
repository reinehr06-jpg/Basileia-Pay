<?php

namespace App\Services\Vault;

class CardCrypto
{
    /**
     * Criptografa os dados sensíveis do cartão usando AES-256-GCM.
     */
    public static function encrypt(int $companyId, array $cardData): array
    {
        $key = VaultKeyService::forCompany($companyId);

        $plaintext = json_encode([
            'pan'    => $cardData['number'],
            'exp'    => $cardData['expiry'],
        ]);

        $iv  = random_bytes(12); // GCM recomendado com 96-bit IV
        $tag = '';

        $ciphertext = openssl_encrypt(
            $plaintext,
            'aes-256-gcm',
            $key,
            OPENSSL_RAW_DATA,
            $iv,
            $tag
        );

        if ($ciphertext === false) {
            throw new \RuntimeException('Falha ao criptografar dados do cartão.');
        }

        return [
            'ciphertext' => $ciphertext,
            'iv'         => $iv,
            'tag'        => $tag,
        ];
    }

    /**
     * Descriptografa os dados sensíveis do cartão.
     */
    public static function decrypt(int $companyId, string $ciphertext, string $iv, string $tag): array
    {
        $key = VaultKeyService::forCompany($companyId);

        $plaintext = openssl_decrypt(
            $ciphertext,
            'aes-256-gcm',
            $key,
            OPENSSL_RAW_DATA,
            $iv,
            $tag
        );

        if ($plaintext === false) {
            throw new \RuntimeException('Falha na descriptografia do cartão.');
        }

        return json_decode($plaintext, true);
    }
}
