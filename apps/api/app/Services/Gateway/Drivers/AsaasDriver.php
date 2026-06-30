<?php

namespace App\Services\Gateway\Drivers;

use App\Services\Gateway\Contracts\GatewayDriverInterface;
use App\Services\Gateway\DTO\ChargeRequest;
use App\Services\Gateway\DTO\ChargeResponse;
use App\Services\Gateway\DTO\NormalizedEvent;
use Illuminate\Support\Facades\Http;
use Exception;

class AsaasDriver implements GatewayDriverInterface
{
    private string $baseUrl;
    private string $apiKey;

    public function __construct(array $credentials, string $environment)
    {
        $this->apiKey = $credentials['api_key'] ?? '';
        $this->baseUrl = $environment === 'production' 
            ? 'https://api.asaas.com/v3' 
            : 'https://sandbox.asaas.com/api/v3';
    }

    public function createCharge(ChargeRequest $request): ChargeResponse
    {
        // Simple scaffolding for Asaas
        try {
            $response = Http::withHeaders([
                'access_token' => $this->apiKey,
                'Content-Type' => 'application/json',
            ])->post("{$this->baseUrl}/payments", [
                'customer' => $request->customer['asaas_customer_id'] ?? null, // In a real scenario, you'd ensure customer exists first
                'billingType' => $this->mapPaymentMethod($request->paymentMethod),
                'value' => $request->amount,
                'dueDate' => now()->addDays(3)->format('Y-m-d'),
                'externalReference' => $request->reference,
            ]);

            if ($response->successful()) {
                $data = $response->json();
                return new ChargeResponse(
                    success: true,
                    status: 'pending',
                    gatewayPaymentId: $data['id'] ?? null,
                    pixQrCodeUrl: $data['invoiceUrl'] ?? null,
                    rawResponse: $data
                );
            }

            return new ChargeResponse(
                success: false,
                status: 'failed',
                errorMessage: $response->body(),
                rawResponse: $response->json() ?? []
            );

        } catch (Exception $e) {
            return new ChargeResponse(
                success: false,
                status: 'error',
                errorMessage: $e->getMessage()
            );
        }
    }

    public function parseWebhookEvent(array $payload): NormalizedEvent
    {
        $event = $payload['event'] ?? 'UNKNOWN';
        
        $statusMapping = [
            'PAYMENT_CONFIRMED' => 'paid',
            'PAYMENT_RECEIVED' => 'paid',
            'PAYMENT_OVERDUE' => 'failed',
            'PAYMENT_DELETED' => 'cancelled',
        ];

        return new NormalizedEvent(
            gatewayEventId: $payload['id'] ?? uniqid('asaas_'),
            eventType: $event,
            gatewayPaymentId: $payload['payment']['id'] ?? '',
            status: $statusMapping[$event] ?? 'pending',
            rawPayload: $payload
        );
    }

    public function verifySignature(string $rawBody, string $signature, string $secret): bool
    {
        // Asaas webhook signature verification (asaas-signature header)
        // Usually, Asaas doesn't use HMAC for all webhooks, but let's implement standard HMAC for demonstration, 
        // as Asaas does have a specific signature validation in newer versions.
        $calculated = hash_hmac('sha256', $rawBody, $secret);
        return hash_equals($calculated, $signature);
    }

    private function mapPaymentMethod(string $method): string
    {
        return match ($method) {
            'credit_card' => 'CREDIT_CARD',
            'pix' => 'PIX',
            'boleto' => 'BOLETO',
            default => 'PIX',
        };
    }
}
