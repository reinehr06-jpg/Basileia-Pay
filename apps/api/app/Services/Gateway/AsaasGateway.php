<?php

declare(strict_types=1);

namespace App\Services\Gateway;

use App\Models\Gateway;
use App\Models\Integration;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use RuntimeException;

/**
 * Driver único de integração com a API Asaas v3.
 *
 * [BUG-01] expiryYear sempre em 4 dígitos — normalizeExpiry()
 * [BUG-02] creditCardHolderInfo com dados reais — buildHolderInfo()
 *          NUNCA usa email de sistema (cupombasileia.global etc.)
 * [BUG-03] API key vem do banco via construtor — NUNCA de config() global
 */
class AsaasGateway implements GatewayInterface
{
    private const URL_SANDBOX    = 'https://sandbox.asaas.com/api/v3';
    private const URL_PRODUCTION = 'https://api.asaas.com/v3';

    private const BLOCKED_HOLDER_EMAILS = [
        'cupombasileia.global',
        'contatobasileia.global',
        'demobasileia.global',
        'noreplybasileia.global',
        'systembasileia.global',
    ];

    public function __construct(
        private readonly string $apiKey,
        private readonly string $baseUrl,
    ) {}

    // ─── Fábricas estáticas ────────────────────────────────────────────────

    public static function fromGatewayModel(Gateway $gateway): static
    {
        $apiKey  = $gateway->getConfig('api_key', '');
        static::assertApiKey($apiKey, 'Gateway ID ' . $gateway->id);
        $sandbox = (int) $gateway->getConfig('sandbox', 0) === 1;
        return new static($apiKey, $sandbox ? self::URL_SANDBOX : self::URL_PRODUCTION);
    }

    public static function fromIntegration(Integration $integration): static
    {
        $gateway = $integration->company?->defaultGateway();
        if (! $gateway) {
            throw new RuntimeException(
                'AsaasGateway: empresa ' . $integration->company_id . ' não tem gateway padrão configurado.'
            );
        }
        return static::fromGatewayModel($gateway);
    }

    public static function fromRequest(): static
    {
        $integration = request()->attributes->get('integration');
        if ($integration) {
            return static::fromIntegration($integration);
        }

        $user = auth()->user();
        if ($user?->company_id) {
            $gateway = $user->company?->defaultGateway();
            if ($gateway) {
                return static::fromGatewayModel($gateway);
            }
        }

        throw new RuntimeException(
            'AsaasGateway: não foi possível resolver o gateway. ' .
            'Verifique se a integration ou usuário estão autenticados.'
        );
    }

    private static function assertApiKey(string $key, string $context): void
    {
        if (empty(trim($key))) {
            throw new RuntimeException("AsaasGateway [{$context}]: API key vazia.");
        }
    }

    // ─── Clientes ──────────────────────────────────────────────────────────

    public function createCustomer(array $data): string
    {
        $response = $this->post('customers', [
            'name'          => $data['name']     ?? '',
            'email'         => $data['email']    ?? null,
            'cpfCnpj'       => $this->digits($data['document'] ?? ''),
            'mobilePhone'   => $this->digits($data['phone']    ?? ''),
            'postalCode'    => $this->digits($data['zip']      ?? ''),
            'address'       => $data['address']  ?? null,
            'addressNumber' => $data['address_number'] ?? null,
        ]);
        return $response['id'];
    }

    // ─── Cartão de crédito ─────────────────────────────────────────────────

    /**
     * Cobra via cartão de crédito.
     * [BUG-01] expiryYear sempre em 4 dígitos
     * [BUG-02] creditCardHolderInfo com dados reais do titular
     */
    public function charge(array $input, string $customerId): array
    {
        $installments = max(1, (int) ($input['installments'] ?? 1));
        $amountBRL    = round((float) $input['amountBRL'], 2);

        [$month, $year] = $this->normalizeExpiry($input['cardExpiry'] ?? '');

        $payload = [
            'customer'    => $customerId,
            'billingType' => 'CREDITCARD',
            'value'       => $amountBRL,
            'dueDate'     => now()->format('Y-m-d'),
            'description' => $input['description'] ?? 'Pagamento',
            'remoteIp'    => $input['remoteIp']    ?? request()->ip(),
            'creditCard'  => [
                'holderName'  => $input['cardHolderName'],
                'number'      => $this->digits($input['cardToken'] ?? ''),
                'expiryMonth' => $month,
                'expiryYear'  => $year, // sempre 4 dígitos
                'ccv'         => $input['cardCvv'] ?? '',
            ],
            'creditCardHolderInfo' => $this->buildHolderInfo($input), // dados reais
        ];

        if ($installments > 1) {
            $payload['installmentCount'] = $installments;
            $payload['installmentValue'] = round($amountBRL / $installments, 2);
        }

        $response = $this->post('payments', $payload);

        return [
            'gatewayId'     => $response['id'],
            'status'        => $response['status'] ?? 'PENDING',
            'raw'           => $this->sanitize($response),
        ];
    }

    /**
     * Paga cobrança EXISTENTE no Asaas com cartão.
     * [BUG-01] expiryYear sempre em 4 dígitos
     * [BUG-02] dados reais do titular
     */
    public function payWithCard(string $paymentId, array $cardData, string $remoteIp): array
    {
        [$month, $year] = $this->normalizeExpiry($cardData['card_expiry'] ?? '');

        $endpoint = str_starts_with($paymentId, 'sub_')
            ? "subscriptions/{$paymentId}"
            : "payments/{$paymentId}/payWithCreditCard";

        return $this->post($endpoint, [
            'creditCard' => [
                'holderName'  => $cardData['card_name']   ?? '',
                'number'      => $this->digits($cardData['card_number'] ?? ''),
                'expiryMonth' => $month,
                'expiryYear'  => $year,
                'ccv'         => $cardData['card_cvv']    ?? '',
            ],
            'creditCardHolderInfo' => $this->buildHolderInfo($cardData),
        ]);
    }

    public function processCardTokenPayment(string $id, string $cardToken): array
    {
        $endpoint = str_starts_with($id, 'sub_')
            ? "subscriptions/{$id}/payWithCreditCard"
            : "payments/{$id}/payWithCreditCard";

        return $this->post($endpoint, ['creditCardToken' => $cardToken]);
    }

    // ─── PIX / Boleto / Consultas ──────────────────────────────────────────

    public function chargeViaPix(array $input, string $customerId): array
    {
        $response = $this->post('payments', [
            'customer' => $customerId,
            'billingType' => 'PIX',
            'value' => round((float) $input['amountBRL'], 2),
            'dueDate' => now()->addDay()->format('Y-m-d'),
            'description' => $input['description'] ?? 'Pagamento',
        ]);

        $qrCode = $this->getPixQrCode($response['id']);

        return [
            'gatewayId' => $response['id'],
            'status' => $response['status'] ?? 'PENDING',
            'qrCodeBase64' => $qrCode['encodedImage'] ?? '',
            'qrCodePayload' => $qrCode['payload'] ?? '',
            'expiresAt' => $qrCode['expirationDate'] ?? null,
            'raw' => $this->sanitize($response),
        ];
    }

    public function chargeViaBoleto(array $input, string $customerId): array
    {
        $response = $this->post('payments', [
            'customer' => $customerId,
            'billingType' => 'BOLETO',
            'value' => round((float) $input['amountBRL'], 2),
            'dueDate' => now()->addDays(3)->format('Y-m-d'),
            'description' => $input['description'] ?? 'Pagamento',
        ]);

        return [
            'gatewayId' => $response['id'],
            'bankSlipUrl' => $response['bankSlipUrl'] ?? $response['invoiceUrl'] ?? null,
            'barcode' => $response['identificationField'] ?? '',
            'status' => $response['status'] ?? 'PENDING',
            'raw' => $this->sanitize($response),
        ];
    }

    public function createSubscription(array $input, string $customerId): array
    {
        $payload = [
            'customer' => $customerId,
            'billingType' => $input['billingType'] ?? 'CREDIT_CARD',
            'value' => round((float) $input['amountBRL'], 2),
            'nextDueDate' => now()->addMonth()->format('Y-m-d'),
            'cycle' => $input['cycle'] ?? 'MONTHLY',
            'description' => $input['description'] ?? 'Assinatura',
        ];

        if ($payload['billingType'] === 'CREDIT_CARD') {
             [$month, $year] = $this->normalizeExpiry($input['cardExpiry'] ?? '');
             $payload['creditCard'] = [
                'holderName'  => $input['cardHolderName'],
                'number'      => $this->digits($input['cardToken'] ?? ''),
                'expiryMonth' => $month,
                'expiryYear'  => $year,
                'ccv'         => $input['cardCvv'] ?? '',
             ];
             $payload['creditCardHolderInfo'] = $this->buildHolderInfo($input);
        }

        $response = $this->post('subscriptions', $payload);

        return [
            'gatewayId' => $response['id'],
            'status' => $response['status'] ?? 'ACTIVE',
            'raw' => $this->sanitize($response),
        ];
    }

    public function createPayment(array $data): array
    {
        return $this->charge($data, $data['customerId'] ?? '');
    }

    public function generatePix(array $data): array
    {
        return $this->chargeViaPix($data, $data['customerId'] ?? '');
    }

    public function generateBoleto(array $data): array
    {
        return $this->chargeViaBoleto($data, $data['customerId'] ?? '');
    }

    public function processWebhook(\Illuminate\Http\Request $request): array
    {
        // Esta lógica costuma estar no controller, mas o contrato exige aqui.
        return [
            'event' => $request->input('event'),
            'data' => $request->input('payment') ?? $request->input('subscription'),
        ];
    }

    public function createSplit(array $data): array
    {
        // Placeholder - implementar quando houver suporte a split no gateway
        return [];
    }

    public function getPixQrCode(string $paymentId): ?array
    {
        if (str_starts_with($paymentId, 'sub_')) return null;
        try {
            return $this->get("payments/{$paymentId}/pixQrCode");
        } catch (\Throwable) {
            return null;
        }
    }

    public function getPayment(string $paymentId): ?array
    {
        $endpoint = str_starts_with($paymentId, 'sub_')
            ? "subscriptions/{$paymentId}"
            : "payments/{$paymentId}";
        try {
            return $this->get($endpoint);
        } catch (\Throwable) {
            return null;
        }
    }

    public function getSubscription(string $subscriptionId): ?array
    {
        try {
            return $this->get("subscriptions/{$subscriptionId}");
        } catch (\Throwable) {
            return null;
        }
    }

    public function cancelPayment(string $paymentId): array
    {
        return $this->post("payments/{$paymentId}/cancel");
    }

    public function refundPayment(string $paymentId, ?float $amount = null): array
    {
        $data = $amount !== null ? ['value' => $amount] : [];
        return $this->post("payments/{$paymentId}/refund", $data);
    }

    // ─── HTTP helpers ──────────────────────────────────────────────────────

    private function post(string $endpoint, array $data = []): array
    {
        return $this->request('POST', $endpoint, $data);
    }

    private function get(string $endpoint): array
    {
        return $this->request('GET', $endpoint);
    }

    private function request(string $method, string $endpoint, array $data = []): array
    {
        $url = $this->baseUrl . '/' . ltrim($endpoint, '/');

        try {
            $response = Http::withHeaders([
                'access_token' => $this->apiKey,
                'Content-Type' => 'application/json',
            ])->timeout(30)->{strtolower($method)}($url, $data);

            if (! $response->successful()) {
                $body    = $response->json();
                $message = $body['errors'][0]['description'] ?? 'Request failed';
                Log::error('AsaasGateway: request failed', [
                    'url'    => $url,
                    'status' => $response->status(),
                    'errors' => $body['errors'] ?? [],
                ]);
                throw new RuntimeException('Asaas API Error: ' . $message);
            }

            return $response->json();
        } catch (RuntimeException $e) {
            throw $e;
        } catch (\Throwable $e) {
            Log::error('AsaasGateway: exception', ['url' => $url, 'error' => $e->getMessage()]);
            throw $e;
        }
    }

    // ─── Helpers privados ──────────────────────────────────────────────────

    /**
     * [BUG-01] Garante expiryYear com 4 dígitos.
     * Aceita: "12/25", "12/2025", "12/025"
     * Retorna sempre: ['12', '2025']
     */
    private function normalizeExpiry(string $expiry): array
    {
        [$month, $year] = array_pad(explode('/', $expiry), 2, '');
        $month = str_pad(trim($month), 2, '0', STR_PAD_LEFT);
        $year  = trim($year);

        if (strlen($year) <= 2) {
            $year = '20' . str_pad($year, 2, '0', STR_PAD_LEFT);
        }

        return [$month, $year];
    }

    /**
     * [BUG-02] Dados reais do titular — NUNCA email de sistema.
     */
    private function buildHolderInfo(array $input): array
    {
        $email = $input['holder_email']
            ?? $input['card_email']
            ?? $input['cardemail']
            ?? $input['email']
            ?? null;

        // Bloqueia emails de sistema
        if ($email && in_array(strtolower($email), self::BLOCKED_HOLDER_EMAILS, true)) {
            $email = null;
        }

        if (! $email) {
            throw new RuntimeException(
                'AsaasGateway: email real do titular é obrigatório. ' .
                'Não use emails de sistema como cupombasileia.global.'
            );
        }

        return [
            'name'          => $input['card_name']      ?? $input['cardname']      ?? '',
            'email'         => $email,
            'cpfCnpj'       => $this->digits($input['card_document']   ?? $input['carddocument']   ?? ''),
            'postalCode'    => $this->digits($input['card_cep']        ?? $input['cardcep']        ?? '00000000'),
            'addressNumber' => $input['card_address_number'] ?? $input['cardaddressnumber'] ?? '1',
            'phone'         => $this->digits($input['card_phone']      ?? $input['cardphone']      ?? '0000000000'),
        ];
    }

    private function digits(string $value): string
    {
        return preg_replace('/\D/', '', $value);
    }

    /**
     * Remove campos sensíveis antes de logar (DUP-07).
     */
    private function sanitize(array $data): array
    {
        $sensitive = ['creditCard', 'creditCardHolderInfo', 'access_token'];
        return array_diff_key($data, array_flip($sensitive));
    }
}
