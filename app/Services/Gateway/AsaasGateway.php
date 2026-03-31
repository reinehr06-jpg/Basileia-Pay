<?php

namespace App\Services\Gateway;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class AsaasGateway implements GatewayInterface
{
    private string $apiKey;

    public function __construct()
    {
        $this->apiKey = config('services.asaas.api_key');
    }

    private function getBaseUrl(): string
    {
        $sandbox = config('services.asaas.sandbox', true);

        return $sandbox
            ? 'https://sandbox.asaas.com/api/v3'
            : 'https://api.asaas.com/api/v3';
    }

    private function request(string $method, string $endpoint, array $data = []): array
    {
        $response = Http::withHeaders([
            'access_token' => $this->apiKey,
            'Content-Type' => 'application/json',
        ])->timeout(30)->{$method}("{$this->getBaseUrl()}{$endpoint}", $data);

        if (!$response->successful()) {
            $body = $response->json();
            $message = $body['errors'][0]['description'] ?? 'Gateway request failed';
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

        if (!empty($data['installment_count'])) {
            $payload['installmentCount'] = $data['installment_count'];
            $payload['totalValue'] = $data['total_value'] ?? $data['value'];
        }

        if (!empty($data['split'])) {
            $payload['split'] = $data['split'];
        }

        if (!empty($data['credit_card'])) {
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
