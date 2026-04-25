<?php

namespace App\Services\Gateway;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AsaasGateway implements GatewayInterface
{
    private function getApiKey(): ?string
    {
        return config('services.asaas.api_key');
    }

    private function getBaseUrl(): string
    {
        $environment = config('services.asaas.environment', 'sandbox');

        return $environment === 'sandbox'
            ? config('services.asaas.base_url_sandbox', 'https://sandbox.asaas.com/api/v3')
            : config('services.asaas.base_url_production', 'https://api.asaas.com/api/v3');
    }

    public function request(string $method, string $endpoint, array $data = []): array
    {
        $apiKey = $this->getApiKey();

        if (empty($apiKey)) {
            Log::warning('AsaasGateway: ASAAS_API_KEY not configured - skipping request');
            return ['error' => 'Gateway not configured', 'code' => 'GATEWAY_NOT_CONFIGURED'];
        }

        $response = Http::withHeaders([
            'access_token' => $apiKey,
            'Content-Type' => 'application/json',
        ])->timeout(30)->{$method}("{$this->getBaseUrl()}{$endpoint}", $data);

        if (! $response->successful()) {
            $body = $response->json();
            $message = $body['errors'][0]['description'] ?? 'Gateway request failed';

            Log::error('AsaasGateway Request Failed', [
                'endpoint' => $endpoint,
                'status' => $response->status(),
                'errors' => $body['errors'] ?? [],
            ]);

            throw new \RuntimeException("Asaas API Error: {$message}", $response->status());
        }

        return $response->json();
    }

    public function createCustomer(array $data): array
    {
        return $this->request('post', '/customers', [
            'name' => $data['name'],
            'cpfCnpj' => preg_replace('/\D/', '', $data['document']),
            'email' => $data['email'] ?? null,
            'phone' => $data['phone'] ?? null,
            'address' => $data['address'] ?? null,
            'addressNumber' => $data['address_number'] ?? null,
            'province' => $data['state'] ?? null,
            'postalCode' => $data['zip_code'] ?? null,
            'externalReference' => $data['external_reference'] ?? null,
        ]);
    }

    public function createPayment(array $data): array
    {
        $payload = [
            'customer' => $data['customer'],
            'billingType' => $data['billing_type'],
            'value' => $data['value'],
            'dueDate' => $data['due_date'],
            'description' => $data['description'] ?? null,
            'externalReference' => $data['external_reference'] ?? null,
        ];

        if (! empty($data['installment_count'])) {
            $payload['installmentCount'] = $data['installment_count'];
            $payload['totalValue'] = $data['total_value'] ?? $data['value'];
        }

        if (! empty($data['split'])) {
            $payload['split'] = $data['split'];
        }

        if (! empty($data['credit_card'])) {
            $payload['creditCard'] = $data['credit_card'];
            $payload['creditCardHolderInfo'] = $data['credit_card_holder'] ?? null;
            $payload['remoteIp'] = $data['ip'] ?? null;
        }

        return $this->request('post', '/payments', $payload);
    }

    public function createSubscription(array $data): array
    {
        return $this->request('post', '/subscriptions', [
            'customer' => $data['customer'],
            'billingType' => $data['billing_type'],
            'value' => $data['value'],
            'nextDueDate' => $data['next_due_date'],
            'cycle' => $data['cycle'],
            'description' => $data['description'] ?? null,
            'externalReference' => $data['external_reference'] ?? null,
        ]);
    }

    public function getPayment(string $paymentId): array
    {
        return $this->request('get', "/payments/{$paymentId}");
    }

    public function cancelPayment(string $paymentId): array
    {
        return $this->request('post', "/payments/{$paymentId}/cancel");
    }

    public function refundPayment(string $paymentId, ?float $amount = null): array
    {
        $data = [];

        if ($amount !== null) {
            $data['value'] = $amount;
        }

        return $this->request('post', "/payments/{$paymentId}/refund", $data);
    }

    public function generatePix(array $data): array
    {
        $data['billingType'] = 'PIX';

        return $this->createPayment($data);
    }

    public function generateBoleto(array $data): array
    {
        $data['billingType'] = 'BOLETO';

        return $this->createPayment($data);
    }

    public function processWebhook(Request $request): array
    {
        $payload = $request->all();

        $event = [
            'event' => $payload['event'] ?? '',
            'payment_id' => $payload['payment']['id'] ?? '',
            'payment_status' => $this->mapStatus($payload['payment']['status'] ?? ''),
            'value' => $payload['payment']['value'] ?? 0,
            'customer' => $payload['payment']['customer'] ?? '',
            'billing_type' => $payload['payment']['billingType'] ?? '',
            'webhook_id' => $payload['id'] ?? null,
            'raw' => $payload,
        ];

        return $event;
    }

    public function createSplit(array $data): array
    {
        return $this->request('post', '/payments', [
            'customer' => $data['customer'],
            'billingType' => $data['billing_type'],
            'value' => $data['value'],
            'dueDate' => $data['due_date'],
            'split' => $data['split'],
            'description' => $data['description'] ?? null,
            'externalReference' => $data['external_reference'] ?? null,
        ]);
    }

    public function getPixQrCode(string $paymentId): ?array
    {
        try {
            return $this->request('get', "/payments/{$paymentId}/pixQrCode");
        } catch (\Exception $e) {
            Log::error('AsaasGateway: Error fetching PIX QR Code', [
                'id' => $paymentId,
                'error' => $e->getMessage(),
            ]);

            return null;
        }
    }

    private function mapStatus(string $status): string
    {
        return match ($status) {
            'PENDING', 'AWAITING_RISK_ANALYSIS' => 'pending',
            'RECEIVED', 'CONFIRMED', 'RECEIVED_IN_CASH' => 'approved',
            'OVERDUE' => 'overdue',
            'REFUNDED', 'REFUND_REQUESTED', 'CHARGEBACK_REQUESTED', 'CHARGEBACK_DISPUTE', 'AWAITING_CHARGEBACK_REVERSAL' => 'refunded',
            'CANCELED' => 'cancelled',
            'DELETED' => 'deleted',
            default => 'unknown',
        };
    }
}
