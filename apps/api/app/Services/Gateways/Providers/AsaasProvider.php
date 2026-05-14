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

    public function generatePix(GatewayAccount $account, Order $order, array $customer): array
    {
        $apiKey = $this->getApiKey($account);

        // 1. Criar a cobrança no Asaas
        $response = Http::withHeaders(['access_token' => $apiKey])
            ->post($this->baseUrl . '/payments', [
                'customer'    => $this->getOrCreateCustomer($account, $customer),
                'billingType' => 'PIX',
                'value'       => $order->amount / 100, // Asaas usa decimal
                'dueDate'     => now()->addDays(1)->format('Y-m-d'),
                'externalReference' => $order->uuid,
                'description' => "Pedido #{$order->external_order_id}",
            ]);

        if (!$response->successful()) {
            Log::error("Erro Asaas (Payment): " . $response->body());
            throw new \Exception("Erro ao gerar cobrança no Asaas.");
        }

        $paymentData = $response->json();
        $asaasId = $paymentData['id'];

        // 2. Buscar o QR Code do PIX
        $qrResponse = Http::withHeaders(['access_token' => $apiKey])
            ->get($this->baseUrl . "/payments/{$asaasId}/pixQrCode");

        if (!$qrResponse->successful()) {
            Log::error("Erro Asaas (QRCode): " . $qrResponse->body());
            throw new \Exception("Erro ao recuperar QR Code do Asaas.");
        }

        $qrData = $qrResponse->json();

        return [
            'transaction_id' => $asaasId,
            'status'         => 'pending',
            'pix_qrcode'     => $qrData['encodedImage'] ?? $qrData['payload'],
            'pix_url'        => $paymentData['invoiceUrl'],
            'raw_response'   => $paymentData
        ];
    }

    public function processCreditCard(GatewayAccount $account, Order $order, array $cardData, array $customer): array
    {
        // Implementação básica de Cartão para V1 (Futuro)
        throw new \Exception("Método Cartão não implementado para Asaas na V1.");
    }

    public function cancelPayment(GatewayAccount $account, string $externalId): bool
    {
        $apiKey = $this->getApiKey($account);
        $response = Http::withHeaders(['access_token' => $apiKey])
            ->delete($this->baseUrl . "/payments/{$externalId}");

        return $response->successful();
    }

    public function refundPayment(GatewayAccount $account, string $externalId, ?float $amount = null): bool
    {
        $apiKey = $this->getApiKey($account);
        $payload = [];
        if ($amount) $payload['value'] = $amount;

        $response = Http::withHeaders(['access_token' => $apiKey])
            ->post($this->baseUrl . "/payments/{$externalId}/refund", $payload);

        return $response->successful();
    }

    /**
     * Recupera a API Key criptografada da conta.
     */
    protected function getApiKey(GatewayAccount $account): string
    {
        $credential = $account->credentials()->where('key', 'api_key')->first();
        if (!$credential) {
            throw new \Exception("API Key não encontrada para a conta de gateway {$account->name}");
        }
        return $credential->value; // O Model GatewayCredential já faz o decrypt automático
    }

    /**
     * Helper para buscar ou criar cliente no Asaas.
     */
    protected function getOrCreateCustomer(GatewayAccount $account, array $customerData): string
    {
        $apiKey = $this->getApiKey($account);
        
        // Simples: Criar sempre um novo ou buscar por email na V2
        // Para a V1, vamos criar um cliente "on-the-fly"
        $response = Http::withHeaders(['access_token' => $apiKey])
            ->post($this->baseUrl . '/customers', [
                'name'  => $customerData['name'],
                'email' => $customerData['email'],
                'cpfCnpj' => $customerData['document'] ?? null,
            ]);

        return $response->json('id');
    }
}
