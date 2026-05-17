<?php

namespace App\Services\Gateways\Providers;

use App\Services\Gateways\Contracts\GatewayProvider;
use App\Models\GatewayAccount;
use App\Models\Order;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class StripeProvider implements GatewayProvider
{
    protected $baseUrl = 'https://api.stripe.com/v1';

    public function chargeViaPix(GatewayAccount $account, Order $order, array $customer): array
    {
        // Stripe PIX requires specific configuration and usually Payment Intents
        throw new \Exception("Stripe PIX não implementado nesta versão.");
    }

    public function chargeViaCard(GatewayAccount $account, Order $order, array $customer, array $card): array
    {
        $apiKey = $this->getSecretKey($account);

        // 1. Criar PaymentMethod (Simulado via API direta, Stripe recomenda SDK)
        // Para a V1, vamos focar em PaymentIntents com tokens
        
        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . $apiKey,
            'Content-Type' => 'application/x-www-form-urlencoded',
        ])->asForm()->post($this->baseUrl . '/payment_intents', [
            'amount' => $order->amount,
            'currency' => strtolower($order->currency ?? 'brl'),
            'payment_method_data' => [
                'type' => 'card',
                'card' => [
                    'number' => $card['number'],
                    'exp_month' => $card['expiration_month'],
                    'exp_year' => $card['expiration_year'],
                    'cvc' => $card['cvv'],
                ],
            ],
            'confirm' => 'true',
            'automatic_payment_methods' => [
                'enabled' => 'true',
                'allow_redirects' => 'never',
            ],
            'metadata' => [
                'order_uuid' => $order->uuid,
            ],
        ]);

        $data = $response->json();

        if (!$response->successful()) {
            Log::error("Stripe API Error (Card): " . $response->body());
            return [
                'status' => 'failed',
                'transaction_id' => $data['id'] ?? null,
                'raw_response' => $data
            ];
        }

        return [
            'transaction_id' => $data['id'],
            'status'         => $data['status'] === 'succeeded' ? 'approved' : 'processing',
            'brand'          => $data['payment_method_details']['card']['brand'] ?? null,
            'last4'          => substr($card['number'], -4),
            'raw_response'   => $data
        ];
    }

    public function chargeViaBoleto(GatewayAccount $account, Order $order, array $customer): array
    {
        throw new \Exception("Stripe Boleto não implementado nesta versão.");
    }

    public function cancel(GatewayAccount $account, string $externalId): bool
    {
        $apiKey = $this->getSecretKey($account);
        $response = Http::withToken($apiKey)->post($this->baseUrl . "/payment_intents/{$externalId}/cancel");
        return $response->successful();
    }

    public function refund(GatewayAccount $account, string $externalId, ?float $amount = null): bool
    {
        $apiKey = $this->getSecretKey($account);
        $payload = ['payment_intent' => $externalId];
        if ($amount) $payload['amount'] = (int)($amount * 100);

        $response = Http::withToken($apiKey)->post($this->baseUrl . "/refunds", $payload);
        return $response->successful();
    }

    protected function getSecretKey(GatewayAccount $account): string
    {
        $credential = $account->credentials()->where('key', 'secret_key')->first();
        if (!$credential) throw new \Exception("Stripe Secret Key não encontrada.");
        return $credential->value;
    }

    public function getPaymentStatus(GatewayAccount $account, string $externalId): array
    {
        throw new \Exception("Not implemented");
    }

    public function createCustomer(GatewayAccount $account, array $customerData): array
    {
        throw new \Exception("Not implemented");
    }

    public function createSplit(GatewayAccount $account, array $splitRules): array
    {
        throw new \Exception("Not implemented");
    }

    public function createSubscription(GatewayAccount $account, array $subscriptionData): array
    {
        throw new \Exception("Not implemented");
    }

    public function validateWebhook(GatewayAccount $account, array $payload, string $signature): bool
    {
        return true;
    }

    public function parseWebhook(GatewayAccount $account, array $payload): array
    {
        return $payload;
    }
}
