# Chunk 1: Core Payment & Gateway
### Arquivo: app/Services/WebhookService.php
```php
<?php

namespace App\Services;

use App\Models\Company;
use App\Models\WebhookDelivery;
use App\Models\WebhookEndpoint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class WebhookService
{
    public function dispatch(string $eventType, array $payload, Company $company): void
    {
        $endpoints = WebhookEndpoint::where('company_id', $company->id)
            ->where('is_active', true)
            ->get();

        foreach ($endpoints as $endpoint) {
            if (!$this->endpointMatchesEvent($endpoint, $eventType)) {
                continue;
            }

            $delivery = WebhookDelivery::create([
                'webhook_endpoint_id' => $endpoint->id,
                'company_id' => $company->id,
                'event_type' => $eventType,
                'payload' => $payload,
                'status' => 'pending',
                'next_retry_at' => now(),
            ]);

            dispatch(function () use ($delivery, $endpoint) {
                $this->deliver($delivery);
            })->onQueue('webhooks');
        }
    }

    public function deliver(WebhookDelivery $delivery): bool
    {
        $endpoint = $delivery->endpoint;

        if (!$endpoint || !$endpoint->is_active) {
            $delivery->update(['status' => 'failed', 'error_message' => 'Endpoint is inactive.']);
            return false;
        }

        $payload = $delivery->payload;
        $signature = $this->generateSignature($payload, $endpoint->secret);

        $delivery->update(['attempted_at' => now()]);

        try {
            $response = Http::timeout(30)
                ->withHeaders([
                    'Content-Type' => 'application/json',
                    'X-Webhook-Signature' => $signature,
                    'X-Webhook-Event' => $delivery->event_type,
                    'X-Webhook-Delivery' => $delivery->uuid,
                ])
                ->post($endpoint->url, $payload);

            $success = $response->successful();

            $delivery->update([
                'status' => $success ? 'delivered' : 'failed',
                'response_status_code' => $response->status(),
                'response_body' => mb_substr($response->body(), 0, 4096),
                'error_message' => $success ? null : "HTTP {$response->status()}",
                'completed_at' => $success ? now() : null,
            ]);

            if (!$success) {
                $this->scheduleRetry($delivery);
            }

            return $success;
        } catch (\Throwable $e) {
            Log::error('Webhook delivery failed', [
                'delivery' => $delivery->uuid,
                'endpoint' => $endpoint->url,
                'error' => $e->getMessage(),
            ]);

            $delivery->update([
                'status' => 'failed',
                'error_message' => $e->getMessage(),
            ]);

            $this->scheduleRetry($delivery);

            return false;
        }
    }

    public function retry(WebhookDelivery $delivery): bool
    {
        $delivery->increment('attempts');

        $delivery->update([
            'next_retry_at' => $this->calculateNextRetry($delivery->attempts),
        ]);

        return $this->deliver($delivery);
    }

    public function retryFailed(): void
    {
        $deliveries = WebhookDelivery::where('status', 'failed')
            ->where('next_retry_at', '<=', now())
            ->where('attempts', '<', 5)
            ->with('endpoint')
            ->get();

        foreach ($deliveries as $delivery) {
            try {
                $this->retry($delivery);
            } catch (\Throwable $e) {
                Log::error('Webhook retry failed', [
                    'delivery' => $delivery->uuid,
                    'error' => $e->getMessage(),
                ]);
            }
        }
    }

    public function generateSignature(array $payload, string $secret): string
    {
        return 'sha256=' . hash_hmac('sha256', json_encode($payload), $secret);
    }

    private function endpointMatchesEvent(WebhookEndpoint $endpoint, string $eventType): bool
    {
        if (empty($endpoint->events) || in_array('*', $endpoint->events)) {
            return true;
        }

        foreach ($endpoint->events as $pattern) {
            if ($pattern === $eventType) {
                return true;
            }

            if (str_ends_with($pattern, '*') && str_starts_with($eventType, rtrim($pattern, '*'))) {
                return true;
            }
        }

        return false;
    }

    private function scheduleRetry(WebhookDelivery $delivery): void
    {
        if ($delivery->attempts >= 5) {
            $delivery->update(['status' => 'abandoned']);
            return;
        }

        $delivery->update([
            'next_retry_at' => $this->calculateNextRetry($delivery->attempts + 1),
        ]);
    }

    private function calculateNextRetry(int $attempt): \Carbon\Carbon
    {
        $minutes = pow(2, $attempt) * 5;

        return now()->addMinutes(min($minutes, 240));
    }
}
```
### Arquivo: app/Services/Vendors/BaseVendorService.php
```php
<?php

namespace App\Services\Vendors;

interface BaseVendorService
{
    public function getPayment(string $paymentId): ?array;
    public function createPayment(array $data): ?array;
    public function processCardPayment(string $paymentId, array $cardData): ?array;
    public function getPixQrCode(string $paymentId): ?array;
    public function getBoletoBillet(string $paymentId): ?array;
    public function cancelPayment(string $paymentId): ?array;
    public function refundPayment(string $paymentId, ?float $amount = null): ?array;
}```
### Arquivo: app/Services/CardValidator.php
```php
<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;

class CardValidator
{
    private const CARD_BIN_PATTERNS = [
        'visa' => '/^4/',
        'mastercard' => '/^5[1-5]/',
        'amex' => '/^3[47]/',
        'discover' => '/^6(?:011|5)/',
        'elo' => '/^(?:401178|401179|431274|438935|451416|457393|457631|457632|504175|627780|636297|636368|650051|650052|650053|650405|651652|655000|655001)/',
        'hipercard' => '/^(?:606282|637095|637568)/',
    ];

    public function validate(string $cardNumber, ?string $cvv = null): array
    {
        $cleanedCard = $this->sanitize($cardNumber);

        if (empty($cleanedCard)) {
            return $this->error('Número do cartão inválido.');
        }

        if (!preg_match('/^\d{13,19}$/', $cleanedCard)) {
            return $this->error('Número do cartão deve ter entre 13 e 19 dígitos.');
        }

        if (!$this->luhnCheck($cleanedCard)) {
            return $this->error('Número do cartão inválido.');
        }

        $cardBrand = $this->detectBrand($cleanedCard);
        
        if ($cvv !== null) {
            $cvvLength = strlen($cvv);
            $expectedCvvLength = ($cardBrand === 'amex') ? 4 : 3;
            
            if ($cvvLength !== $expectedCvvLength) {
                return $this->error('Código de segurança inválido para o cartão.');
            }
        }

        return [
            'valid' => true,
            'brand' => $cardBrand,
            'sanitized_number' => $this->maskCard($cleanedCard),
        ];
    }

    public function sanitize(?string $cardNumber): ?string
    {
        if (empty($cardNumber)) {
            return null;
        }
        return preg_replace('/\D/', '', $cardNumber);
    }

    private function luhnCheck(string $cardNumber): bool
    {
        $digits = str_split($cardNumber);
        $sum = 0;
        $isSecond = false;

        for ($i = count($digits) - 1; $i >= 0; $i--) {
            $digit = (int) $digits[$i];

            if ($isSecond) {
                $digit *= 2;
                if ($digit > 9) {
                    $digit -= 9;
                }
            }

            $sum += $digit;
            $isSecond = !$isSecond;
        }

        return ($sum % 10) === 0;
    }

    private function detectBrand(string $cardNumber): string
    {
        foreach (self::CARD_BIN_PATTERNS as $brand => $pattern) {
            if (preg_match($pattern, $cardNumber)) {
                return $brand;
            }
        }
        return 'unknown';
    }

    private function maskCard(string $cardNumber): string
    {
        $length = strlen($cardNumber);
        $first6 = substr($cardNumber, 0, 6);
        $last4 = substr($cardNumber, -4);
        $maskedMiddle = str_repeat('*', $length - 10);
        
        return $first6 . $maskedMiddle . $last4;
    }

    private function error(string $message): array
    {
        Log::warning('Card validation failed', [
            'reason' => $message,
            'ip' => request()->ip() ?? 'unknown',
        ]);
        
        return [
            'valid' => false,
            'error' => $message,
        ];
    }

    public function validateExpiry(?string $month, ?string $year): bool
    {
        if ($month === null || $year === null) {
            return false;
        }

        $month = (int) $month;
        $year = (int) $year;

        if ($month < 1 || $month > 12) {
            return false;
        }

        if ($year < 2000) {
            $year += 2000;
        }

        $now = now();
        $expiry = now()->setDate($year, $month, 1)->endOfMonth();

        return $expiry->greaterThanOrEqualTo($now);
    }
}
```
### Arquivo: app/Services/PaymentService.php
```php
<?php

namespace App\Services;

use App\Enums\PaymentStatus;
use App\Events\PaymentApproved;
use App\Events\PaymentCancelled;
use App\Events\PaymentPending;
use App\Events\PaymentRefused;
use App\Events\PaymentRefunded;
use App\Models\Customer;
use App\Models\Gateway;
use App\Models\Payment;
use App\Models\Transaction;
use App\Models\Integration;
use App\Services\Gateway\GatewayFactory;
use App\Helpers\PaymentStatusMapper;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use RuntimeException;

class PaymentService
{
    public function __construct(
        private GatewayFactory $gatewayFactory,
        private CustomerService $customerService,
        private TransactionService $transactionService,
    ) {}

    /**
     * Alinhado com Api\V1\PaymentController@process
     */
    public function process(array $data, ?Integration $integration = null): array
    {
        return DB::transaction(function () use ($data, $integration) {
            $transaction = Transaction::where('uuid', $data['transaction_uuid'])->firstOrFail();
            
            // Resolve gateway (se não passado, pega o da integração da transação)
            $integration = $integration ?? $transaction->integration;
            $gateway = $this->gatewayFactory->make($integration->gateway->type);
            
            // Mapeia credit_card para o que o gateway/asaas espera (CREDITCARD)
            $billingTypeMap = [
                'credit_card' => 'CREDIT_CARD',
                'pix' => 'PIX',
                'boleto' => 'BOLETO'
            ];
            $billingType = $billingTypeMap[$data['payment_method']] ?? 'CREDIT_CARD';

            // Prepara dados para o gateway
            $gatewayInput = [
                'amountBRL' => (float) $transaction->amount,
                'description' => $transaction->description ?? "Pagamento #{$transaction->uuid}",
                'installments' => (int) ($data['card']['installments'] ?? 1),
                'cardToken' => $data['card']['number'] ?? null,
                'cardHolderName' => $data['card']['holder_name'] ?? null,
                'cardExpiry' => isset($data['card']['expiry_month']) ? "{$data['card']['expiry_month']}/{$data['card']['expiry_year']}" : null,
                'cardCvv' => $data['card']['cvv'] ?? null,
                'remoteIp' => request()->ip(),
                
                // Holder info real (BUG-02)
                'holder_email' => $data['card']['email'] ?? $transaction->customer_email,
                'card_document' => $data['card']['document'] ?? $transaction->customer_document,
            ];

            // Executa a cobrança no gateway
            $customerId = $this->resolveGatewayCustomerId($transaction, $gateway);
            
            $gatewayResponse = match($billingType) {
                'PIX' => $gateway->chargeViaPix($gatewayInput, $customerId),
                'BOLETO' => $gateway->chargeViaBoleto($gatewayInput, $customerId),
                default => $gateway->charge($gatewayInput, $customerId),
            };

            // Cria o registro de pagamento alinhado com o schema real
            $payment = Payment::create([
                'uuid' => Str::uuid(),
                'transaction_id' => $transaction->id,
                'gateway_id' => $integration->gateway_id,
                'gateway_transaction_id' => $gatewayResponse['gatewayId'],
                'amount' => $transaction->amount,
                'payment_method' => $data['payment_method'],
                'status' => PaymentStatusMapper::mapStatus($gatewayResponse['status']),
                'pix_qrcode' => $gatewayResponse['qrCodeBase64'] ?? null,
                'pix_expires_at' => $gatewayResponse['expiresAt'] ?? null,
                'boleto_url' => $gatewayResponse['bankSlipUrl'] ?? null,
                'boleto_barcode' => $gatewayResponse['barcode'] ?? null,
                'gateway_response' => $gatewayResponse['raw'] ?? [],
                'paid_at' => PaymentStatusMapper::isPaid($gatewayResponse['status']) ? now() : null,
            ]);

            // Atualiza a transação
            $transaction->update([
                'status' => $payment->status,
                'payment_method' => $payment->payment_method,
                'asaas_payment_id' => $payment->gateway_transaction_id
            ]);

            return $payment->toArray();
        });
    }

    public function findByUuid(string $uuid, ?Integration $integration = null): ?Payment
    {
        $query = Payment::where('uuid', $uuid);
        if ($integration) {
            $query->where('gateway_id', $integration->gateway_id);
        }
        return $query->first();
    }

    public function getPixData(string $uuid, ?Integration $integration = null): ?array
    {
        $payment = $this->findByUuid($uuid, $integration);
        if (!$payment || $payment->payment_method !== 'pix') return null;

        return [
            'qrcode' => $payment->pix_qrcode,
            'expires_at' => $payment->pix_expires_at,
            'status' => $payment->status
        ];
    }

    public function getBoletoData(string $uuid, ?Integration $integration = null): ?array
    {
        $payment = $this->findByUuid($uuid, $integration);
        if (!$payment || $payment->payment_method !== 'boleto') return null;

        return [
            'url' => $payment->boleto_url,
            'barcode' => $payment->boleto_barcode,
            'status' => $payment->status
        ];
    }

    private function resolveGatewayCustomerId(Transaction $transaction, $gateway): string
    {
        // Se a transação já tem cliente no gateway, usa ele
        if ($transaction->customer_gateway_id) {
            return $transaction->customer_gateway_id;
        }

        // Caso contrário, cria um novo no gateway
        return $gateway->createCustomer([
            'name' => $transaction->customer_name,
            'email' => $transaction->customer_email,
            'document' => $transaction->customer_document,
            'phone' => $transaction->customer_phone,
        ]);
    }
}
```
### Arquivo: app/Services/CheckoutService.php
```php
<?php

declare(strict_types=1);

namespace App\Services;

use App\Helpers\PaymentStatusMapper;
use App\Models\Subscription;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

/**
 * Centraliza TODA a lógica comum de checkout.
 *
 * [BUG-04] Company::first() em 6 lugares → resolveCompanyId() único aqui
 *          O original fazia Company::where('status','active')->first()
 *          que retorna empresa errada em ambiente multi-tenant
 * [DUP-03] Carregamento de i18n copiado em 5 controllers → loadI18n()
 * [DUP-04] buildCheckoutData() copiado em 4 controllers → método único
 * [DUP-05] Injeção HTML SPA copiada em 5 controllers → renderSpa()
 * [DUP-06] Lógica de show() copiada em 6 controllers → centralizada aqui
 * [DUP-08] Criação de Transaction copiada em 3 controllers → createTransactionIfNotExists()
 */
class CheckoutService
{
    private const SUPPORTED_LOCALES = ['pt', 'en', 'ja', 'es'];
    private const DEFAULT_LOCALE = 'pt';

    // ─────────────────────────────────────────────────────────────
    // Busca de recursos
    // ─────────────────────────────────────────────────────────────

    public static function findResource(string $uuid): Transaction|Subscription
    {
        return Transaction::where('uuid', $uuid)->first()
            ?? Subscription::where('uuid', $uuid)->firstOrFail();
    }

    // ─────────────────────────────────────────────────────────────
    // Dados do Asaas com fallback
    // ─────────────────────────────────────────────────────────────

    public static function getAsaasPaymentWithFallback(
        AsaasPaymentService $asaasService,
        Transaction|Subscription $resource,
        string $asaasPaymentId,
        string $defaultBillingType = 'CREDITCARD',
    ): array {
        try {
            $payment = $asaasService->getPayment($asaasPaymentId);
            if ($payment)
                return $payment;
        } catch (\Throwable $e) {
            Log::warning('CheckoutService: fallback de dados locais — Asaas indisponível', [
                'asaas_payment_id' => $asaasPaymentId,
                'error' => $e->getMessage(),
            ]);
        }

        $methodMap = ['credit_card' => 'CREDITCARD', 'pix' => 'PIX', 'boleto' => 'BOLETO'];

        return [
            'billingType' => $methodMap[$resource->payment_method ?? 'credit_card'] ?? $defaultBillingType,
            'installmentCount' => 1,
            'value' => $resource->amount ?? 0,
            'description' => $resource->description ?? 'Pagamento',
            'status' => 'PENDING',
            'customer' => [
                'name' => $resource->customer_name ?? '',
                'email' => $resource->customer_email ?? '',
                'phone' => $resource->customer_phone ?? '',
            ],
        ];
    }

    // ─────────────────────────────────────────────────────────────
    // Dados do cliente
    // ─────────────────────────────────────────────────────────────

    public static function buildCustomerData(array $asaasPayment, Transaction|Subscription $resource): array
    {
        $c = $asaasPayment['customer'] ?? [];
        $isArray = is_array($c);

        return [
            'name' => ($isArray ? $c['name'] ?? '' : '') ?: ($resource->customer_name ?? ''),
            'email' => ($isArray ? $c['email'] ?? '' : '') ?: ($resource->customer_email ?? ''),
            'phone' => ($isArray ? $c['phone'] ?? '' : '') ?: ($resource->customer_phone ?? ''),
            'document' => ($isArray ? $c['cpfCnpj'] ?? '' : '') ?: ($resource->customer_document ?? ''),
            'address' => [
                'street' => $isArray ? ($c['address'] ?? '') : '',
                'number' => $isArray ? ($c['addressNumber'] ?? '') : '',
                'neighborhood' => $isArray ? ($c['neighborhood'] ?? '') : '',
                'city' => $isArray ? ($c['city'] ?? '') : '',
                'state' => $isArray ? ($c['state'] ?? '') : '',
                'postalCode' => $isArray ? ($c['postalCode'] ?? '') : '',
            ],
        ];
    }

    // ─────────────────────────────────────────────────────────────
    // Criação de Transaction
    // ─────────────────────────────────────────────────────────────

    /**
     * Cria Transaction se não existe para o asaasPaymentId.
     *
     * [BUG-04] NUNCA chama Company::first() — usa resolveCompanyId()
     * [DUP-08] Era o bloco copiado em DefaultVendorController,
     *          BasileiaCheckoutController e AsaasCheckoutController
     */
    public static function createTransactionIfNotExists(
        array $asaasPayment,
        Transaction|Subscription $resource,
        string $asaasPaymentId,
        string $source,
        Request $request,
    ): Transaction {
        if ($resource instanceof Transaction && $resource->exists && $resource->id) {
            return $resource;
        }

        $companyId = static::resolveCompanyId();

        if (!$companyId) {
            Log::error('CheckoutService: company_id não encontrado', [
                'asaas_payment_id' => $asaasPaymentId,
                'source' => $source,
            ]);
            abort(500, 'Empresa não identificada. Verifique a configuração do checkout.');
        }

        $customerData = static::buildCustomerData($asaasPayment, $resource);
        $billingType = $asaasPayment['billingType'] ?? 'CREDITCARD';

        return Transaction::create([
            'uuid' => Str::uuid()->toString(),
            'company_id' => $companyId,
            'asaas_payment_id' => $asaasPaymentId,
            'source' => $source,
            'external_id' => '',
            'callback_url' => config('basileia.callback_url', ''),
            'amount' => $asaasPayment['value'] ?? 0,
            'description' => $asaasPayment['description'] ?? 'Pagamento',
            'payment_method' => PaymentStatusMapper::mapPaymentMethod($billingType),
            'status' => 'pending',
            'customer_name' => $customerData['name'],
            'customer_email' => $customerData['email'],
            'customer_phone' => $customerData['phone'],
            'customer_document' => $customerData['document'],
            'customer_address' => json_encode($customerData['address']),
            'metadata' => [
                'plano' => $request->get('plano'),
                'ciclo' => $request->get('ciclo', 'mensal'),
            ],
        ]);
    }

    /**
     * Cria Transaction a partir de redirecionamento seguro (middleware).
     * Usado por EnforceSecureTokenization quando a transaction não existe.
     */
    public static function createTransactionFromRedirect(array $data): ?Transaction
    {
        try {
            $asaasPaymentId = $data['asaas_payment_id'] ?? null;
            if (!$asaasPaymentId)
                return null;

            $existing = Transaction::where('asaas_payment_id', $asaasPaymentId)->first();
            if ($existing)
                return $existing;

            $companyId = static::resolveCompanyId();
            if (!$companyId)
                return null;

            $params = $data['url_params'] ?? [];

            return Transaction::create([
                'uuid' => Str::uuid()->toString(),
                'company_id' => $companyId,
                'asaas_payment_id' => $asaasPaymentId,
                'source' => 'secure-redirect',
                'external_id' => '',
                'callback_url' => config('basileia.callback_url', ''),
                'amount' => (float) ($params['valor'] ?? 0),
                'description' => $params['plano'] ?? 'Pagamento via Redirecionamento Seguro',
                'payment_method' => 'credit_card',
                'status' => 'pending',
                'customer_name' => preg_replace('/[^a-zA-ZÀ-ú\s\-]/', '', $params['cliente'] ?? ''),
                'customer_email' => filter_var($params['email'] ?? '', FILTER_VALIDATE_EMAIL) ? $params['email'] : '',
                'customer_document' => preg_replace('/\D/', '', $params['documento'] ?? ''),
                'customer_phone' => preg_replace('/\D/', '', $params['whatsapp'] ?? ''),
                'customer_address' => json_encode([]),
                'metadata' => [
                    'plano' => $params['plano'] ?? null,
                    'ciclo' => $params['ciclo'] ?? 'mensal',
                    'redirect_source' => 'secure-tokenization',
                ],
            ]);
        } catch (\Throwable $e) {
            Log::error('CheckoutService: falha ao criar transação do redirect', [
                'error' => $e->getMessage(),
                'asaas_payment_id' => $data['asaas_payment_id'] ?? null,
            ]);
            return null;
        }
    }

    // ─────────────────────────────────────────────────────────────
    // Status polling
    // ─────────────────────────────────────────────────────────────

    public static function checkAndUpdateStatus(
        Transaction $transaction,
        AsaasPaymentService $asaasService,
        callable $onUpdated,
    ): void {
        if ($transaction->status !== 'pending' || !$transaction->asaas_payment_id) {
            return;
        }

        $payment = $asaasService->getPayment($transaction->asaas_payment_id);
        if (!$payment)
            return;

        $newStatus = PaymentStatusMapper::mapStatus($payment['status'] ?? 'PENDING');
        if ($newStatus === 'pending')
            return;

        $transaction->update([
            'status' => $newStatus,
            'paid_at' => PaymentStatusMapper::isPaid($payment['status'] ?? '') ? now() : null,
        ]);

        Log::info('CheckoutService: status atualizado via polling', [
            'transaction_id' => $transaction->id,
            'new_status' => $newStatus,
        ]);

        try {
            $onUpdated($transaction);
        } catch (\Throwable $e) {
            Log::error('CheckoutService: falha ao enviar webhook pós-polling', [
                'transaction_id' => $transaction->id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    // ─────────────────────────────────────────────────────────────
    // i18n
    // ─────────────────────────────────────────────────────────────

    /**
     * [DUP-03] Antes este bloco estava copiado em 5 controllers.
     * Agora existe SOMENTE aqui.
     */
    public static function loadI18n(Request $request): array
    {
        $requested = $request->get('lang', self::DEFAULT_LOCALE);
        $locale = in_array($requested, self::SUPPORTED_LOCALES, true)
            ? $requested
            : self::DEFAULT_LOCALE;

        app()->setLocale($locale);

        $i18n = [];
        foreach (self::SUPPORTED_LOCALES as $l) {
            $path = base_path("{$l}.json");
            if (file_exists($path)) {
                $i18n[$l] = json_decode(file_get_contents($path), true) ?? [];
            }
        }

        return $i18n;
    }

    // ─────────────────────────────────────────────────────────────
    // PIX
    // ─────────────────────────────────────────────────────────────

    public static function getPixDataIfNeeded(
        AsaasPaymentService $asaasService,
        string $asaasPaymentId,
    ): array {
        return $asaasService->getPixQrCode($asaasPaymentId)
            ?? ['payload' => 'PENDENTE-SYNC', 'encodedImage' => ''];
    }

    // ─────────────────────────────────────────────────────────────
    // SPA
    // ─────────────────────────────────────────────────────────────

    /**
     * [DUP-04] Antes copiado em 4 controllers.
     */
    public static function buildCheckoutData(
        Transaction|Subscription $resource,
        array $asaasPayment,
        string $uuid,
        Request $request,
    ): array {
        $isSubscription = $resource instanceof Subscription;

        return [
            'uuid' => $uuid,
            'amount' => $asaasPayment['value'] ?? $resource->amount ?? 0,
            'description' => $isSubscription
                ? ($resource->plan_name ?? $resource->description ?? 'Plano')
                : ($resource->description ?? 'Pagamento'),
            'customerName' => $resource->customer_name ?? $resource->customer?->name ?? '',
            'customerEmail' => $resource->customer_email ?? $resource->customer?->email ?? '',
            'csrfToken' => csrf_token(),
            'step' => 1,
        ];
    }

    /**
     * [DUP-05] Injeta window.CHECKOUT_DATA no HTML do SPA.
     * Antes copiado em 5 controllers.
     */
    public static function injectSpaData(string $html, array $checkoutData): string
    {
        $script = '<script>window.CHECKOUT_DATA=' . json_encode($checkoutData) . '</script>';
        return str_replace('<head>', '<head>' . $script, $html);
    }

    /**
     * [DUP-05] Carrega o SPA, injeta os dados e retorna o HTML.
     * Retorna null se o arquivo SPA não existir → usa fallback Blade.
     */
    public static function renderSpa(array $checkoutData): ?string
    {
        $htmlPath = public_path('checkout-app/checkout.html');
        if (!file_exists($htmlPath))
            return null;
        return static::injectSpaData(file_get_contents($htmlPath), $checkoutData);
    }

    // ─────────────────────────────────────────────────────────────
    // Resolução de empresa — [BUG-04]
    // ─────────────────────────────────────────────────────────────

    /**
     * Resolve company_id pelo contexto da request atual.
     *
     * [BUG-04] SUBSTITUI todos os Company::first() e
     *          Company::where('status','active')->first() do código.
     *
     * Ordem:
     *   1. Integration autenticada via API (X-API-Key header)
     *   2. Usuário logado no dashboard (session/cookie)
     *   3. Atributo 'company' injetado por middleware
     *
     * Retorna null se não conseguir resolver.
     * O controller decide o que fazer (abort ou redirect).
     *
     * NUNCA retorna a empresa de outra empresa como fallback.
     */
    public static function resolveCompanyId(): ?int
    {
        // 1. API autenticada
        $integration = request()->attributes->get('integration');
        if ($integration?->company_id) {
            return (int) $integration->company_id;
        }

        // 2. Usuário do dashboard
        $user = auth()->user();
        if ($user?->company_id) {
            return (int) $user->company_id;
        }

        // 3. Middleware
        $company = request()->attributes->get('company');
        if ($company?->id) {
            return (int) $company->id;
        }

        return null; // NUNCA retorna company_id de outra empresa como fallback
    }
}
```
### Arquivo: app/Services/TwoFactorAuthService.php
```php
<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;

class TwoFactorAuthService
{
    private const PERIOD = 30;
    private const CODE_LENGTH = 6;
    private const BACKUP_CODES_COUNT = 8;

    public function generateSecret(): string
    {
        return $this->generateBase32Secret(16);
    }

    public function generateQRCodeUrl(User $user): string
    {
        $secret = $user->two_factor_secret;
        $email = $user->email;
        $name = config('app.name', 'Checkout');

        return 'otpauth://totp/' . rawurlencode($name) . ':' . rawurlencode($email) . '?secret=' . $secret . '&issuer=' . rawurlencode($name) . '&algorithm=SHA1&digits=6&period=30';
    }

    public function verifyCode(User $user, string $code): bool
    {
        if (!$user->two_factor_secret) {
            return false;
        }

        $secret = $user->two_factor_secret;
        $currentTime = time();

        Log::debug('2FA verify attempt', [
            'user_id' => $user->id,
            'code_length' => strlen($code),
            'current_time' => $currentTime,
        ]);

        for ($i = -1; $i <= 1; $i++) {
            $timeSlot = floor(($currentTime + ($i * self::PERIOD)) / self::PERIOD);
            $expectedCode = $this->generateTOTP($secret, $timeSlot);

            if (hash_equals($expectedCode, $code)) {
                $user->update(['last_auth_at' => now()]);
                Log::info('2FA verification succeeded', ['user_id' => $user->id]);
                return true;
            }
        }

        Log::warning('2FA verification failed', ['user_id' => $user->id]);
        return false;
    }

    public function verifyBackupCode(User $user, string $code): bool
    {
        if (!$user->two_factor_codes) {
            return false;
        }

        $codes = json_decode(Crypt::decryptString($user->two_factor_codes), true);
        $code = strtoupper(trim($code));

        foreach ($codes as $index => $storedCode) {
            if (strtoupper($storedCode) === $code) {
                unset($codes[$index]);
                $user->update([
                    'two_factor_codes' => Crypt::encryptString(json_encode(array_values($codes)))
                ]);
                return true;
            }
        }

        return false;
    }

    public function enable(User $user, string $code): bool
    {
        if ($this->verifyCode($user, $code)) {
            $user->update([
                'two_factor_enabled' => true,
                'two_factor_codes' => Crypt::encryptString(json_encode($this->generateBackupCodes()))
            ]);
            Log::info('2FA enabled', ['user_id' => $user->id]);
            return true;
        }
        return false;
    }

    public function disable(User $user, string $password): bool
    {
        if (!Hash::check($password, $user->password)) {
            return false;
        }

        $user->update([
            'two_factor_enabled' => false,
            'two_factor_secret' => null,
            'two_factor_codes' => null
        ]);
        Log::info('2FA disabled', ['user_id' => $user->id]);
        return true;
    }

    public function needsReauth(User $user): bool
    {
        if (!$user->last_auth_at) {
            return true;
        }

        return $user->last_auth_at->diffInDays(now()) >= 30;
    }

    private function generateBase32Secret(int $length): string
    {
        $chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
        $secret = '';

        $randomBytes = random_bytes($length);
        $bytes = unpack('C*', $randomBytes);

        foreach ($bytes as $byte) {
            $secret .= $chars[$byte % 32];
        }

        return $secret;
    }

    private function generateTOTP(string $secret, int $timeSlot): string
    {
        $secretKey = $this->base32Decode($secret);

        $timeBinary = pack('N', $timeSlot);
        $timeBinary = str_pad($timeBinary, 8, "\0", STR_PAD_LEFT);

        $hash = hash_hmac('sha1', $timeBinary, $secretKey, true);

        $offset = ord(substr($hash, -1)) & 0x0F;

        $binary = substr($hash, $offset, 4);
        $unpacked = unpack('N', $binary);
        $truncated = $unpacked[1] & 0x7FFFFFFF;

        $code = str_pad($truncated % pow(10, self::CODE_LENGTH), self::CODE_LENGTH, '0', STR_PAD_LEFT);

        return $code;
    }

    private function base32Decode(string $input): string
    {
        $alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

        $input = strtoupper(preg_replace('/[^A-Z2-7]/', '', $input));

        $output = '';
        $buffer = 0;
        $bitsLeft = 0;

        for ($i = 0; $i < strlen($input); $i++) {
            $char = $input[$i];
            $value = strpos($alphabet, $char);

            if ($value === false) {
                continue;
            }

            $buffer = ($buffer << 5) | $value;
            $bitsLeft += 5;

            while ($bitsLeft >= 8) {
                $bitsLeft -= 8;
                $output .= chr(($buffer >> $bitsLeft) & 0xFF);
            }
        }

        return $output;
    }

    private function generateBackupCodes(): array
    {
        $codes = [];
        for ($i = 0; $i < self::BACKUP_CODES_COUNT; $i++) {
            $codes[] = strtoupper(bin2hex(random_bytes(4)));
        }
        return $codes;
    }
}```
### Arquivo: app/Services/Fraud/BasicFraudService.php
```php
<?php

namespace App\Services\Fraud;

use App\Models\FraudAnalysis;
use App\Models\Transaction;
use Illuminate\Support\Facades\DB;

class BasicFraudService
{
    private array $flags = [];

    private float $score = 0.0;

    public function analyze(Transaction $transaction): FraudAnalysis
    {
        $this->flags = [];
        $this->score = 0.0;

        if ($transaction->ip_address) {
            $this->tooManyFromIp($transaction->ip_address);
        }

        $this->highValue($transaction->amount);

        if ($transaction->customer_email) {
            $this->suspiciousEmail($transaction->customer_email);
        }

        $riskLevel = $this->calculateRiskLevel();
        $recommendation = $this->getRecommendation($riskLevel);

        return FraudAnalysis::create([
            'transaction_id' => $transaction->id,
            'company_id' => $transaction->company_id,
            'score' => round($this->score, 2),
            'risk_level' => $riskLevel,
            'flags' => $this->flags,
            'recommendation' => $recommendation,
            'ip_address' => $transaction->ip_address,
            'analysis_data' => [
                'flags_count' => count($this->flags),
                'amount' => $transaction->amount,
            ],
        ]);
    }

    private function tooManyFromIp(string $ip): void
    {
        $threshold = config('fraud.ip_threshold', 10);
        $timeframe = now()->subHour();

        $count = Transaction::where('ip_address', $ip)
            ->where('created_at', '>=', $timeframe)
            ->where('status', '!=', 'cancelled')
            ->count();

        if ($count >= $threshold) {
            $this->flags[] = [
                'type' => 'too_many_from_ip',
                'severity' => 'high',
                'detail' => "IP {$ip} has {$count} transactions in the last hour.",
            ];
            $this->score += 40.0;
        } elseif ($count >= $threshold * 0.7) {
            $this->flags[] = [
                'type' => 'elevated_ip_activity',
                'severity' => 'medium',
                'detail' => "IP {$ip} has {$count} transactions in the last hour.",
            ];
            $this->score += 20.0;
        }
    }

    private function highValue(float $amount): void
    {
        $threshold = config('fraud.high_value_threshold', 5000.00);

        if ($amount >= $threshold) {
            $this->flags[] = [
                'type' => 'high_value',
                'severity' => 'medium',
                'detail' => "Transaction amount R$ {$amount} exceeds threshold R$ {$threshold}.",
            ];
            $this->score += 15.0;
        }

        if ($amount >= $threshold * 2) {
            $this->flags[] = [
                'type' => 'very_high_value',
                'severity' => 'high',
                'detail' => "Transaction amount R$ {$amount} is exceptionally high.",
            ];
            $this->score += 20.0;
        }
    }

    private function cardRetryAbuse(string $cardHash): void
    {
        $threshold = config('fraud.card_retry_threshold', 5);
        $timeframe = now()->subMinutes(30);

        $count = Transaction::whereJsonContains('metadata->card_hash', $cardHash)
            ->where('created_at', '>=', $timeframe)
            ->whereIn('status', ['refused', 'pending'])
            ->count();

        if ($count >= $threshold) {
            $this->flags[] = [
                'type' => 'card_retry_abuse',
                'severity' => 'high',
                'detail' => "Card has {$count} failed attempts in the last 30 minutes.",
            ];
            $this->score += 35.0;
        }
    }

    private function suspiciousEmail(string $email): void
    {
        $domain = strtolower(substr(strrchr($email, '@'), 1) ?: '');

        if (empty($domain)) {
            $this->flags[] = [
                'type' => 'invalid_email',
                'severity' => 'medium',
                'detail' => 'Email format is invalid.',
            ];
            $this->score += 10.0;
            return;
        }

        $disposableDomains = config('fraud.disposable_domains', [
            'tempmail.com', 'throwaway.email', 'guerrillamail.com',
            'mailinator.com', 'yopmail.com', 'sharklasers.com',
            'guerrillamailblock.com', 'grr.la', 'dispostable.com',
            'trashmail.com', 'fakeinbox.com', 'temp-mail.org',
        ]);

        if (in_array($domain, $disposableDomains)) {
            $this->flags[] = [
                'type' => 'disposable_email',
                'severity' => 'high',
                'detail' => "Email domain {$domain} is a known disposable email provider.",
            ];
            $this->score += 30.0;
        }
    }

    private function calculateRiskLevel(): string
    {
        return match (true) {
            $this->score >= 70.0 => 'critical',
            $this->score >= 50.0 => 'high',
            $this->score >= 30.0 => 'medium',
            $this->score >= 15.0 => 'low',
            default => 'minimal',
        };
    }

    private function getRecommendation(string $riskLevel): string
    {
        return match ($riskLevel) {
            'critical' => 'reject',
            'high' => 'review',
            'medium' => 'review',
            default => 'approve',
        };
    }
}
```
### Arquivo: app/Services/Payment/CardPaymentService.php
```php
<?php

namespace App\Services\Payment;

use App\Services\Gateway\GatewayInterface;
use App\Services\Gateway\GatewayResolver;
use App\Helpers\PaymentStatusMapper;
use Illuminate\Support\Facades\Log;

/**
 * Serviço dedicado a pagamentos via cartão de crédito.
 * Encapsula criação de customer, cobrança e mapeamento de status.
 */
class CardPaymentService
{
    /**
     * Processar pagamento com cartão de crédito.
     *
     * @param array $input [amountBRL, installments, description, cardToken, cardHolderName, cardExpiry, cardCvv, remoteIp]
     * @param array $customerData [name, email, document]
     * @param string $billingCycle 'once' | 'annual'
     * @param GatewayInterface|null $gateway Gateway opcional (usa resolução automática se não informado)
     * @return array [gatewayId, status, raw]
     */
    public function charge(array $input, array $customerData, string $billingCycle = 'once', ?GatewayInterface $gateway = null): array
    {
        $gateway = $gateway ?? GatewayResolver::resolveGateway('asaas');

        $customerId = $gateway->createCustomer([
            'name' => $customerData['name'],
            'email' => $customerData['email'],
            'phone' => '',
            'document' => $customerData['document'],
            'zip' => '',
        ]);

        Log::info('CardPaymentService: Customer created', ['customerId' => $customerId]);

        if ($billingCycle === 'annual') {
            $result = $gateway->createSubscription($input, $customerId);
        } else {
            $result = $gateway->charge($input, $customerId);
        }

        Log::info('CardPaymentService: Payment processed', [
            'gatewayId' => $result['gatewayId'] ?? null,
            'status' => $result['status'] ?? null,
        ]);

        return $result;
    }

    /**
     * Mapear status do gateway para status interno.
     */
    public function mapStatus(string $gatewayStatus): string
    {
        return PaymentStatusMapper::mapStatus($gatewayStatus);
    }

    /**
     * Verificar se o status indica pagamento confirmado.
     */
    public function isPaid(string $gatewayStatus): bool
    {
        return PaymentStatusMapper::isPaid($gatewayStatus);
    }
}
```
### Arquivo: app/Services/Payment/PixPaymentService.php
```php
<?php

namespace App\Services\Payment;

use App\Services\Gateway\GatewayInterface;
use App\Services\Gateway\GatewayResolver;
use App\Helpers\PaymentStatusMapper;
use Illuminate\Support\Facades\Log;

/**
 * Serviço dedicado a pagamentos via PIX.
 * Encapsula criação de customer, cobrança e geração de QR Code.
 */
class PixPaymentService
{
    /**
     * Processar pagamento com PIX.
     *
     * @param array $input [amountBRL, description, remoteIp]
     * @param array $customerData [name, email, document]
     * @param GatewayInterface|null $gateway Gateway opcional
     * @return array [gatewayId, qrCodeBase64, qrCodePayload, expiresAt]
     */
    public function charge(array $input, array $customerData, ?GatewayInterface $gateway = null): array
    {
        $gateway = $gateway ?? GatewayResolver::resolveGateway('asaas');

        $customerId = $gateway->createCustomer([
            'name' => $customerData['name'],
            'email' => $customerData['email'],
            'phone' => '',
            'document' => $customerData['document'],
            'zip' => '',
        ]);

        Log::info('PixPaymentService: Customer created', ['customerId' => $customerId]);

        $result = $gateway->chargeViaPix($input, $customerId);

        Log::info('PixPaymentService: Payment created', [
            'gatewayId' => $result['gatewayId'] ?? null,
        ]);

        return $result;
    }

    /**
     * Mapear status do gateway para status interno.
     */
    public function mapStatus(string $gatewayStatus): string
    {
        return PaymentStatusMapper::mapStatus($gatewayStatus);
    }

    /**
     * Verificar se o status indica pagamento confirmado.
     */
    public function isPaid(string $gatewayStatus): bool
    {
        return PaymentStatusMapper::isPaid($gatewayStatus);
    }
}
```
### Arquivo: app/Services/Payment/BoletoPaymentService.php
```php
<?php

namespace App\Services\Payment;

use App\Services\Gateway\GatewayInterface;
use App\Services\Gateway\GatewayResolver;
use App\Helpers\PaymentStatusMapper;
use Illuminate\Support\Facades\Log;

/**
 * Serviço dedicado a pagamentos via Boleto.
 * Encapsula criação de customer, cobrança e geração do link/código do boleto.
 */
class BoletoPaymentService
{
    /**
     * Processar pagamento com Boleto.
     *
     * @param array $input [amountBRL, description, remoteIp]
     * @param array $customerData [name, email, document]
     * @param GatewayInterface|null $gateway Gateway opcional
     * @return array [gatewayId, boletoUrl, boletoBarcode]
     */
    public function charge(array $input, array $customerData, ?GatewayInterface $gateway = null): array
    {
        $gateway = $gateway ?? GatewayResolver::resolveGateway('asaas');

        $customerId = $gateway->createCustomer([
            'name' => $customerData['name'],
            'email' => $customerData['email'],
            'phone' => '',
            'document' => $customerData['document'],
            'zip' => '',
        ]);

        Log::info('BoletoPaymentService: Customer created', ['customerId' => $customerId]);

        $result = $gateway->chargeViaBoleto($input, $customerId);

        Log::info('BoletoPaymentService: Payment created', [
            'gatewayId' => $result['gatewayId'] ?? null,
        ]);

        return $result;
    }

    /**
     * Mapear status do gateway para status interno.
     */
    public function mapStatus(string $gatewayStatus): string
    {
        return PaymentStatusMapper::mapStatus($gatewayStatus);
    }

    /**
     * Verificar se o status indica pagamento confirmado.
     */
    public function isPaid(string $gatewayStatus): bool
    {
        return PaymentStatusMapper::isPaid($gatewayStatus);
    }
}
```
### Arquivo: app/Services/SplitService.php
```php
<?php

namespace App\Services;

use App\Models\SplitRule;
use App\Models\Transaction;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class SplitService
{
    public function calculateSplits(Transaction $transaction): array
    {
        $rules = SplitRule::where('company_id', $transaction->company_id)
            ->where('is_active', true)
            ->get();

        if ($rules->isEmpty()) {
            return [];
        }

        $splits = [];
        $totalAmount = $transaction->amount;
        $remainingAmount = $totalAmount;

        foreach ($rules as $rule) {
            $splitAmount = 0.0;

            if ($rule->percentage > 0) {
                $splitAmount = round($totalAmount * ($rule->percentage / 100), 2);
            }

            if ($rule->fixed_amount > 0) {
                $splitAmount += $rule->fixed_amount;
            }

            if ($splitAmount <= 0) {
                continue;
            }

            $splitAmount = min($splitAmount, $remainingAmount);
            $remainingAmount -= $splitAmount;

            $splits[] = [
                'wallet_id' => $rule->wallet_id,
                'recipient_name' => $rule->recipient_name,
                'percentage' => $rule->percentage,
                'fixed_amount' => $rule->fixed_amount,
                'amount' => $splitAmount,
                'description' => $rule->description ?? "Split for {$rule->recipient_name}",
            ];
        }

        if (empty($splits)) {
            return [];
        }

        if ($remainingAmount > 0) {
            $splits[0]['amount'] += $remainingAmount;
        }

        return $splits;
    }

    public function applySplits(array $gatewayData, array $splits): array
    {
        if (empty($splits)) {
            return $gatewayData;
        }

        $gatewayData['split'] = array_map(function ($split) {
            return [
                'walletId' => $split['wallet_id'],
                'fixedValue' => $split['amount'],
                'description' => $split['description'],
            ];
        }, $splits);

        return $gatewayData;
    }

    public function persistSplits(Transaction $transaction, array $splits): void
    {
        if (empty($splits)) {
            return;
        }

        DB::transaction(function () use ($transaction, $splits) {
            foreach ($splits as $split) {
                $transaction->splits()->create([
                    'company_id' => $transaction->company_id,
                    'wallet_id' => $split['wallet_id'],
                    'recipient_name' => $split['recipient_name'],
                    'amount' => $split['amount'],
                    'percentage' => $split['percentage'],
                    'fixed_amount' => $split['fixed_amount'],
                    'status' => 'pending',
                ]);
            }
        });
    }
}
```
### Arquivo: app/Services/SubscriptionService.php
```php
<?php

namespace App\Services;

use App\Models\Subscription;
use App\Models\Payment;
use App\Models\Transaction;
use App\Services\Gateway\GatewayResolver;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class SubscriptionService
{
    protected AsaasPaymentService $gateway;

    public function __construct(AsaasPaymentService $gateway)
    {
        $this->gateway = $gateway;
    }

    /**
     * Resolve the appropriate gateway instance for the subscription's company.
     */
    protected function resolveGateway(): \App\Services\Gateway\PaymentGatewayInterface
    {
        return GatewayResolver::resolveGateway('asaas');
    }

    /**
     * Process all subscriptions due today.
     */
    public function processDailyBilling(): void
    {
        $subs = Subscription::where('status', 'active')
            ->where('next_billing_date', '<=', now()->toDateString())
            ->get();

        foreach ($subs as $sub) {
            $this->processSubscriptionCharge($sub);
        }
    }

    /**
     * Process a single subscription charge.
     */
    public function processSubscriptionCharge(Subscription $sub): void
    {
        try {
            // 1. Get the last successful payment to reuse the card token
            $lastPayment = Payment::where('subscription_id', $sub->id)
                ->where('status', 'approved')
                ->whereNotNull('gateway_token')
                ->latest()
                ->first();

            if (!$lastPayment) {
                $this->handleFailure($sub, 'Card token not found');
                return;
            }

            // 2. Create a new transaction/payment for the renewal
            $transaction = $sub->company->transactions()->create([
                'customer_id' => $sub->customer_id,
                'gateway_id' => $sub->gateway_id,
                'amount' => $sub->amount,
                'currency' => $sub->currency,
                'status' => 'pending',
                'description' => "Renovação - {$sub->plan_name}",
            ]);

            // 3. Attempt charge with token
            $response = $this->gateway->processCardTokenPayment(
                $transaction->gateway_transaction_id ?? $transaction->uuid,
                $lastPayment->gateway_token
            );

            if ($response['status'] === 'CONFIRMED' || $response['status'] === 'RECEIVED') {
                $this->handleSuccess($sub, $transaction);
            } else {
                $this->handleFailure($sub, $response['lastError'] ?? 'Payment declined');
            }

        } catch (\Exception $e) {
            $this->handleFailure($sub, $e->getMessage());
        }
    }

    protected function handleSuccess(Subscription $sub, Transaction $transaction): void
    {
        $sub->update([
            'status' => 'active',
            'retry_count' => 0,
            'current_period_start' => now(),
            'current_period_end' => $this->calculateNextDate($sub, now()),
            'next_billing_date' => $this->calculateNextDate($sub, now()),
        ]);

        Log::info("Subscription renewed successfully", ['sub_uuid' => $sub->uuid]);

        // Placeholder for webhook notification or email
        // $this->notifyCustomer($sub, 'success');
    }

    protected function handleFailure(Subscription $sub, string $reason): void
    {
        $sub->retry_count++;

        if ($sub->retry_count >= 4) {
            $sub->status = 'past_due';
            $sub->save();
            Log::warning("Subscription moved to past_due after multiple failures", ['sub_uuid' => $sub->uuid, 'reason' => $reason]);
        } else {
            // Smart Retry Logic: D1, D3, D7
            $daysToAdd = match ($sub->retry_count) {
                1 => 1,
                2 => 3,
                3 => 7,
                default => 0
            };

            $sub->next_billing_date = now()->addDays($daysToAdd);
            $sub->save();

            Log::info("Subscription charge failed. Scheduled retry.", [
                'sub_uuid' => $sub->uuid,
                'retry_count' => $sub->retry_count,
                'next_attempt' => $sub->next_billing_date,
                'reason' => $reason
            ]);
        }

        // Placeholder for notification
        // $this->notifyCustomer($sub, 'failure');
    }

    protected function calculateNextDate(Subscription $sub, Carbon $baseDate): Carbon
    {
        return $sub->billing_cycle === 'anual'
            ? $baseDate->copy()->addYear()
            : $baseDate->copy()->addMonth();
    }
}
```
### Arquivo: app/Services/TransactionService.php
```php
<?php

namespace App\Services;

use App\Enums\PaymentStatus;
use App\Events\TransactionStatusChanged;
use App\Jobs\SendWebhookJob;
use App\Models\Integration;
use App\Models\Transaction;
use App\Models\TransactionItem;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use RuntimeException;

class TransactionService
{
    public function __construct(
        private AuditService $auditService,
        private Fraud\BasicFraudService $fraudService,
    ) {}

    public function create(array $data, Integration $integration): Transaction
    {
        return DB::transaction(function () use ($data, $integration) {
            $transaction = Transaction::create([
                'uuid' => Str::uuid(),
                'integration_id' => $integration->id,
                'company_id' => $integration->company_id,
                'amount' => $data['amount'],
                'status' => PaymentStatus::PENDING->value,
                'description' => $data['description'] ?? null,
                'customer_name' => $data['customer']['name'] ?? null,
                'customer_email' => $data['customer']['email'] ?? null,
                'customer_document' => $data['customer']['document'] ?? null,
                'ip_address' => $data['ip_address'] ?? null,
                'user_agent' => $data['user_agent'] ?? null,
                'metadata' => $data['metadata'] ?? null,
                'payment_method' => $data['payment_method'] ?? null,
                'installments' => $data['installments'] ?? 1,
            ]);

            if (!empty($data['items'])) {
                foreach ($data['items'] as $item) {
                    TransactionItem::create([
                        'transaction_id' => $transaction->id,
                        'name' => $item['name'],
                        'description' => $item['description'] ?? null,
                        'quantity' => $item['quantity'] ?? 1,
                        'unit_price' => $item['unit_price'],
                        'total_price' => ($item['quantity'] ?? 1) * $item['unit_price'],
                    ]);
                }
            }

            try {
                $analysis = $this->fraudService->analyze($transaction);

                $transaction->update([
                    'fraud_score' => $analysis->score,
                    'fraud_risk_level' => $analysis->risk_level,
                    'fraud_flags' => $analysis->flags,
                    'fraud_recommendation' => $analysis->recommendation,
                ]);

                if ($analysis->recommendation === 'reject') {
                    $transaction->update(['status' => PaymentStatus::REFUSED->value]);
                }
            } catch (\Throwable $e) {
                Log::error('Fraud analysis failed', [
                    'transaction' => $transaction->uuid,
                    'error' => $e->getMessage(),
                ]);
            }

            $this->auditService->log('transaction.created', $transaction, [
                'amount' => $data['amount'],
                'customer' => $data['customer'] ?? null,
            ]);

            return $transaction->fresh();
        });
    }

    public function getById(string $uuid): Transaction
    {
        $transaction = Transaction::where('uuid', $uuid)->first();

        if (!$transaction) {
            throw new RuntimeException("Transaction [{$uuid}] not found.");
        }

        return $transaction;
    }

    public function findByUuid(string $uuid, Integration $integration): ?Transaction
    {
        return Transaction::where('uuid', $uuid)
            ->where('company_id', $integration->company_id)
            ->first();
    }

    public function list(array $filters): Builder
    {
        $query = Transaction::query()->orderByDesc('created_at');

        if (!empty($filters['company_id'])) {
            $query->where('company_id', $filters['company_id']);
        }

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['start_date'])) {
            $query->whereDate('created_at', '>=', $filters['start_date']);
        }

        if (!empty($filters['end_date'])) {
            $query->whereDate('created_at', '<=', $filters['end_date']);
        }

        if (!empty($filters['customer_document'])) {
            $query->where('customer_document', $filters['customer_document']);
        }

        if (!empty($filters['customer_email'])) {
            $query->where('customer_email', $filters['customer_email']);
        }

        if (!empty($filters['min_amount'])) {
            $query->where('amount', '>=', $filters['min_amount']);
        }

        if (!empty($filters['max_amount'])) {
            $query->where('amount', '<=', $filters['max_amount']);
        }

        if (!empty($filters['search'])) {
            $query->where(function ($q) use ($filters) {
                $q->where('uuid', 'like', "%{$filters['search']}%")
                    ->orWhere('customer_name', 'like', "%{$filters['search']}%")
                    ->orWhere('customer_email', 'like', "%{$filters['search']}%")
                    ->orWhere('customer_document', 'like', "%{$filters['search']}%");
            });
        }

        return $query;
    }

    public function listPaginated(array $filters, int $perPage = 15)
    {
        return $this->list($filters)->paginate($perPage);
    }

    public function cancel(string $uuid, Integration $integration): Transaction
    {
        return DB::transaction(function () use ($uuid, $integration) {
            $transaction = $this->findByUuid($uuid, $integration);

            if (!$transaction) {
                throw new RuntimeException("Transaction [{$uuid}] not found or access denied.");
            }

            if (!in_array($transaction->status, [PaymentStatus::PENDING->value, PaymentStatus::APPROVED->value])) {
                throw new RuntimeException("Transaction [{$uuid}] cannot be cancelled in current status [{$transaction->status}].");
            }

            $this->updateStatus($transaction, PaymentStatus::CANCELLED->value);

            $this->auditService->log('transaction.cancelled', $transaction);

            return $transaction->fresh();
        });
    }

    public function refund(string $uuid, Integration $integration, ?float $amount = null): Transaction
    {
        return DB::transaction(function () use ($uuid, $integration, $amount) {
            $transaction = $this->findByUuid($uuid, $integration);

            if (!$transaction) {
                throw new RuntimeException("Transaction [{$uuid}] not found or access denied.");
            }

            if ($transaction->status !== PaymentStatus::APPROVED->value) {
                throw new RuntimeException("Transaction [{$uuid}] cannot be refunded in current status [{$transaction->status}].");
            }

            $refundAmount = $amount ?? $transaction->amount;

            if ($refundAmount > $transaction->amount) {
                throw new RuntimeException('Refund amount exceeds transaction amount.');
            }

            $newStatus = $refundAmount >= $transaction->amount
                ? PaymentStatus::REFUNDED->value
                : PaymentStatus::PARTIALLY_REFUNDED->value;

            $this->updateStatus($transaction, $newStatus);

            $transaction->update([
                'refunded_amount' => ($transaction->refunded_amount ?? 0) + $refundAmount,
            ]);

            $this->auditService->log('transaction.refunded', $transaction, [
                'refund_amount' => $refundAmount,
            ]);

            return $transaction->fresh();
        });
    }

    public function updateStatus(Transaction $transaction, string $newStatus): void
    {
        $oldStatus = $transaction->status;

        if ($oldStatus === $newStatus) {
            return;
        }

        $transaction->update([
            'status' => $newStatus,
            'status_changed_at' => now(),
        ]);

        event(new TransactionStatusChanged($transaction, $oldStatus, $newStatus));

        if ($transaction->integration) {
            SendWebhookJob::dispatch(
                $newStatus,
                $transaction->toArray(),
                $transaction->company_id,
            );
        }

        $this->auditService->log('transaction.status_updated', $transaction, [
            'old_status' => $oldStatus,
            'new_status' => $newStatus,
        ]);
    }
}
```
### Arquivo: app/Services/IntegrationService.php
```php
<?php

namespace App\Services;

use App\Models\Company;
use App\Models\Integration;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class IntegrationService
{
    public function register(array $data, Company $company): array
    {
        $plainApiKey = Str::random(64);
        $plainHash = Str::random(32);

        $integration = DB::transaction(function () use ($data, $company, $plainApiKey, $plainHash) {
            return Integration::create([
                'company_id' => $company->id,
                'gateway_id' => $data['gateway_id'],
                'name' => $data['name'],
                'environment' => $data['environment'] ?? env('APP_ENV', 'sandbox'),
                'api_key_hash' => Hash::make($plainApiKey),
                'hash' => $plainHash,
                'webhook_url' => $data['webhook_url'] ?? null,
                'webhook_secret' => ! empty($data['webhook_url']) ? Str::random(32) : null,
                'is_active' => true,
                'settings' => $data['settings'] ?? null,
            ]);
        });

        return [
            'integration' => $integration,
            'api_key' => $plainApiKey,
            'hash' => $plainHash,
        ];
    }

    public function authenticate(string $apiKey): ?Integration
    {
        $integrations = Integration::where('is_active', true)->get();

        foreach ($integrations as $integration) {
            if (Hash::check($apiKey, $integration->api_key_hash)) {
                $integration->update(['last_used_at' => now()]);

                return $integration;
            }
        }

        return null;
    }

    public function list(Company $company): Collection
    {
        return Integration::where('company_id', $company->id)
            ->with('gateway')
            ->orderByDesc('created_at')
            ->get();
    }

    public function update(Integration $integration, array $data): Integration
    {
        $integration->update([
            'name' => $data['name'] ?? $integration->name,
            'webhook_url' => $data['webhook_url'] ?? $integration->webhook_url,
            'settings' => $data['settings'] ?? $integration->settings,
            'environment' => $data['environment'] ?? $integration->environment,
        ]);

        return $integration->fresh();
    }

    public function revoke(Integration $integration): void
    {
        $integration->update([
            'is_active' => false,
            'revoked_at' => now(),
        ]);
    }
}
```
### Arquivo: app/Services/AsaasPaymentService.php
```php
<?php

declare(strict_types=1);

namespace App\Services;

use App\Services\Gateway\AsaasGateway;

class AsaasPaymentService
{
    private AsaasGateway $gateway;

    public function __construct()
    {
        // Gateway será resolvido por transação ou via forRequest() quando necessário.
    }

    public function gateway($resource = null): AsaasGateway
    {
        if ($resource) {
            return $this->forTransaction($resource);
        }

        try {
            return AsaasGateway::fromRequest();
        } catch (\Throwable $e) {
            // Se falhar o fromRequest (ex: checkout público), tentamos resolver pelo contexto da request
            $company = request()->attributes->get('company');
            if ($company) {
                $gateway = $company->defaultGateway();
                if ($gateway) {
                    return AsaasGateway::fromGatewayModel($gateway);
                }
            }

            throw new \RuntimeException('AsaasPaymentService: Não foi possível resolver o gateway. Contexto ausente.');
        }
    }

    public function forTransaction($transaction): AsaasGateway
    {
        if ($transaction->gateway) {
            return AsaasGateway::fromGatewayModel($transaction->gateway);
        }

        $gateway = $transaction->company?->defaultGateway();

        if (!$gateway) {
            throw new \RuntimeException('Gateway não configurado para esta empresa.');
        }

        return AsaasGateway::fromGatewayModel($gateway);
    }

    public function getPayment(string $paymentId, $transaction = null): ?array
    {
        return $this->gateway($transaction)->getPayment($paymentId);
    }

    public function getSubscription(string $subscriptionId, $transaction = null): ?array
    {
        return $this->gateway($transaction)->getSubscription($subscriptionId);
    }

    public function getPixQrCode(string $paymentId, $transaction = null): ?array
    {
        return $this->gateway($transaction)->getPixQrCode($paymentId);
    }

    public function cancelPayment(string $paymentId, $transaction = null): array
    {
        return $this->gateway($transaction)->cancelPayment($paymentId);
    }

    public function refundPayment(string $paymentId, ?float $amount = null, $transaction = null): array
    {
        return $this->gateway($transaction)->refundPayment($paymentId, $amount);
    }

    public function processCardPayment(string $id, array $cardData, ?string $remoteIp = null, $transaction = null): array
    {
        return $this->gateway($transaction)->payWithCard($id, $cardData, $remoteIp ?? request()->ip());
    }

    public function processCardTokenPayment(string $id, string $cardToken, $transaction = null): array
    {
        return $this->gateway($transaction)->processCardTokenPayment($id, $cardToken);
    }
}
```
### Arquivo: app/Services/WebhookNotifierService.php
```php
<?php

namespace App\Services;

use App\Models\SourceConfig;
use App\Models\Transaction;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class WebhookNotifierService
{
    public function notify(Transaction $transaction): void
    {
        $source = $transaction->source;
        
        if (!$source) {
            Log::warning('WebhookNotifier: No source configured', [
                'transaction_id' => $transaction->id,
            ]);
            return;
        }

        $config = SourceConfig::where('source_name', $source)->first();
        
        if (!$config || !$config->isActive()) {
            Log::warning('WebhookNotifier: Source config not found or inactive', [
                'source' => $source,
            ]);
            return;
        }

        $event = $this->mapEvent($transaction->status);
        
        $payload = [
            'event' => $event,
            'asaas_payment_id' => $transaction->asaas_payment_id,
            'external_id' => $transaction->external_id,
            'amount' => (float) $transaction->amount,
            'status' => $transaction->status,
            'paid_at' => $transaction->paid_at?->toIso8601String(),
            'source' => $source,
        ];

        $signature = hash_hmac('sha256', json_encode($payload), $config->webhook_secret);

        try {
            $response = Http::withHeaders([
                'X-Checkout-Signature' => $signature,
                'Content-Type' => 'application/json',
            ])->timeout(30)->post($config->callback_url, $payload);

            Log::info('WebhookNotifier: Notification sent', [
                'source' => $source,
                'event' => $event,
                'status' => $response->status(),
            ]);
        } catch (\Exception $e) {
            Log::error('WebhookNotifier: Failed to send notification', [
                'source' => $source,
                'error' => $e->getMessage(),
            ]);
        }
    }

    private function mapEvent(string $status): string
    {
        return match ($status) {
            'approved' => 'PAYMENT_APPROVED',
            'refused' => 'PAYMENT_REFUSED',
            'overdue' => 'PAYMENT_OVERDUE',
            'cancelled' => 'PAYMENT_CANCELED',
            'refunded' => 'PAYMENT_REFUNDED',
            default => 'PAYMENT_UNKNOWN',
        };
    }
}```
### Arquivo: app/Services/CustomerService.php
```php
<?php

namespace App\Services;

use App\Models\Company;
use App\Models\Customer;
use App\Services\Gateway\GatewayInterface;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class CustomerService
{
    public function create(array $data, Company $company): Customer
    {
        return DB::transaction(function () use ($data, $company) {
            if (!empty($data['document'])) {
                $data['document'] = preg_replace('/\D/', '', $data['document']);
            }

            return Customer::create([
                'company_id' => $company->id,
                'name' => $data['name'],
                'email' => $data['email'] ?? null,
                'document' => $data['document'] ?? null,
                'phone' => $data['phone'] ?? null,
                'address' => $data['address'] ?? null,
                'address_number' => $data['address_number'] ?? null,
                'complement' => $data['complement'] ?? null,
                'neighborhood' => $data['neighborhood'] ?? null,
                'city' => $data['city'] ?? null,
                'state' => $data['state'] ?? null,
                'zip_code' => $data['zip_code'] ?? null,
                'metadata' => $data['metadata'] ?? null,
            ]);
        });
    }

    public function findOrCreate(array $data, Company $company): Customer
    {
        $document = !empty($data['document']) ? preg_replace('/\D/', '', $data['document']) : null;

        $customer = $company->customers()
            ->when($document, function ($query) use ($document) {
                $query->where('document', $document);
            })
            ->when(!$document && !empty($data['email']), function ($query) use ($data) {
                $query->where('email', $data['email']);
            })
            ->first();

        if ($customer) {
            return $this->update($customer, $data);
        }

        return $this->create($data, $company);
    }

    public function getById(string $id, Company $company): Customer
    {
        $customer = $company->customers()->where('uuid', $id)->first();

        if (!$customer) {
            throw new RuntimeException("Customer [{$id}] not found.");
        }

        return $customer;
    }

    public function list(Company $company, array $filters): Builder
    {
        $query = $company->customers()->orderByDesc('created_at');

        if (!empty($filters['search'])) {
            $query->where(function ($q) use ($filters) {
                $search = $filters['search'];
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('document', 'like', "%{$search}%")
                    ->orWhere('uuid', 'like', "%{$search}%");
            });
        }

        if (!empty($filters['email'])) {
            $query->where('email', $filters['email']);
        }

        if (!empty($filters['document'])) {
            $query->where('document', preg_replace('/\D/', '', $filters['document']));
        }

        return $query;
    }

    public function update(Customer $customer, array $data): Customer
    {
        if (!empty($data['document'])) {
            $data['document'] = preg_replace('/\D/', '', $data['document']);
        }

        $customer->update([
            'name' => $data['name'] ?? $customer->name,
            'email' => $data['email'] ?? $customer->email,
            'document' => $data['document'] ?? $customer->document,
            'phone' => $data['phone'] ?? $customer->phone,
            'address' => $data['address'] ?? $customer->address,
            'address_number' => $data['address_number'] ?? $customer->address_number,
            'complement' => $data['complement'] ?? $customer->complement,
            'neighborhood' => $data['neighborhood'] ?? $customer->neighborhood,
            'city' => $data['city'] ?? $customer->city,
            'state' => $data['state'] ?? $customer->state,
            'zip_code' => $data['zip_code'] ?? $customer->zip_code,
            'metadata' => $data['metadata'] ?? $customer->metadata,
        ]);

        return $customer->fresh();
    }

    public function syncWithGateway(Customer $customer, GatewayInterface $gateway): void
    {
        $response = $gateway->createCustomer([
            'name' => $customer->name,
            'document' => $customer->document,
            'email' => $customer->email,
            'phone' => $customer->phone,
            'address' => $customer->address,
            'address_number' => $customer->address_number,
            'state' => $customer->state,
            'zip_code' => $customer->zip_code,
            'external_reference' => $customer->uuid,
        ]);

        $customer->update([
            'gateway_id' => $response['id'],
            'gateway_data' => $response,
        ]);
    }
}
```
### Arquivo: app/Services/ReportService.php
```php
<?php

namespace App\Services;

use App\Models\Company;
use App\Models\FinancialReport;
use App\Models\Transaction;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class ReportService
{
    public function generateSummary(Company $company, Carbon $start, Carbon $end): array
    {
        $baseQuery = Transaction::where('company_id', $company->id)
            ->whereBetween('created_at', [$start, $end]);

        $totalTransactions = (clone $baseQuery)->count();
        $approvedTransactions = (clone $baseQuery)->where('status', 'approved')->count();
        $refusedTransactions = (clone $baseQuery)->where('status', 'refused')->count();
        $refundedTransactions = (clone $baseQuery)->whereIn('status', ['refunded', 'partially_refunded'])->count();

        $totalAmount = (clone $baseQuery)->sum('amount') ?? 0;
        $approvedAmount = (clone $baseQuery)->where('status', 'approved')->sum('amount') ?? 0;
        $refundedAmount = (clone $baseQuery)->sum('refunded_amount') ?? 0;

        $avgTicket = $approvedTransactions > 0 ? round($approvedAmount / $approvedTransactions, 2) : 0;
        $approvalRate = $totalTransactions > 0 ? round(($approvedTransactions / $totalTransactions) * 100, 2) : 0;

        $byPaymentMethod = (clone $baseQuery)
            ->selectRaw('billing_type, COUNT(*) as count, SUM(amount) as total')
            ->groupBy('billing_type')
            ->get()
            ->keyBy('billing_type');

        $byGateway = Transaction::where('company_id', $company->id)
            ->whereBetween('created_at', [$start, $end])
            ->join('payments', 'transactions.id', '=', 'payments.transaction_id')
            ->join('gateways', 'payments.gateway_id', '=', 'gateways.id')
            ->selectRaw('gateways.name as gateway, COUNT(*) as count, SUM(payments.amount) as total')
            ->groupBy('gateways.name')
            ->get()
            ->keyBy('gateway');

        return [
            'period' => [
                'start' => $start->toDateString(),
                'end' => $end->toDateString(),
            ],
            'totals' => [
                'transactions' => $totalTransactions,
                'approved' => $approvedTransactions,
                'refused' => $refusedTransactions,
                'refunded' => $refundedTransactions,
            ],
            'amounts' => [
                'total' => $totalAmount,
                'approved' => $approvedAmount,
                'refunded' => $refundedAmount,
                'net' => $approvedAmount - $refundedAmount,
            ],
            'metrics' => [
                'average_ticket' => $avgTicket,
                'approval_rate' => $approvalRate,
            ],
            'by_payment_method' => $byPaymentMethod,
            'by_gateway' => $byGateway,
        ];
    }

    public function generateByPeriod(Company $company, string $period): array
    {
        $now = now();

        $format = match ($period) {
            'daily' => '%Y-%m-%d',
            'weekly' => '%Y-%u',
            'monthly' => '%Y-%m',
            default => throw new \InvalidArgumentException("Invalid period: {$period}. Use daily, weekly, or monthly."),
        };

        $start = match ($period) {
            'daily' => $now->copy()->subDays(30),
            'weekly' => $now->copy()->subWeeks(12),
            'monthly' => $now->copy()->subMonths(12),
        };

        $data = Transaction::where('company_id', $company->id)
            ->where('created_at', '>=', $start)
            ->selectRaw(
                "DATE_FORMAT(created_at, '{$format}') as period, " .
                "COUNT(*) as total_transactions, " .
                "SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved_transactions, " .
                "SUM(amount) as total_amount, " .
                "SUM(CASE WHEN status = 'approved' THEN amount ELSE 0 END) as approved_amount"
            )
            ->groupBy('period')
            ->orderBy('period')
            ->get();

        return [
            'period_type' => $period,
            'data' => $data,
        ];
    }

    public function exportCsv(Company $company, Carbon $start, Carbon $end): string
    {
        $transactions = Transaction::where('company_id', $company->id)
            ->whereBetween('created_at', [$start, $end])
            ->with(['customer', 'payments'])
            ->orderBy('created_at')
            ->get();

        $lines = [];
        $lines[] = implode(',', [
            'UUID', 'Date', 'Customer', 'Email', 'Document',
            'Amount', 'Status', 'Billing Type', 'Refunded Amount',
        ]);

        foreach ($transactions as $t) {
            $lines[] = implode(',', [
                $t->uuid,
                $t->created_at->format('Y-m-d H:i:s'),
                '"' . str_replace('"', '""', $t->customer_name ?? '') . '"',
                '"' . ($t->customer_email ?? '') . '"',
                $t->customer_document ?? '',
                number_format($t->amount, 2, '.', ''),
                $t->status,
                $t->billing_type ?? $t->payments->first()?->billing_type ?? '',
                number_format($t->refunded_amount ?? 0, 2, '.', ''),
            ]);
        }

        $csv = implode("\n", $lines);

        $filename = "reports/{$company->uuid}/{$start->format('Ymd')}-{$end->format('Ymd')}.csv";
        Storage::put($filename, $csv);

        return $filename;
    }

    public function saveReport(Company $company, array $data): FinancialReport
    {
        return FinancialReport::create([
            'company_id' => $company->id,
            'type' => $data['type'] ?? 'summary',
            'period_start' => $data['period_start'],
            'period_end' => $data['period_end'],
            'data' => $data,
            'total_transactions' => $data['totals']['transactions'] ?? 0,
            'total_amount' => $data['amounts']['total'] ?? 0,
            'approved_amount' => $data['amounts']['approved'] ?? 0,
            'refunded_amount' => $data['amounts']['refunded'] ?? 0,
            'approval_rate' => $data['metrics']['approval_rate'] ?? 0,
        ]);
    }
}
```
### Arquivo: app/Services/AuditService.php
```php
<?php

namespace App\Services;

use App\Models\AuditLog;
use Illuminate\Database\Eloquent\Model;

class AuditService
{
    public function log(string $action, ?Model $entity = null, array $data = []): AuditLog
    {
        return AuditLog::create([
            'company_id' => $entity?->company_id,
            'action' => $action,
            'entity_type' => $entity ? get_class($entity) : null,
            'entity_id' => $entity?->getKey(),
            'new_values' => $data ?: null,
            'ip_address' => request()?->ip(),
            'user_agent' => request()?->userAgent(),
        ]);
    }
}
```
### Arquivo: app/Services/Gateway/GatewayResolver.php
```php
<?php

declare(strict_types=1);

namespace App\Services\Gateway;

use App\Models\Gateway;
use App\Services\CheckoutService;
use RuntimeException;

class GatewayResolver
{
    public static function resolveGateway(?string $type = null): AsaasGateway
    {
        return AsaasGateway::fromRequest();
    }

    public static function getDefaultGateway(): ?Gateway
    {
        $companyId = CheckoutService::resolveCompanyId();
        if (! $companyId) return null;

        return Gateway::where('company_id', $companyId)
            ->where('status', 'active')
            ->where('is_default', true)
            ->first()
            ?? Gateway::where('company_id', $companyId)
                ->where('status', 'active')
                ->first();
    }

    /** @deprecated Use AsaasGateway::fromRequest() diretamente. */
    public static function resolveApiKey(): string
    {
        $gateway = static::getDefaultGateway();
        if ($gateway) {
            $key = $gateway->getConfig('api_key', '');
            if (! empty($key)) return $key;
        }
        throw new RuntimeException(
            'GatewayResolver: API key não encontrada. Configure o gateway em Dashboard → Gateways.'
        );
    }
}```
### Arquivo: app/Services/Gateway/GatewayFactory.php
```php
<?php

declare(strict_types=1);

namespace App\Services\Gateway;

use App\Models\Integration;
use RuntimeException;

class GatewayFactory
{
    public static function create(): AsaasGateway
    {
        return AsaasGateway::fromRequest();
    }

    public static function createFromIntegration(Integration $integration): AsaasGateway
    {
        return AsaasGateway::fromIntegration($integration);
    }

    public static function make(string $gatewayType = 'asaas'): AsaasGateway
    {
        return match (strtolower($gatewayType)) {
            'asaas' => AsaasGateway::fromRequest(),
            default => throw new RuntimeException(
                "GatewayFactory: [{$gatewayType}] não existe em produção. Use 'asaas'."
            ),
        };
    }
}
```
### Arquivo: app/Services/Gateway/AsaasGateway.php
```php
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
```
### Arquivo: app/Services/Gateway/GatewayInterface.php
```php
<?php

namespace App\Services\Gateway;

interface GatewayInterface
{
    public function createCustomer(array $data): string;

    public function createPayment(array $data): array;

    public function createSubscription(array $data): array;

    public function getPayment(string $paymentId): ?array;

    public function cancelPayment(string $paymentId): array;

    public function refundPayment(string $paymentId, ?float $amount = null): array;

    public function generatePix(array $data): array;

    public function generateBoleto(array $data): array;

    public function processWebhook(\Illuminate\Http\Request $request): array;

    public function createSplit(array $data): array;
}
```
### Arquivo: app/Helpers/PaymentStatusMapper.php
```php
<?php

declare(strict_types=1);

namespace App\Helpers;

/**
 * ÚNICO arquivo de mapeamento de status do sistema.
 * NUNCA duplique mapStatus() ou isPaid() em outro lugar.
 *
 * [QA-03] WebhookController tinha statusMap inline → usa mapStatus()
 * [QA-04] CardPaymentService/PixPaymentService/BoletoPaymentService
 *         tinham mapStatus() e isPaid() próprios → removidos, usam este
 * [QA-06] CheckoutController fazia in_array(['CONFIRMED','RECEIVED']) → usa isPaid()
 */
class PaymentStatusMapper
{
    /**
     * Converte o status do Asaas para o status interno do sistema.
     *
     * CONFIRMED / RECEIVED / RECEIVED_IN_CASH  → 'approved'
     * PENDING / AWAITING_RISK_ANALYSIS         → 'pending'
     * OVERDUE                                  → 'overdue'
     * REFUNDED / REFUND_REQUESTED / CHARGEBACK → 'refunded'
     * CANCELED / DELETED                       → 'cancelled'
     * (qualquer outro)                         → 'pending'
     */
    public static function mapStatus(string $gatewayStatus): string
    {
        return match ($gatewayStatus) {
            'CONFIRMED', 'RECEIVED', 'RECEIVED_IN_CASH' => 'approved',
            'PENDING', 'AWAITING_RISK_ANALYSIS' => 'pending',
            'OVERDUE' => 'overdue',
            'REFUNDED', 'REFUND_REQUESTED' => 'refunded',
            'CHARGEBACK', 'CHARGEBACK_REQUESTED', 'CHARGEBACK_DISPUTE' => 'chargeback',
            'CANCELED', 'DELETED' => 'cancelled',
            default => 'pending',
        };
    }

    /**
     * Retorna true se o status indica pagamento confirmado.
     *
     * [QA-06] Substitui TODOS os in_array($status, ['CONFIRMED','RECEIVED'])
     *         espalhados no código.
     *
     * Uso:
     *   if (PaymentStatusMapper::isPaid($response['status'])) {
     *       $transaction->update(['status' => 'approved', 'paid_at' => now()]);
     *   }
     */
    public static function isPaid(string $gatewayStatus): bool
    {
        return in_array($gatewayStatus, [
            'CONFIRMED',
            'RECEIVED',
            'RECEIVED_IN_CASH',
        ], true);
    }

    /**
     * Converte billingType do Asaas para método interno.
     *
     * CREDIT_CARD / CREDITCARD → 'credit_card'
     * PIX                      → 'pix'
     * BOLETO                   → 'boleto'
     */
    public static function mapPaymentMethod(string $billingType): string
    {
        return match ($billingType) {
            'CREDIT_CARD', 'CREDITCARD' => 'credit_card',
            'PIX' => 'pix',
            'BOLETO' => 'boleto',
            default => 'credit_card',
        };
    }

    /**
     * Converte status interno para evento de webhook.
     * Usado pelos Listeners (DispatchWebhookOn*).
     */
    public static function mapToWebhookEvent(string $internalStatus): string
    {
        return match ($internalStatus) {
            'approved' => 'payment.approved',
            'refused' => 'payment.refused',
            'refunded' => 'payment.refunded',
            'cancelled' => 'payment.cancelled',
            'overdue' => 'payment.overdue',
            default => 'payment.pending',
        };
    }
}```
