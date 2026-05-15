<?php

namespace Basileia;

class BasileiaClient
{
    private string $apiKey;
    private string $baseUrl;
    private string $environment;

    public function __construct(array $config)
    {
        $this->apiKey      = $config['api_key']     ?? throw new \Exception('API key obrigatória.');
        $this->environment = $config['environment'] ?? 'sandbox';
        $this->baseUrl     = $config['base_url']
            ?? ($this->environment === 'production'
                ? 'https://api.basileia.global/v1'
                : 'https://sandbox.basileia.global/v1');
    }

    public function checkouts(): CheckoutResource
    {
        return new CheckoutResource($this);
    }

    public function request(string $method, string $path, array $options = []): array
    {
        $headers = [
            'Authorization: Bearer ' . $this->apiKey,
            'Content-Type: application/json',
            'X-Basileia-SDK: php/1.0.0',
            'X-Request-Id: ' . $this->uuid(),
        ];

        if (!empty($options['idempotency_key'])) {
            $headers[] = 'Idempotency-Key: ' . $options['idempotency_key'];
        }

        $ch = curl_init($this->baseUrl . $path);
        curl_setopt_array($ch, [
            CURLOPT_CUSTOMREQUEST  => $method,
            CURLOPT_HTTPHEADER     => $headers,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT        => 15,
            CURLOPT_SSL_VERIFYPEER => true,
        ]);

        if (!empty($options['body'])) {
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($options['body']));
        }

        $response   = curl_exec($ch);
        $statusCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        $data = json_decode($response, true);

        if ($statusCode >= 400) {
            throw new \Exception($data['message'] ?? 'Erro na API');
        }

        return $data;
    }

    private function uuid(): string
    {
        return sprintf('%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
            mt_rand(0, 0xffff), mt_rand(0, 0xffff),
            mt_rand(0, 0xffff),
            mt_rand(0, 0x0fff) | 0x4000,
            mt_rand(0, 0x3fff) | 0x8000,
            mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
        );
    }
}
