<?php

namespace App\Services\Gateways\Providers;

use App\Services\Gateways\Contracts\GatewayProvider;
use App\Models\GatewayAccount;
use App\Models\Order;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AsaasProvider implements GatewayProvider
{
    protected $baseUrl;

    public function __construct()
    {
        $this->baseUrl = config('services.asaas.url', 'https://api.asaas.com/v3');
    }

    public function chargeViaPix(GatewayAccount $account, Order $order, array $customer): array
    {
        $apiKey = $this->getApiKey($account);

        $response = Http::withHeaders(['access_token' => $apiKey])
            ->post($this->baseUrl . '/payments', [
                'customer'    => $this->getOrCreateCustomer($account, $customer),
                'billingType' => 'PIX',
                'value'       => $order->amount / 100,
                'dueDate'     => now()->addDays(1)->format('Y-m-d'),
                'externalReference' => $order->uuid,
                'description' => "Pedido #{$order->external_order_id}",
            ]);

        if (!$response->successful()) {
            Log::error("Asaas API Error (Pix): " . $response->body());
            throw new \Exception("Erro ao gerar PIX no Asaas: " . ($response->json('errors.0.description') ?? 'Desconhecido'));
        }

        $paymentData = $response->json();
        $asaasId = $paymentData['id'];

        $qrResponse = Http::withHeaders(['access_token' => $apiKey])
            ->get($this->baseUrl . "/payments/{$asaasId}/pixQrCode");

        $qrData = $qrResponse->json();

        return [
            'transaction_id' => $asaasId,
            'status'         => 'pending',
            'pix_qrcode'     => $qrData['payload'] ?? null,
            'pix_url'        => $paymentData['invoiceUrl'],
            'raw_response'   => $paymentData
        ];
    }

    public function chargeViaCard(GatewayAccount $account, Order $order, array $customer, array $card): array
    {
        $apiKey = $this->getApiKey($account);

        $response = Http::withHeaders(['access_token' => $apiKey])
            ->post($this->baseUrl . '/payments', [
                'customer'    => $this->getOrCreateCustomer($account, $customer),
                'billingType' => 'CREDIT_CARD',
                'value'       => $order->amount / 100,
                'dueDate'     => now()->format('Y-m-d'),
                'externalReference' => $order->uuid,
                'creditCard' => [
                    'holderName'  => $card['holder_name'],
                    'number'      => $card['number'],
                    'expiryMonth' => $card['expiration_month'],
                    'expiryYear'  => $card['expiration_year'],
                    'ccv'         => $card['cvv'],
                ],
                'creditCardHolderInfo' => [
                    'name'              => $customer['name'],
                    'email'             => $customer['email'],
                    'cpfCnpj'           => $customer['document'],
                    'postalCode'        => $customer['zipcode'] ?? '00000000',
                    'addressNumber'     => $customer['number'] ?? 'SN',
                    'phone'             => $customer['phone'] ?? '',
                ],
                'installments' => $card['installments'] ?? 1,
            ]);

        $data = $response->json();

        if (!$response->successful()) {
            Log::error("Asaas API Error (Card): " . $response->body());
            return [
                'status' => 'failed',
                'transaction_id' => $data['id'] ?? null,
                'raw_response' => $data
            ];
        }

        return [
            'transaction_id' => $data['id'],
            'status'         => strtolower($data['status']) === 'confirmed' ? 'approved' : 'processing',
            'brand'          => $data['creditCard']['brand'] ?? null,
            'last4'          => substr($card['number'], -4),
            'raw_response'   => $data
        ];
    }

    public function chargeViaBoleto(GatewayAccount $account, Order $order, array $customer): array
    {
        $apiKey = $this->getApiKey($account);

        $response = Http::withHeaders(['access_token' => $apiKey])
            ->post($this->baseUrl . '/payments', [
                'customer'    => $this->getOrCreateCustomer($account, $customer),
                'billingType' => 'BOLETO',
                'value'       => $order->amount / 100,
                'dueDate'     => now()->addDays(3)->format('Y-m-d'),
                'externalReference' => $order->uuid,
            ]);

        if (!$response->successful()) {
            Log::error("Asaas API Error (Boleto): " . $response->body());
            throw new \Exception("Erro ao gerar boleto no Asaas.");
        }

        $data = $response->json();

        return [
            'transaction_id' => $data['id'],
            'status'         => 'pending',
            'boleto_url'     => $data['bankSlipUrl'],
            'boleto_barcode' => $data['nossoNumero'], // Asaas as vezes retorna isso ou a linha digitável
            'raw_response'   => $data
        ];
    }

    public function cancel(GatewayAccount $account, string $externalId): bool
    {
        $apiKey = $this->getApiKey($account);
        $response = Http::withHeaders(['access_token' => $apiKey])
            ->delete($this->baseUrl . "/payments/{$externalId}");

        return $response->successful();
    }

    public function refund(GatewayAccount $account, string $externalId, ?float $amount = null): bool
    {
        $apiKey = $this->getApiKey($account);
        $payload = [];
        if ($amount) $payload['value'] = $amount;

        $response = Http::withHeaders(['access_token' => $apiKey])
            ->post($this->baseUrl . "/payments/{$externalId}/refund", $payload);

        return $response->successful();
    }

    protected function getApiKey(GatewayAccount $account): string
    {
        $credential = $account->credentials()->where('key', 'api_key')->first();
        if (!$credential) throw new \Exception("API Key não encontrada.");
        return $credential->value;
    }

    protected function getOrCreateCustomer(GatewayAccount $account, array $customerData): string
    {
        $apiKey = $this->getApiKey($account);
        
        $response = Http::withHeaders(['access_token' => $apiKey])
            ->post($this->baseUrl . '/customers', [
                'name'  => $customerData['name'],
                'email' => $customerData['email'],
                'cpfCnpj' => $customerData['document'] ?? null,
            ]);

        return $response->json('id');
    }

    public function createCustomer(GatewayAccount $account, array $customerData): array
    {
        $id = $this->getOrCreateCustomer($account, $customerData);
        return ['id' => $id];
    }

    public function getPaymentStatus(GatewayAccount $account, string $externalId): array
    {
        $apiKey = $this->getApiKey($account);
        $response = Http::withHeaders(['access_token' => $apiKey])
            ->get($this->baseUrl . "/payments/{$externalId}");

        if (!$response->successful()) {
            throw new \Exception("Erro ao buscar status do pagamento.");
        }

        return $response->json();
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
        return true; // Simplified for now
    }

    public function parseWebhook(GatewayAccount $account, array $payload): array
    {
        return $payload;
    }
}
