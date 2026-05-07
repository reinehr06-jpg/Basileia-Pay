<?php

namespace App\Services\Gateways;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AsaasGateway implements PaymentGatewayInterface
{
    private function getHeaders(): array
    {
        return [
            'access_token' => config('services.asaas.api_key'),
            'Content-Type' => 'application/json',
        ];
    }

    private function getBaseUrl(): string
    {
        $isSandbox = config('services.asaas.environment', env('APP_ENV', 'sandbox')) === 'sandbox';
        return $isSandbox
            ? config('services.asaas.base_url_sandbox', 'https://sandbox.asaas.com/api/v3')
            : config('services.asaas.base_url_production', 'https://api.asaas.com/v3');
    }

    public function createCustomer(array $data): string
    {
        $response = Http::withHeaders($this->getHeaders())
            ->post("{$this->getBaseUrl()}/customers", [
                'name' => $data['name'],
                'email' => $data['email'],
                'phone' => preg_replace('/\D/', '', $data['phone'] ?? ''),
                'cpfCnpj' => preg_replace('/\D/', '', $data['document'] ?? ''),
                'postalCode' => preg_replace('/\D/', '', $data['zip'] ?? ''),
                'addressNumber' => 's/n',
            ]);

        $json = $response->json();
        if (!$response->successful()) {
            throw new \Exception("Asaas createCustomer error: " . json_encode($json));
        }

        return $json['id'];
    }

    public function charge(array $input, string $customerId): array
    {
        $installments = $input['installments'] ?? 1;
        $amountBRL = $input['amountBRL'];

        $payload = [
            'customer' => $customerId,
            'billingType' => 'CREDIT_CARD',
            'value' => $amountBRL,
            'dueDate' => now()->format('Y-m-d'),
            'description' => $input['description'],
            'remoteIp' => $input['remoteIp'],
            'creditCard' => [
                'holderName' => $input['cardHolderName'],
                'number' => preg_replace('/\D/', '', $input['cardToken']), // Using token as number for Asaas compatibility if tokenization isn't active
                'expiryMonth' => explode('/', $input['cardExpiry'])[0],
                'expiryYear' => explode('/', $input['cardExpiry'])[1],
                'ccv' => $input['cardCvv'],
            ],
            'creditCardHolderInfo' => [
                'name' => $input['cardHolderName'],
                'email' => 'cupom@basileia.global', // default fallback
                'cpfCnpj' => preg_replace('/\D/', '', $input['cardToken']), // placeholder
                'postalCode' => '00000000',
                'addressNumber' => '1',
                'phone' => '0000000000',
            ],
        ];

        if ($installments > 1) {
            $payload['installmentCount'] = $installments;
            $payload['installmentValue'] = round($amountBRL / $installments, 2);
        }

        $response = Http::withHeaders($this->getHeaders())
            ->post("{$this->getBaseUrl()}/payments", $payload);

        $json = $response->json();

        if (!$response->successful()) {
            throw new \Exception("Asaas charge error: " . json_encode($json));
        }

        return [
            'success' => $json['status'] !== 'DECLINED',
            'gatewayId' => $json['id'],
            'status' => $json['status'],
            'installments' => $installments,
            'amountCharged' => $amountBRL,
            'raw' => $json,
        ];
    }

    public function createSubscription(array $input, string $customerId): array
    {
        $installments = $input['installments'] ?? 12;
        $amountBRL = $input['amountBRL'];
        $monthlyValue = round($amountBRL / $installments, 2);

        $payload = [
            'customer' => $customerId,
            'billingType' => 'CREDIT_CARD',
            'value' => $monthlyValue,
            'cycle' => 'MONTHLY',
            'maxPayments' => $installments,
            'nextDueDate' => now()->format('Y-m-d'),
            'description' => $input['description'],
            'remoteIp' => $input['remoteIp'],
            'creditCard' => [
                'holderName' => $input['cardHolderName'],
                'number' => preg_replace('/\D/', '', $input['cardToken']),
                'expiryMonth' => explode('/', $input['cardExpiry'])[0],
                'expiryYear' => explode('/', $input['cardExpiry'])[1],
                'ccv' => $input['cardCvv'],
            ],
            'creditCardHolderInfo' => [
                'name' => $input['cardHolderName'],
                'email' => 'cupom@basileia.global',
                'cpfCnpj' => preg_replace('/\D/', '', $input['cardToken']),
                'postalCode' => '00000000',
                'addressNumber' => '1',
                'phone' => '0000000000',
            ],
        ];

        $response = Http::withHeaders($this->getHeaders())
            ->post("{$this->getBaseUrl()}/subscriptions", $payload);

        $json = $response->json();

        if (!$response->successful()) {
            throw new \Exception("Asaas subscription error: " . json_encode($json));
        }

        return [
            'success' => true,
            'gatewayId' => $json['id'],
            'status' => $json['status'],
            'installments' => $installments,
            'amountCharged' => $monthlyValue,
            'raw' => $json,
        ];
    }

    public function chargeViaPix(array $input, string $customerId): array
    {
        $amountBRL = $input['amountBRL'];

        $payload = [
            'customer' => $customerId,
            'billingType' => 'PIX',
            'value' => $amountBRL,
            'dueDate' => now()->format('Y-m-d'),
            'description' => $input['description'] ?? 'Pagamento Pix',
            'remoteIp' => $input['remoteIp'],
        ];

        $response = Http::withHeaders($this->getHeaders())
            ->post("{$this->getBaseUrl()}/payments", $payload);

        $json = $response->json();

        if (!$response->successful()) {
            throw new \Exception("Asaas Pix charge error: " . json_encode($json));
        }

        $paymentId = $json['id'];

        // Now we need to fetch the QR Code payload
        $qrResponse = Http::withHeaders($this->getHeaders())
            ->get("{$this->getBaseUrl()}/payments/{$paymentId}/pixQrCode");

        $qrJson = $qrResponse->json();

        if (!$qrResponse->successful()) {
            throw new \Exception("Asaas Pix QR Code error: " . json_encode($qrJson));
        }

        return [
            'success' => true,
            'gatewayId' => $paymentId,
            'status' => $json['status'],
            'amountCharged' => $amountBRL,
            'qrCodeBase64' => $qrJson['encodedImage'] ?? '',
            'qrCodePayload' => $qrJson['payload'] ?? '',
            'expiresAt' => $qrJson['expirationDate'] ?? now()->addMinutes(30)->toIso8601String(),
            'raw' => array_merge($json, ['qrCode' => $qrJson]),
        ];
    }
}
