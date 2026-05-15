<?php

namespace App\Integrations\Asaas;

use App\Integrations\Asaas\Exceptions\AsaasException;
use Illuminate\Support\Facades\Http;

class AsaasClient
{
    public function __construct(
        private readonly string $apiKey,
        private readonly string $baseUrl,
        private readonly string $environment,
    ) {}

    public function createPixCharge(array $data): array
    {
        $response = Http::withHeaders([
            'access_token' => $this->apiKey,
            'User-Agent'   => 'BasileiaPay/1.0',
        ])
        ->timeout(15)
        ->post("{$this->baseUrl}/payments", [
            'customer'          => $data['customer_asaas_id'],
            'billingType'       => 'PIX',
            'value'             => $data['amount'] / 100,
            'dueDate'           => now()->addHours(1)->toDateString(),
            'externalReference' => $data['payment_uuid'],
            'description'       => $data['description'] ?? 'Basileia Pay',
        ]);

        if (!$response->successful()) {
            throw new AsaasException(
                'Falha ao criar cobrança PIX',
                $response->status(),
                $this->maskAsaasResponse($response->json() ?? [])
            );
        }

        return $response->json();
    }

    public function getQrCode(string $paymentId): array
    {
        $response = Http::withHeaders(['access_token' => $this->apiKey])
            ->timeout(10)
            ->get("{$this->baseUrl}/payments/{$paymentId}/pixQrCode");

        return $response->json();
    }

    public function createCustomer(array $data): array
    {
        $response = Http::withHeaders([
            'access_token' => $this->apiKey,
            'User-Agent'   => 'BasileiaPay/1.0',
        ])
        ->timeout(15)
        ->post("{$this->baseUrl}/customers", [
            'name'                 => $data['name'],
            'cpfCnpj'              => $data['document'] ?? null,
            'email'                => $data['email'] ?? null,
            'phone'                => $data['phone'] ?? null,
            'externalReference'    => $data['customer_uuid'] ?? null,
        ]);

        if (!$response->successful()) {
             throw new AsaasException(
                'Falha ao criar cliente Asaas',
                $response->status(),
                $this->maskAsaasResponse($response->json() ?? [])
            );
        }

        return $response->json();
    }

    private function maskAsaasResponse(array $data): array
    {
        $mask = ['access_token', 'apiKey', 'token'];
        foreach ($mask as $field) {
            if (isset($data[$field])) $data[$field] = '[MASKED]';
        }
        return $data;
    }
}
