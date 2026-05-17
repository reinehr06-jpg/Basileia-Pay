<?php

namespace App\Services\Gateways\Providers;

use App\Services\Gateways\Contracts\GatewayProvider;
use App\Models\GatewayAccount;
use App\Models\Order;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class PagSeguroProvider implements GatewayProvider
{
    protected $baseUrl = 'https://api.pagseguro.com';

    public function chargeViaPix(GatewayAccount $account, Order $order, array $customer): array
    {
        $token = $this->getToken($account);

        $response = Http::withToken($token)
            ->post($this->baseUrl . '/orders', [
                'reference_id' => $order->uuid,
                'customer' => [
                    'name' => $customer['name'],
                    'email' => $customer['email'],
                    'tax_id' => preg_replace('/[^0-9]/', '', $customer['document']),
                ],
                'qr_codes' => [
                    [
                        'amount' => ['value' => $order->amount],
                        'expiration_date' => now()->addMinutes(30)->toRfc3339String(),
                    ]
                ]
            ]);

        $data = $response->json();

        if (!$response->successful()) {
            Log::error("PagSeguro API Error (Pix): " . $response->body());
            throw new \Exception("Erro ao gerar PIX no PagSeguro.");
        }

        return [
            'transaction_id' => $data['id'],
            'status'         => 'pending',
            'pix_qrcode'     => $data['qr_codes'][0]['text'] ?? null,
            'pix_url'        => $data['links'][0]['href'] ?? null,
            'raw_response'   => $data
        ];
    }

    public function chargeViaCard(GatewayAccount $account, Order $order, array $customer, array $card): array
    {
        // PagSeguro exige criptografia de cartão via SDK no front-end para gerar um token.
        // Na V1, vamos retornar erro humano se não houver o token.
        throw new \Exception("PagSeguro Card exige tokenização via SDK no front-end.");
    }

    public function chargeViaBoleto(GatewayAccount $account, Order $order, array $customer): array
    {
        throw new \Exception("PagSeguro Boleto não implementado nesta versão.");
    }

    public function cancel(GatewayAccount $account, string $externalId): bool
    {
        return false;
    }

    public function refund(GatewayAccount $account, string $externalId, ?float $amount = null): bool
    {
        return false;
    }

    protected function getToken(GatewayAccount $account): string
    {
        $credential = $account->credentials()->where('key', 'api_token')->first();
        if (!$credential) throw new \Exception("PagSeguro API Token não encontrado.");
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
