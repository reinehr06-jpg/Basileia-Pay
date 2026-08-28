<?php

namespace App\Services\Vault;

/**
 * Stub for future HashiCorp Vault integration.
 *
 * To implement:
 *   1. Install `smithy-vault` or use Vault HTTP API
 *   2. Replace this class with actual Vault transit engine calls
 *   3. KEK lives in Vault transit engine — encrypt/decrypt via API
 *   4. Enable auto-unseal via cloud KMS (GCP CKMS / AWS KMS)
 */
class HashiCorpVault implements VaultInterface
{
    protected $client;
    protected $token;
    protected $url;

    public function __construct()
    {
        $this->token = config('security.vault.token');
        $this->url = config('security.vault.url', 'http://127.0.0.1:8200');

        if (!$this->token) {
            \Illuminate\Support\Facades\Log::warning('HashiCorpVault token not configured, using fallback.');
        }

        $this->client = \Illuminate\Support\Facades\Http::withHeaders([
            'X-Vault-Token' => $this->token,
        ])->baseUrl($this->url . '/v1/transit');
    }

    public function encrypt(string $plaintext): string
    {
        $response = $this->client->post('/encrypt/basileia-cards', [
            'plaintext' => base64_encode($plaintext)
        ]);

        if ($response->failed()) {
            throw new \RuntimeException('Vault Encrypt API error: ' . $response->body());
        }

        return $response->json('data.ciphertext');
    }

    public function decrypt(string $ciphertext): string
    {
        $response = $this->client->post('/decrypt/basileia-cards', [
            'ciphertext' => $ciphertext
        ]);

        if ($response->failed()) {
            throw new \RuntimeException('Vault Decrypt API error: ' . $response->body());
        }

        return base64_decode($response->json('data.plaintext'));
    }

    public function keyVersion(): int
    {
        return 1;
    }
}
