<?php

declare(strict_types=1);

namespace App\Services\Gateway;

use App\Models\Gateway;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use RuntimeException;

/**
 * Driver de integração com a API PagBank (PagSeguro) v4.
 *
 * Segue o mesmo pattern de AsaasGateway:
 * - Construtor recebe (string $apiToken, string $baseUrl)
 * - Factory method fromGatewayModel(Gateway) lê configs criptografadas do banco
 * - Implementa GatewayInterface completa
 */
class PagBankGateway implements GatewayInterface
{
    private const URL_SANDBOX    = 'https://sandbox.api.pagseguro.com';
    private const URL_PRODUCTION = 'https://api.pagseguro.com';

    public function __construct(
        private readonly string $apiToken,
        private readonly string $baseUrl,
    ) {}

    // ─── Factory ───────────────────────────────────────────────────────────

    public static function fromGatewayModel(Gateway $gateway): static
    {
        $token   = $gateway->getConfig('api_token', '');
        if (empty(trim($token))) {
            throw new RuntimeException(
                "PagBankGateway: api_token vazio para Gateway ID {$gateway->id}."
            );
        }

        $sandbox = filter_var($gateway->getConfig('sandbox', '0'), FILTER_VALIDATE_BOOLEAN);
        $baseUrl = $sandbox ? self::URL_SANDBOX : self::URL_PRODUCTION;

        return new static($token, $baseUrl);
    }

    // ─── Clientes ──────────────────────────────────────────────────────────

    public function createCustomer(array $data): string
    {
        // PagBank não exige criação de customer separada para orders,
        // mas mantemos a interface. Retorna um ID placeholder.
        $response = $this->post('/customers', [
            'name'   => $data['name'] ?? '',
            'email'  => $data['email'] ?? '',
            'tax_id' => $this->digits($data['document'] ?? ''),
            'phones' => [
                [
                    'country' => '55',
                    'area'    => substr($this->digits($data['phone'] ?? ''), 0, 2),
                    'number'  => substr($this->digits($data['phone'] ?? ''), 2),
                    'type'    => 'MOBILE',
                ],
            ],
        ]);

        return $response['id'] ?? '';
    }

    // ─── Pagamentos ────────────────────────────────────────────────────────

    public function createPayment(array $data): array
    {
        [$month, $year] = $this->normalizeExpiry($data['cardExpiry'] ?? '');

        $amountCents = (int) round(((float) ($data['amountBRL'] ?? 0)) * 100);
        $installments = max(1, (int) ($data['installments'] ?? 1));

        $payload = [
            'reference_id' => $data['reference_id'] ?? uniqid('pb_'),
            'customer'     => [
                'name'   => $data['cardHolderName'] ?? $data['name'] ?? '',
                'email'  => $data['email'] ?? '',
                'tax_id' => $this->digits($data['document'] ?? ''),
            ],
            'items'        => [[
                'name'        => $data['description'] ?? 'Pagamento',
                'quantity'    => 1,
                'unit_amount' => $amountCents,
            ]],
            'charges'      => [[
                'reference_id'   => $data['reference_id'] ?? uniqid('ch_'),
                'description'    => $data['description'] ?? 'Pagamento',
                'amount'         => [
                    'value'    => $amountCents,
                    'currency' => 'BRL',
                ],
                'payment_method' => [
                    'type'         => 'CREDIT_CARD',
                    'installments' => $installments,
                    'capture'      => true,
                    'card'         => [
                        'number'        => $this->digits($data['cardToken'] ?? $data['card_number'] ?? ''),
                        'exp_month'     => $month,
                        'exp_year'      => $year,
                        'security_code' => $data['cardCvv'] ?? $data['card_cvv'] ?? '',
                        'holder'        => [
                            'name' => $data['cardHolderName'] ?? $data['card_name'] ?? '',
                        ],
                    ],
                ],
            ]],
        ];

        $response = $this->post('/orders', $payload);

        $charge = $response['charges'][0] ?? [];

        return [
            'gatewayId' => $response['id'] ?? '',
            'status'    => $this->normalizeStatus($charge['status'] ?? 'WAITING'),
            'raw'       => $this->sanitize($response),
        ];
    }

    public function createSubscription(array $data): array
    {
        // PagBank não tem subscriptions nativas no mesmo formato.
        // Placeholder — implementar com recurrence API quando necessário.
        throw new RuntimeException('PagBankGateway: Subscriptions não implementadas ainda.');
    }

    public function generatePix(array $data): array
    {
        $amountCents = (int) round(((float) ($data['amountBRL'] ?? 0)) * 100);

        $payload = [
            'reference_id' => $data['reference_id'] ?? uniqid('pb_'),
            'customer'     => [
                'name'   => $data['name'] ?? '',
                'email'  => $data['email'] ?? '',
                'tax_id' => $this->digits($data['document'] ?? ''),
            ],
            'items'        => [[
                'name'        => $data['description'] ?? 'Pagamento',
                'quantity'    => 1,
                'unit_amount' => $amountCents,
            ]],
            'qr_codes' => [[
                'amount' => ['value' => $amountCents],
            ]],
        ];

        $response = $this->post('/orders', $payload);

        $qr = $response['qr_codes'][0] ?? [];
        $links = $qr['links'] ?? [];
        $pngLink = collect($links)->firstWhere('media', 'image/png');

        return [
            'gatewayId'     => $response['id'] ?? '',
            'status'        => 'PENDING',
            'qrCodeBase64'  => '', // PagBank retorna link, não base64
            'qrCodePayload' => $qr['text'] ?? '',
            'qrCodeImage'   => $pngLink['href'] ?? '',
            'expiresAt'     => $qr['expiration_date'] ?? null,
            'raw'           => $this->sanitize($response),
        ];
    }

    public function generateBoleto(array $data): array
    {
        $amountCents = (int) round(((float) ($data['amountBRL'] ?? 0)) * 100);

        $payload = [
            'reference_id' => $data['reference_id'] ?? uniqid('pb_'),
            'customer'     => [
                'name'   => $data['name'] ?? '',
                'email'  => $data['email'] ?? '',
                'tax_id' => $this->digits($data['document'] ?? ''),
            ],
            'items'        => [[
                'name'        => $data['description'] ?? 'Pagamento',
                'quantity'    => 1,
                'unit_amount' => $amountCents,
            ]],
            'charges'      => [[
                'reference_id'   => $data['reference_id'] ?? uniqid('ch_'),
                'description'    => $data['description'] ?? 'Pagamento',
                'amount'         => [
                    'value'    => $amountCents,
                    'currency' => 'BRL',
                ],
                'payment_method' => [
                    'type'   => 'BOLETO',
                    'boleto' => [
                        'due_date'         => now()->addDays(3)->format('Y-m-d'),
                        'instruction_lines' => [
                            'line_1' => 'Pagamento via Basileia Checkout',
                            'line_2' => 'Não receber após o vencimento',
                        ],
                        'holder' => [
                            'name'   => $data['name'] ?? '',
                            'tax_id' => $this->digits($data['document'] ?? ''),
                            'email'  => $data['email'] ?? '',
                        ],
                    ],
                ],
            ]],
        ];

        $response = $this->post('/orders', $payload);

        $charge = $response['charges'][0] ?? [];
        $links = $charge['links'] ?? [];
        $pdfLink = collect($links)->firstWhere('media', 'application/pdf');

        return [
            'gatewayId'    => $response['id'] ?? '',
            'bankSlipUrl'  => $pdfLink['href'] ?? '',
            'barcode'      => $charge['payment_method']['boleto']['barcode'] ?? '',
            'status'       => 'PENDING',
            'raw'          => $this->sanitize($response),
        ];
    }

    public function getPayment(string $paymentId): ?array
    {
        try {
            return $this->get("/orders/{$paymentId}");
        } catch (\Throwable) {
            return null;
        }
    }

    public function cancelPayment(string $paymentId): array
    {
        // PagBank usa cancel via charge, não via order diretamente
        $order = $this->getPayment($paymentId);
        $chargeId = $order['charges'][0]['id'] ?? null;

        if (!$chargeId) {
            throw new RuntimeException("PagBankGateway: charge não encontrada para order {$paymentId}.");
        }

        return $this->post("/charges/{$chargeId}/cancel", [
            'amount' => ['value' => $order['charges'][0]['amount']['value'] ?? 0],
        ]);
    }

    public function refundPayment(string $paymentId, ?float $amount = null): array
    {
        $order = $this->getPayment($paymentId);
        $chargeId = $order['charges'][0]['id'] ?? null;

        if (!$chargeId) {
            throw new RuntimeException("PagBankGateway: charge não encontrada para order {$paymentId}.");
        }

        $data = [];
        if ($amount !== null) {
            $data['amount'] = ['value' => (int) round($amount * 100)];
        }

        return $this->post("/charges/{$chargeId}/cancel", $data);
    }

    public function processWebhook(\Illuminate\Http\Request $request): array
    {
        return [
            'event' => $request->input('event'),
            'data'  => $request->input('charges.0') ?? $request->all(),
        ];
    }

    public function createSplit(array $data): array
    {
        // Placeholder — implementar quando houver suporte a split no PagBank
        return [];
    }

    // ─── Normalizadores (internos, não no contrato) ────────────────────────

    public function normalizeStatus(string $gatewayStatus): string
    {
        return match (strtoupper($gatewayStatus)) {
            'PAID', 'AUTHORIZED'   => 'approved',
            'WAITING'              => 'pending',
            'IN_ANALYSIS'          => 'pending',
            'DECLINED', 'CANCELED' => 'refused',
            'REFUNDED'             => 'refunded',
            default                => 'pending',
        };
    }

    public function normalizeMethod(string $gatewayMethod): string
    {
        return match (strtoupper($gatewayMethod)) {
            'CREDIT_CARD' => 'credit_card',
            'DEBIT_CARD'  => 'debit_card',
            'PIX'         => 'pix',
            'BOLETO'      => 'boleto',
            default       => 'credit_card',
        };
    }

    // ─── HTTP ──────────────────────────────────────────────────────────────

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
                'Authorization' => "Bearer {$this->apiToken}",
                'Content-Type'  => 'application/json',
                'Accept'        => 'application/json',
            ])->timeout(30)->{strtolower($method)}($url, $data);

            if (!$response->successful()) {
                $body    = $response->json();
                $message = $body['error_messages'][0]['description']
                    ?? $body['message']
                    ?? 'Request failed';

                Log::error('PagBankGateway: request failed', [
                    'url'    => $url,
                    'status' => $response->status(),
                    'errors' => $body['error_messages'] ?? [],
                ]);

                throw new RuntimeException('PagBank API Error: ' . $message);
            }

            return $response->json();
        } catch (RuntimeException $e) {
            throw $e;
        } catch (\Throwable $e) {
            Log::error('PagBankGateway: exception', [
                'url'   => $url,
                'error' => $e->getMessage(),
            ]);
            throw $e;
        }
    }

    // ─── Helpers ───────────────────────────────────────────────────────────

    /**
     * Normaliza expiry para [month, year] com 4 dígitos.
     * Mesmo pattern que AsaasGateway::normalizeExpiry().
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

    private function digits(string $value): string
    {
        return preg_replace('/\D/', '', $value);
    }

    private function sanitize(array $data): array
    {
        $sensitive = ['card', 'security_code', 'holder', 'tax_id'];
        $result = $data;

        // Remove dados sensíveis de charges
        if (isset($result['charges'])) {
            foreach ($result['charges'] as &$charge) {
                if (isset($charge['payment_method']['card'])) {
                    unset($charge['payment_method']['card']);
                }
            }
        }

        return $result;
    }
}
