<?php

namespace App\Security\Encryption;

use Sodium;
use RuntimeException;

class EncryptionService
{
    /**
     * Encrypt a plaintext string using AES-256-GCM.
     */
    public function encrypt(string $plaintext): string
    {
        $key = base64_decode(config('security.encryption_key'));
        if ($key === false || strlen($key) !== SODIUM_CRYPTO_AEAD_AES256GCM_KEYBYTES) {
            throw new RuntimeException('Invalid encryption key configured.');
        }

        $nonce = random_bytes(SODIUM_CRYPTO_AEAD_AES256GCM_NPUBBYTES);

        $ciphertext = sodium_crypto_aead_aes256gcm_encrypt(
            $plaintext,
            '',
            $nonce,
            $key
        );

        return base64_encode($nonce . $ciphertext);
    }

    /**
     * Decrypt a ciphertext string.
     */
    public function decrypt(string $encrypted): string
    {
        $key = base64_decode(config('security.encryption_key'));
        if ($key === false) {
            throw new RuntimeException('Invalid encryption key configured.');
        }

        $data = base64_decode($encrypted);
        if ($data === false) {
            throw new RuntimeException('Invalid base64 ciphertext.');
        }

        $nonceSize = SODIUM_CRYPTO_AEAD_AES256GCM_NPUBBYTES;
        $nonce = substr($data, 0, $nonceSize);
        $ciphertext = substr($data, $nonceSize);

        $plaintext = sodium_crypto_aead_aes256gcm_decrypt(
            $ciphertext,
            '',
            $nonce,
            $key
        );

        if ($plaintext === false) {
            throw new RuntimeException('Decryption failed.');
        }

        return $plaintext;
    }
}
