<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AsaasPaymentService
{
    private function getApiKey(): ?string
    {
        return config('services.asaas.api_key', '');
    }

    private function getEnvironment(): string
    {
        return config('services.asaas.environment', env('APP_ENV', 'sandbox'));
    }

    private function getBaseUrl(): string
    {
        $env = $this->getEnvironment();
        return $env === 'sandbox'
            ? config('services.asaas.base_url_sandbox', 'https://sandbox.asaas.com/api/v3')
            : config('services.asaas.base_url_production', 'https://api.asaas.com/v3');
    }

    private function request(string $method, string $endpoint, array $data = []): array
    {
        $url = "{$this->getBaseUrl()}{$endpoint}";
        $apiKey = $this->getApiKey();

        try {
            if (empty($apiKey)) {
                Log::warning('AsaasPaymentService: ASAAS_API_KEY not configured - skipping request');
                return ['error' => 'Gateway not configured', 'code' => 'GATEWAY_NOT_CONFIGURED'];
            }

            $response = Http::withHeaders([
                'access_token' => $apiKey,
                'Content-Type' => 'application/json',
            ])->timeout(30)->{$method}($url, $data);

            if (! $response->successful()) {
                $body = $response->json();
                $message = $body['errors'][0]['description'] ?? 'Request failed';
                Log::error('AsaasPaymentService: Request failed', [
                    'url' => $url,
                    'environment' => $this->getEnvironment(),
                    'method' => $method,
                    'status' => $response->status(),
                    'errors' => $body['errors'] ?? [],
                ]);
                throw new \RuntimeException("Asaas API Error: {$message}");
            }

            return $response->json();
        } catch (\Exception $e) {
            Log::error('AsaasPaymentService: Exception', [
                'url' => $url,
                'error' => $e->getMessage(),
            ]);
            throw $e;
        }
    }

    /**
     * Get payment or subscription details.
     */
    public function getPayment(string $paymentId): ?array
    {
        try {
            // Asaas v3: subscriptions have a different endpoint
            $endpoint = str_starts_with($paymentId, 'sub_')
                ? "/subscriptions/{$paymentId}"
                : "/payments/{$paymentId}";

            return $this->request('GET', $endpoint);
        } catch (\Exception $e) {
            Log::warning('AsaasPaymentService: Record not found', [
                'id' => $paymentId,
                'environment' => $this->getEnvironment(),
            ]);

            return null;
        }
    }

    /**
     * Get PIX QR Code for a payment.
     */
    public function getPixQrCode(string $paymentId): ?array
    {
        try {
            // Subscriptions don't have QR codes directly; the individual initial payment does.
            // But if it's a payment ID, we can get the QR code.
            if (str_starts_with($paymentId, 'sub_')) {
                return null;
            }

            return $this->request('GET', "/payments/{$paymentId}/pixQrCode");
        } catch (\Exception $e) {
            return [];
        }
    }

    /**
     * Process a credit card payment using an existing payment ID or subscription ID.
     */
    public function processCardPayment(string $id, array $cardData, ?string $remoteIp = null): array
    {
        $expiry = explode('/', $cardData['card_expiry']);
        $month = trim($expiry[0] ?? '');
        $year = trim($expiry[1] ?? '');

        // Standard Asaas card payload
        $payload = [
            'creditCard' => [
                'holderName' => $cardData['card_name'],
                'number' => preg_replace('/\D/', '', $cardData['card_number']),
                'expiryMonth' => $month,
                'expiryYear' => $year,
                'ccv' => $cardData['card_cvv'],
            ],
            'creditCardHolderInfo' => [
                'name' => $cardData['card_name'],
                'email' => $cardData['card_email'] ?? 'cupom@basileia.global',
                'cpfCnpj' => preg_replace('/\D/', '', $cardData['card_document']),
                'postalCode' => preg_replace('/\D/', '', $cardData['card_cep'] ?? '00000000'),
                'addressNumber' => $cardData['card_address_number'] ?? '1',
                'phone' => preg_replace('/\D/', '', $cardData['card_phone'] ?? '0000000000'),
            ],
            'remoteIp' => $remoteIp ?? request()->ip(),
        ];

        $endpoint = str_starts_with($id, 'sub_')
            ? "/subscriptions/{$id}"
            : "/payments/{$id}/payWithCreditCard";

        return $this->request('POST', $endpoint, $payload);
    }
}
