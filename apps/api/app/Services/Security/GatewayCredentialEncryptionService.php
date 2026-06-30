<?php

namespace App\Services\Security;

use Illuminate\Support\Facades\Config;
use RuntimeException;

class GatewayCredentialEncryptionService
{
    /**
     * Encrypt a plaintext credential using AES-256-GCM (AEAD).
     *
     * @param string $plain
     * @param int|null $kekVersion
     * @return array
     */
    public function encrypt(string $plain, ?int $kekVersion = null): array
    {
        $key = $this->getKey();
        $kekVersion = $kekVersion ?? config('security.kek_version');
        
        $iv = random_bytes(openssl_cipher_iv_length('aes-256-gcm'));
        $tag = '';
        
        $ciphertext = openssl_encrypt($plain, 'aes-256-gcm', $key, OPENSSL_RAW_DATA, $iv, $tag);
        
        if ($ciphertext === false) {
            throw new RuntimeException('Encryption failed.');
        }

        // Return the combined payload
        $payload = base64_encode($iv) . ':' . base64_encode($tag) . ':' . base64_encode($ciphertext);

        return [
            'encrypted_value' => $payload,
            'kek_version' => $kekVersion,
        ];
    }

    /**
     * Decrypt a payload back to plaintext.
     *
     * @param string $payload
     * @return string
     */
    public function decrypt(string $payload): string
    {
        $key = $this->getKey();
        
        $parts = explode(':', $payload);
        if (count($parts) !== 3) {
            throw new RuntimeException('Invalid encrypted payload format.');
        }

        $iv = base64_decode($parts[0]);
        $tag = base64_decode($parts[1]);
        $ciphertext = base64_decode($parts[2]);

        $plain = openssl_decrypt($ciphertext, 'aes-256-gcm', $key, OPENSSL_RAW_DATA, $iv, $tag);

        if ($plain === false) {
            throw new RuntimeException('Decryption failed or payload tampered.');
        }

        return $plain;
    }

    /**
     * Rotate KEK versions.
     *
     * @param int $fromVersion
     * @param int $toVersion
     * @return void
     */
    public function rotate(int $fromVersion, int $toVersion): void
    {
        // Vault integration goes here
    }

    private function getKey(): string
    {
        $key64 = config('security.encryption_key');
        if (empty($key64)) {
            throw new RuntimeException('SECURITY_ENCRYPTION_KEY is not set.');
        }
        
        $key = base64_decode($key64);
        if (strlen($key) !== 32) {
            throw new RuntimeException('SECURITY_ENCRYPTION_KEY must be exactly 32 bytes when decoded.');
        }

        return $key;
    }
}
