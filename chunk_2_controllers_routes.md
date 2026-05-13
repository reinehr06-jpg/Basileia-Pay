# Chunk 2: Controllers & Routes
### Arquivo: app/Http/Controllers/Vendors/BaseVendorController.php
```php
<?php

namespace App\Http\Controllers\Vendors;

use Illuminate\Http\Request;

abstract class BaseVendorController
{
    abstract public function handle(Request $request, string $identifier);

    abstract public function process(Request $request, string $identifier);

    abstract public function success(string $identifier);

    protected function validateHash(string $payload, string $signature, string $secret): bool
    {
        $expectedSignature = hash_hmac('sha256', $payload, $secret);
        return hash_equals($expectedSignature, $signature);
    }

    protected function createSecureTransaction(array $data)
    {
        return \App\Models\Transaction::create($data);
    }

    protected function getVendorConfig(string $vendorKey): ?array
    {
        return config("vendors.$vendorKey");
    }
}```
### Arquivo: app/Http/Controllers/Vendors/DefaultVendorController.php
```php
<?php

namespace App\Http\Controllers\Vendors;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use App\Services\AsaasPaymentService;
use App\Services\CheckoutService;
use App\Services\Gateway\GatewayResolver;
use App\Helpers\PaymentStatusMapper;
use App\Services\WebhookNotifierService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class DefaultVendorController extends Controller
{
    public function __construct(
        private AsaasPaymentService $asaasService,
        private WebhookNotifierService $webhookNotifier,
    ) {
    }

    public function handle(Request $request, string $asaasPaymentId)
    {
        try {
            Log::info('DefaultVendor: Iniciando checkout', [
                'asaas_payment_id' => $asaasPaymentId,
                'params' => $request->all(),
            ]);

            GatewayResolver::resolveApiKey();

            $asaasPayment = $this->asaasService->getPayment($asaasPaymentId);

            if (!$asaasPayment) {
                Log::warning('DefaultVendor: Payment not found', [
                    'asaas_payment_id' => $asaasPaymentId,
                ]);
                return view('checkout.error', ['message' => 'Pagamento não encontrado']);
            }

            $pixData = [];
            if (isset($asaasPayment['billingType']) && $asaasPayment['billingType'] === 'PIX') {
                $pixData = $this->asaasService->getPixQrCode($asaasPaymentId) ?? [];
            }

            $customer = $asaasPayment['customer'] ?? [];
            $billingType = $asaasPayment['billingType'] ?? strtoupper($request->get('metodo', $request->get('forma_pagamento', 'CREDIT_CARD')));

            $isCustomerArray = is_array($customer);

            $customerData = [
                'name' => ($isCustomerArray ? ($customer['name'] ?? null) : null) ?? '',
                'email' => ($isCustomerArray ? ($customer['email'] ?? null) : null) ?? '',
                'phone' => ($isCustomerArray ? ($customer['phone'] ?? null) : null) ?? '',
                'document' => ($isCustomerArray ? ($customer['cpfCnpj'] ?? null) : null) ?? '',
                'address' => [
                    'street' => $isCustomerArray ? ($customer['address'] ?? '') : '',
                    'number' => $isCustomerArray ? ($customer['addressNumber'] ?? '') : '',
                    'neighborhood' => $isCustomerArray ? ($customer['neighborhood'] ?? '') : '',
                    'city' => $isCustomerArray ? ($customer['city'] ?? '') : '',
                    'state' => $isCustomerArray ? ($customer['state'] ?? '') : '',
                    'postalCode' => $isCustomerArray ? ($customer['postalCode'] ?? '') : '',
                ],
            ];

            $transaction = Transaction::where('asaas_payment_id', $asaasPaymentId)->first();

            $plano = $request->get('plano', $asaasPayment['description'] ?? 'Plano');
            $ciclo = $request->get('ciclo', 'mensal');

            if (!$transaction) {
                $companyId = CheckoutService::resolveCompanyId();

                $transaction = Transaction::create([
                    'uuid' => (string) Str::uuid(),
                    'company_id' => $companyId,
                    'asaas_payment_id' => $asaasPaymentId,
                    'source' => 'default_vendor',
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
                        'plano' => $plano,
                        'ciclo' => $ciclo,
                        'venda_id' => '',
                        'hash' => '',
                    ],
                ]);

                Log::info('DefaultVendor: Transação criada', [
                    'transaction_id' => $transaction->id,
                    'uuid' => $transaction->uuid,
                ]);
            }

            return view('checkout.card.front.pagamento', [
                'step' => $request->get('success') ? 3 : 1,
                'transaction' => $transaction,
                'paymentMethod' => strtolower($asaasPayment['billingType'] ?? 'pix'),
                'asaasPayment' => $asaasPayment,
                'customerData' => $customerData,
                'plano' => $plano,
                'ciclo' => $ciclo,
                'pixData' => $pixData ?? ['payload' => '', 'encodedImage' => ''],
            ])->render();
        } catch (\Exception $e) {
            Log::error('DefaultVendor: FATAL ERROR', [
                'msg' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ]);
            return view('checkout.error', [
                'message' => 'Erro ao processar pagamento. Por favor, tente novamente ou entre em contato com o suporte.'
            ]);
        }
    }

    public function process(Request $request, string $asaasPaymentId)
    {
        $transaction = Transaction::where('asaas_payment_id', $asaasPaymentId)->firstOrFail();

        $request->validate([
            'card_number' => 'required|string',
            'card_name' => 'required|string',
            'card_expiry' => 'required|string',
            'card_cvv' => 'required|string',
        ]);

        try {
            $asaasResponse = $this->asaasService->processCardPayment($asaasPaymentId, [
                'card_number' => $request->input('card_number'),
                'card_name' => $request->input('card_name'),
                'card_expiry' => $request->input('card_expiry'),
                'card_cvv' => $request->input('card_cvv'),
                'card_document' => $transaction->customer_document,
                'card_email' => $transaction->customer_email,
                'card_phone' => $transaction->customer_phone,
            ]);

            $status = PaymentStatusMapper::mapStatus($asaasResponse['status'] ?? '');
            $paidAt = PaymentStatusMapper::isPaid($asaasResponse['status'] ?? '') ? now() : null;

            $safeResponse = collect($asaasResponse ?? [])->except(['creditCardToken', 'creditCard', 'number', 'ccv', 'expiryMonth', 'expiryYear', 'holderName', 'creditCardHolderInfo'])->toArray();

            $transaction->update([
                'status' => $status,
                'paid_at' => $paidAt,
                'gateway_response' => $safeResponse,
            ]);

            $this->webhookNotifier->notify($transaction);

            return redirect()->to(route('basileia.checkout.show', $asaasPaymentId) . '?success=1');
        } catch (\Exception $e) {
            Log::error('DefaultVendor: Payment failed', ['error' => $e->getMessage()]);
            return back()->withErrors(['payment' => $e->getMessage()])->withInput();
        }
    }

    public function success(string $uuid)
    {
        $transaction = Transaction::where('uuid', $uuid)->firstOrFail();
        return redirect()->to(route('basileia.checkout.show', $transaction->asaas_payment_id) . '?success=1');
    }
}```
### Arquivo: app/Http/Controllers/Vendors/VendorLookupController.php
```php
<?php

namespace App\Http\Controllers\Vendors;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use App\Models\Subscription;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class VendorLookupController extends Controller
{
    public function handle(Request $request, string $uuid)
    {
        $transaction = Transaction::where('uuid', $uuid)->first();
        $subscription = Subscription::where('uuid', $uuid)->first();

        $source = $transaction?->source ?? $subscription?->source ?? 'default';

        Log::info('VendorLookup: Roteando checkout', [
            'uuid' => $uuid,
            'source' => $source,
        ]);

        if ($transaction) {
            return redirect()->route('basileia.checkout.show', [
                'asaasPaymentId' => $transaction->asaas_payment_id,
            ]);
        }

        if ($subscription) {
            return redirect()->route('basileia.checkout.show', [
                'asaasPaymentId' => $subscription->gateway_subscription_id,
            ]);
        }

        return view('checkout.error', ['message' => 'Checkout não encontrado']);
    }
}```
### Arquivo: app/Http/Controllers/Controller.php
```php
<?php

namespace App\Http\Controllers;

use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Foundation\Validation\ValidatesRequests;
use Illuminate\Routing\Controller as BaseController;

class Controller extends BaseController
{
    use AuthorizesRequests, ValidatesRequests;
}
```
### Arquivo: app/Http/Controllers/CheckoutController.php
```php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\AsaasPaymentService;
use App\Models\Transaction;
use App\Models\Subscription;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

/**
 * @deprecated Legacy checkout controller.
 * Use CardCheckoutController, PixCheckoutController, or BoletoCheckoutController instead.
 * This controller is kept for backward compatibility only.
 */
class CheckoutController extends Controller
{
    protected $asaas;

    public function __construct(AsaasPaymentService $asaas)
    {
        $this->asaas = $asaas;
    }

    /**
     * Show the checkout page.
    public function show(Request $request, string $uuid)
    {
        // Valida formato UUID antes de bater no banco (camada dupla de segurança)
        if (!preg_match('/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i', $uuid)) {
            return $this->showDemo($request, $uuid);
        }

        $resource = Transaction::where('uuid', $uuid)->first() 
                   ?? Subscription::where('uuid', $uuid)->firstOrFail();

        $isSubscription = $resource instanceof Subscription;
        $gatewayId = $isSubscription ? $resource->gateway_subscription_id : $resource->asaas_payment_id;

        $asaasData = [];
        $pixData = [];

        try {
            if ($isSubscription) {
                $asaasData = $this->asaas->getSubscription($gatewayId);
            } else {
                $asaasData = $this->asaas->getPayment($gatewayId);
            }
        } catch (\Exception $e) {
            Log::error("Failed to fetch data from Asaas: " . $e->getMessage());
            $asaasData = [
                'value' => $resource->amount,
                'billingType' => 'CREDIT_CARD',
                'status' => 'PENDING'
            ];
        }

        $paymentMethod = $asaasData['billingType'] ?? 'CREDIT_CARD';

        $locale = $request->get('lang', 'pt');
        app()->setLocale($locale);

        $i18n = [];
        $locales = ['pt', 'ja', 'en'];
        foreach ($locales as $l) {
            $path = base_path("lang/{$l}.json");
            if (file_exists($path)) {
                $i18n[$l] = json_decode(file_get_contents($path), true);
            }
        }

        $htmlPath = public_path('checkout-app/checkout.html');
        if (!file_exists($htmlPath)) {
            $customerData = [
                'name' => $resource->customer_name ?? $resource->customer?->name ?? '',
                'email' => $resource->customer_email ?? $resource->customer?->email ?? '',
                'document' => $resource->customer_document ?? $resource->customer?->document ?? '',
            ];

            return view('checkout.index', [
                'transaction' => $resource,
                'asaasData' => $asaasData,
                'pixData' => $pixData,
                'customerData' => $customerData,
                'isSubscription' => $isSubscription,
                'billingType' => $paymentMethod,
                'plano' => $isSubscription ? $resource->plan_name : ($resource->description ?: 'Plano Premium'),
                'ciclo' => $isSubscription ? $resource->billing_cycle : 'único',
                'i18n' => $i18n,
                'currentLocale' => $locale,
                'features' => [
                    'Acesso completo ao sistema',
                    'Suporte prioritário 24/7',
                    'Segurança e criptografia ponta a ponta',
                    'Cancelamento sem burocracia'
                ]
            ]);
        }

        $html = file_get_contents($htmlPath);

        $checkoutData = [
            'uuid' => $resource->uuid,
            'amount' => $asaasData['value'] ?? ($resource->amount ?? 0),
            'description' => $isSubscription ? $resource->plan_name : ($resource->description ?: 'Plano Premium'),
            'customerName' => $resource->customer_name ?? ($resource->customer?->name ?? ''),
            'customerEmail' => $resource->customer_email ?? ($resource->customer?->email ?? ''),
            'csrfToken' => csrf_token(),
            'step' => 1,
        ];

        $injection = "<script>window.CHECKOUT_DATA = " . json_encode($checkoutData) . ";</script>";
        $html = str_replace('<head>', "<head>\n    " . $injection, $html);

        return response($html);
    }

    /**
     * Process a credit card payment.
     */
    public function process(Request $request, string $uuid)
    {
        $resource = Transaction::where('uuid', $uuid)->first()
            ?? Subscription::where('uuid', $uuid)->firstOrFail();

        $request->validate([
            'holder_name' => 'required|string',
            'card_number' => 'required|string',
            'expiry_month' => 'required|string|size:2',
            'expiry_year' => 'required|string|size:4',
            'cvv' => 'required|string|min:3|max:4',
        ]);

        try {
            $isSubscription = $resource instanceof Subscription;
            $gatewayId = $isSubscription ? $resource->gateway_subscription_id : $resource->asaas_payment_id;

            $asaasResponse = $this->asaas->processCardPayment($gatewayId, [
                'card_number' => $request->input('card_number'),
                'card_name' => $request->input('holder_name'),
                'card_expiry' => $request->input('expiry_month') . '/' . $request->input('expiry_year'),
                'card_cvv' => $request->input('cvv'),
                'card_document' => $resource->customer_document ?? $resource->customer?->document ?? '',
                'card_email' => $resource->customer_email ?? $resource->customer?->email ?? '',
                'card_cep' => $resource->customer_zip_code ?? ($resource->customer?->address['postalCode'] ?? '00000000'),
                'card_address_number' => $resource->customer_number ?? ($resource->customer?->address['number'] ?? '1'),
            ], $request->ip());

            if (in_array($asaasResponse['status'], ['CONFIRMED', 'RECEIVED'])) {
                $resource->update([
                    'status' => 'approved',
                    'paid_at' => now(),
                    'gateway_response' => json_encode($asaasResponse),
                ]);

                return response()->json(['status' => 'success', 'redirect' => route('checkout.success', $uuid)]);
            }

            return response()->json(['status' => 'error', 'message' => 'Pagamento recusado.'], 400);

        } catch (\Exception $e) {
            Log::error("Payment processing error: " . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 400);
        }
    }

    /**
     * Show success page.
     */
    public function success(string $uuid)
    {
        $resource = Transaction::where('uuid', $uuid)->first()
            ?? Subscription::where('uuid', $uuid)->firstOrFail();

        return view('checkout.card.front.sucesso', ['transaction' => $resource]);
    }

    public function receipt(string $uuid)
    {
        $resource = Transaction::where('uuid', $uuid)->first()
            ?? Subscription::where('uuid', $uuid)->firstOrFail();

        if ($resource->status !== 'approved') {
            abort(403, 'Comprovante não disponível.');
        }

        $company = $resource->company;
        $settings = $company->settings ?? [];
        $receipt = $settings['receipt'] ?? [
            'header_text' => 'Comprovante de Pagamento',
            'footer_text' => 'Obrigado por sua compra!',
            'show_logo' => true,
            'show_customer_data' => true,
        ];

        return view('checkout.receipt_template', ['transaction' => $resource, 'company' => $company, 'receipt' => $receipt]);
    }

    /**
     * Show a demo/fallback version of the checkout.
     */
    private function showDemo(Request $request, string $uuid)
    {
        $htmlPath = public_path('checkout-app/checkout.html');
        if (!file_exists($htmlPath)) {
            return response("Checkout app not found at public/checkout-app/checkout.html", 404);
        }

        $html = file_get_contents($htmlPath);

        $checkoutData = [
            'uuid' => 'demo',
            'amount' => 5.12,
            'description' => 'Basiléia Church — Plano Anual (Demo)',
            'customerName' => 'Usuário Demonstração',
            'customerEmail' => 'demo@basileia.global',
            'csrfToken' => csrf_token(),
            'step' => 1,
        ];

        $injection = "<script>window.CHECKOUT_DATA = " . json_encode($checkoutData) . ";</script>";
        $html = str_replace('<head>', "<head>\n    " . $injection, $html);

        return response($html);
    }
}
```
### Arquivo: app/Http/Controllers/BasileiaCheckoutController.php
```php
<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use App\Services\AsaasPaymentService;
use App\Services\CheckoutService;
use App\Helpers\PaymentStatusMapper;
use App\Services\WebhookNotifierService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

/**
 * @deprecated Legacy checkout controller.
 * Use CardCheckoutController, PixCheckoutController, or BoletoCheckoutController instead.
 * This controller is kept for backward compatibility only.
 */
class BasileiaCheckoutController extends Controller
{
    public function __construct(
        private AsaasPaymentService $asaasService,
        private WebhookNotifierService $webhookNotifier,
    ) {
    }

    public function show(string $uuid, Request $request)
    {
        $transaction = Transaction::where('uuid', $uuid)->first()
            ?? \App\Models\Subscription::where('uuid', $uuid)->firstOrFail();

        return $this->renderCheckout($transaction->asaas_payment_id ?? $transaction->gateway_subscription_id, $transaction, $request);
    }

    public function handle(string $asaasPaymentId, Request $request)
    {
        $transaction = Transaction::where('asaas_payment_id', $asaasPaymentId)->first();
        return $this->renderCheckout($asaasPaymentId, $transaction, $request);
    }

    private function renderCheckout(string $asaasPaymentId, $transaction, Request $request)
    {
        Log::info('BasileiaCheckout: Renderizando checkout', [
            'asaas_payment_id' => $asaasPaymentId,
            'transaction_uuid' => $transaction?->uuid,
        ]);

        $asaasPayment = $this->asaasService->getPayment($asaasPaymentId);

        if (!$asaasPayment) {
            Log::warning('BasileiaCheckout: Payment not found in gateway, using local fallback', [
                'asaas_payment_id' => $asaasPaymentId,
                'transaction_uuid' => $transaction?->uuid,
            ]);

            // Fallback to local data to avoid crashing the user experience
            $methodMap = ['credit_card' => 'CREDIT_CARD', 'pix' => 'PIX', 'boleto' => 'BOLETO'];
            $billingType = $methodMap[$transaction->payment_method ?? 'credit_card'] ?? 'CREDIT_CARD';

            $asaasPayment = [
                'billingType' => $billingType,
                'installmentCount' => 1,
                'value' => $transaction->amount ?? 0,
                'description' => $transaction->description ?? 'Pagamento Basiléia',
                'status' => 'PENDING',
                'customer' => [
                    'name' => $transaction->customer_name ?? '',
                    'email' => $transaction->customer_email ?? '',
                    'phone' => $transaction->customer_phone ?? '',
                ]
            ];
        }

        $customer = $asaasPayment['customer'] ?? [];
        $billingType = $asaasPayment['billingType'] ?? 'CREDIT_CARD';

        $customerData = [
            'name' => $customer['name'] ?? ($transaction->customer_name ?? ''),
            'email' => $customer['email'] ?? ($transaction->customer_email ?? ''),
            'phone' => $customer['phone'] ?? ($transaction->customer_phone ?? ''),
            'document' => $customer['cpfCnpj'] ?? ($transaction->customer_document ?? ''),
            'address' => [
                'street' => $customer['address'] ?? '',
                'number' => $customer['addressNumber'] ?? '',
                'neighborhood' => $customer['neighborhood'] ?? '',
                'city' => $customer['city'] ?? '',
                'state' => $customer['state'] ?? '',
                'postalCode' => $customer['postalCode'] ?? '',
            ],
        ];

        $plano = $request->get('plano', $asaasPayment['description'] ?? 'Plano');
        $ciclo = $request->get('ciclo', 'mensal');

        if (!$transaction) {
            $companyId = CheckoutService::resolveCompanyId();

            $transaction = Transaction::create([
                'uuid' => Str::uuid(),
                'company_id' => $companyId,
                'asaas_payment_id' => $asaasPaymentId,
                'source' => 'basileia_vendas',
                'product_type' => 'saas',
                'external_id' => '',
                'callback_url' => config('basileia.callback_url', ''),
                'amount' => $asaasPayment['value'] ?? 0,
                'description' => $asaasPayment['description'] ?? 'Pagamento Basileia',
                'payment_method' => PaymentStatusMapper::mapPaymentMethod($billingType),
                'status' => 'pending',
                'customer_name' => $customerData['name'],
                'customer_email' => $customerData['email'],
                'customer_phone' => $customerData['phone'],
                'customer_document' => $customerData['document'],
                'customer_address' => json_encode($customerData['address']),
                'metadata' => [
                    'plano' => $plano,
                    'ciclo' => $ciclo,
                    'venda_id' => '',
                    'hash' => '',
                ],
            ]);
        }

        $locale = $request->get('lang', 'pt');
        app()->setLocale($locale);

        $i18n = [];
        $locales = ['pt', 'ja', 'en', 'es'];
        foreach ($locales as $l) {
            $path = base_path("lang/{$l}.json");
            if (file_exists($path)) {
                $i18n[$l] = json_decode(file_get_contents($path), true);
            }
        }

        $pixData = [];
        if ($billingType === 'PIX') {
            $pixData = $this->asaasService->getPixQrCode($asaasPaymentId) ?? [
                'payload' => 'PENDENTE_SYNC',
                'encodedImage' => '',
            ];
        }

        $htmlPath = public_path('checkout-app/checkout.html');
        if (!file_exists($htmlPath)) {
            return view('checkout.index', [
                'transaction' => $transaction,
                'asaasPayment' => $asaasPayment,
                'customerData' => $customerData,
                'pixData' => $pixData,
                'plano' => $plano,
                'ciclo' => $ciclo,
                'i18n' => $i18n,
                'currentLocale' => $locale,
            ]);
        }

        $html = file_get_contents($htmlPath);

        $checkoutData = [
            'uuid' => $transaction->uuid,
            'amount' => $asaasPayment['value'] ?? 0,
            'description' => $plano,
            'customerName' => $customerData['name'],
            'customerEmail' => $customerData['email'],
            'csrfToken' => csrf_token(),
            'step' => 1,
        ];

        $injection = "<script>window.CHECKOUT_DATA = " . json_encode($checkoutData) . ";</script>";
        $html = str_replace('<head>', "<head>\n    " . $injection, $html);

        return response($html);
    }

    public function process(string $uuid, Request $request)
    {
        $transaction = Transaction::where('uuid', $uuid)->first()
            ?? \App\Models\Subscription::where('uuid', $uuid)->firstOrFail();

        try {
            $paymentMethod = $request->input('paymentMethod', 'credit_card');
            $gateway = \App\Services\Gateway\GatewayFactory::create();

            if ($paymentMethod === 'pix') {
                $request->validate([
                    'customerData.name' => 'required|string|min:3',
                    'customerData.email' => 'required|email',
                    'customerData.document' => 'required|string',
                ]);

                $customerId = $gateway->createCustomer([
                    'name' => $request->input('customerData.name'),
                    'email' => $request->input('customerData.email'),
                    'phone' => '',
                    'document' => $request->input('customerData.document'),
                    'zip' => '',
                ]);

                $result = $gateway->chargeViaPix([
                    'amountBRL' => $request->input('amountBRL', $transaction->amount),
                    'description' => $request->input('description', $transaction->description),
                    'remoteIp' => $request->ip(),
                ], $customerId);

                $transaction->update([
                    'asaas_payment_id' => $result['gatewayId'],
                    'payment_method' => 'pix',
                    'status' => 'pending',
                ]);

                return response()->json([
                    'ok' => true,
                    'status' => 'success',
                    'paymentMethod' => 'pix',
                    'qrCodeBase64' => $result['qrCodeBase64'],
                    'qrCodePayload' => $result['qrCodePayload'],
                    'expiresAt' => $result['expiresAt'],
                    'gatewayId' => $result['gatewayId'],
                ]);

            } else {
                $request->validate([
                    'cardToken' => 'required|string',
                    'cardHolderName' => 'required|string',
                    'cardExpiry' => 'required|string',
                    'cardCvv' => 'required|string',
                ]);

                $customerId = $gateway->createCustomer([
                    'name' => $request->input('customerData.name'),
                    'email' => $request->input('customerData.email'),
                    'phone' => '',
                    'document' => $request->input('customerData.document'),
                    'zip' => '',
                ]);

                $input = [
                    'amountBRL' => $request->input('amountBRL', $transaction->amount),
                    'installments' => $request->input('installments', 1),
                    'description' => $request->input('description', $transaction->description),
                    'cardToken' => $request->input('cardToken'),
                    'cardHolderName' => $request->input('cardHolderName'),
                    'cardExpiry' => $request->input('cardExpiry'),
                    'cardCvv' => $request->input('cardCvv'),
                    'remoteIp' => $request->ip(),
                ];

                $billingCycle = $request->input('billingCycle', 'once');

                if ($billingCycle === 'annual') {
                    $result = $gateway->createSubscription($input, $customerId);
                } else {
                    $result = $gateway->charge($input, $customerId);
                }

                $status = PaymentStatusMapper::mapStatus($result['status'] ?? '');
                $paidAt = PaymentStatusMapper::isPaid($result['status'] ?? '') ? now() : null;

                $sensitiveFields = ['creditCardToken', 'creditCard', 'number', 'ccv', 'expiryMonth', 'expiryYear', 'holderName', 'creditCardHolderInfo'];
                $safeResponse = collect($result['raw'] ?? [])->except($sensitiveFields)->toArray();

                $transaction->update([
                    'asaas_payment_id' => $result['gatewayId'],
                    'payment_method' => 'credit_card',
                    'status' => $status,
                    'paid_at' => $paidAt,
                    'gateway_response' => $safeResponse,
                ]);

                Log::info('BasileiaCheckout: Pagamento processado via GatewayFactory', [
                    'transaction_id' => $transaction->id,
                    'status' => $status,
                ]);

                $this->webhookNotifier->notify($transaction);

                return response()->json([
                    'ok' => true,
                    'status' => 'success',
                    'paymentMethod' => 'credit_card',
                    'gatewayId' => $result['gatewayId'],
                ]);
            }

        } catch (\Exception $e) {
            Log::error('BasileiaCheckout: Payment processing failed', [
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'ok' => false,
                'status' => 'error',
                'error' => 'Erro ao processar pagamento: ' . $e->getMessage(),
            ], 400);
        }
    }

    public function status(string $uuid)
    {
        $transaction = Transaction::where('uuid', $uuid)->first();
        if (!$transaction) {
            return response()->json(['status' => 'not_found'], 404);
        }

        // Ideally we should sync with Asaas here, but for this polling we just check the local status
        // or trigger a quick sync if it's pending.
        if ($transaction->status === 'pending' && $transaction->asaas_payment_id) {
            $asaasPayment = $this->asaasService->getPayment($transaction->asaas_payment_id);
            if ($asaasPayment) {
                $status = PaymentStatusMapper::mapStatus($asaasPayment['status'] ?? 'PENDING');
                if ($status !== 'pending') {
                    $paidAt = PaymentStatusMapper::isPaid($asaasPayment['status'] ?? '') ? now() : null;
                    $transaction->update([
                        'status' => $status,
                        'paid_at' => $paidAt,
                    ]);
                    $this->webhookNotifier->notify($transaction);
                }
            }
        }

        return response()->json(['status' => $transaction->status]);
    }

    public function success(string $uuid)
    {
        $transaction = Transaction::where('uuid', $uuid)->first()
            ?? \App\Models\Subscription::where('uuid', $uuid)->firstOrFail();

        return view('checkout.card.front.sucesso', [
            'transaction' => $transaction,
        ]);
    }
}```
### Arquivo: app/Http/Controllers/Checkout/Card/CardController.php
```php
<?php

declare(strict_types=1);

namespace App\Http\Controllers\Checkout\Card;

use App\Http\Controllers\Checkout\AbstractCheckoutController;
use App\Helpers\PaymentStatusMapper;
use App\Models\Subscription;
use App\Models\Transaction;
use App\Services\CheckoutService;
use App\Services\Payment\CardPaymentService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class CardController extends AbstractCheckoutController
{
    public function __construct(
        \App\Services\AsaasPaymentService $asaasService,
        \App\Services\WebhookNotifierService $webhookNotifier,
        private CardPaymentService $cardService,
    ) {
        parent::__construct($asaasService, $webhookNotifier);
    }

    public function process(string $uuid, Request $request): mixed
    {
        $resource = CheckoutService::findResource($uuid);
        $transaction = $resource instanceof Transaction ? $resource : null;

        if (!$transaction) {
            return response()->json(['error' => 'Transação não encontrada'], 404);
        }

        // [BUG-15] bloqueia empresa A acessando transação de empresa B
        if ($guard = $this->assertOwnership($transaction, $request)) {
            return $guard;
        }

        $request->validate([
            'card_name' => 'required|string|min:3',
            'card_number' => 'required|string',
            'card_expiry' => 'required|string',
            'card_cvv' => 'required|string|min:3|max:4',
            'customer_name' => 'required|string|min:3',
            'email' => 'required|email',
            'customer_document' => 'required|string',
        ]);

        try {
            // Adapta os campos da view para o formato esperado pelo service/gateway
            $paymentData = [
                'amountBRL' => (float) $transaction->amount,
                'installments' => (int) $request->input('installments', 1),
                'description' => $transaction->description,
                'cardToken' => $request->input('card_number'),
                'cardHolderName' => $request->input('card_name'),
                'cardExpiry' => $request->input('card_expiry'),
                'cardCvv' => $request->input('card_cvv'),
                'remoteIp' => $request->ip(),
                'holder_email' => $request->input('email'),
                'card_document' => $request->input('customer_document'),
                'card_phone' => $transaction->customer_phone ?? '',
            ];

            $result = $this->cardService->charge(
                $paymentData,
                [
                    'name' => $request->input('customer_name'),
                    'email' => $request->input('email'),
                    'document' => $request->input('customer_document'),
                ]
            );

            $status = PaymentStatusMapper::mapStatus($result['status'] ?? '');
            $paidAt = PaymentStatusMapper::isPaid($result['status'] ?? '') ? now() : null;

            $transaction->update([
                'asaas_payment_id' => $result['gatewayId'],
                'payment_method' => 'credit_card',
                'status' => $status,
                'paid_at' => $paidAt,
                'gateway_response' => $result['raw'] ?? [],
            ]);

            $this->webhookNotifier->notify($transaction);

            return response()->json([
                'ok' => true,
                'status' => 'success',
                'gatewayId' => $result['gatewayId'],
                'redirectUrl' => route('checkout.card.success', ['uuid' => $uuid]),
            ]);
        } catch (\Throwable $e) {
            Log::error('CardController: erro', ['uuid' => $uuid, 'error' => $e->getMessage()]);
            return response()->json(['ok' => false, 'error' => $e->getMessage()], 400);
        }
    }

    protected function getPaymentMethod(): string
    {
        return 'credit_card';
    }
    protected function getPaymentService(): mixed
    {
        return $this->cardService;
    }
    protected function getViewName(): string
    {
        return 'checkout.card.front.pagamento';
    }
    protected function getSuccessViewName(): string
    {
        return 'checkout.card.front.sucesso';
    }
    protected function getSource(): string
    {
        return Transaction::SOURCE_CHECKOUT;
    }
    protected function getDefaultBillingType(): string
    {
        return 'CREDITCARD';
    }
    protected function needsPixData(): bool
    {
        return false;
    }

    protected function getFallbackView(
        Transaction|Subscription $transaction,
        array $asaasPayment,
        array $customerData,
        ?array $pixData,
        string $plano,
        string $ciclo,
        array $i18n,
        Request $request
    ): mixed {
        return view($this->getViewName(), compact(
            'transaction',
            'asaasPayment',
            'customerData',
            'plano',
            'ciclo'
        ));
    }
}
```
### Arquivo: app/Http/Controllers/Checkout/Boleto/BoletoController.php
```php
<?php

declare(strict_types=1);

namespace App\Http\Controllers\Checkout\Boleto;

use App\Http\Controllers\Checkout\AbstractCheckoutController;
use App\Models\Subscription;
use App\Models\Transaction;
use App\Services\CheckoutService;
use App\Services\Payment\BoletoPaymentService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class BoletoController extends AbstractCheckoutController
{
    public function __construct(
        \App\Services\AsaasPaymentService $asaasService,
        \App\Services\WebhookNotifierService $webhookNotifier,
        private BoletoPaymentService $boletoService,
    ) {
        parent::__construct($asaasService, $webhookNotifier);
    }

    public function process(string $uuid, Request $request): mixed
    {
        $resource = CheckoutService::findResource($uuid);
        $transaction = $resource instanceof Transaction ? $resource : null;

        if (!$transaction) {
            return response()->json(['error' => 'Transação não encontrada'], 404);
        }

        // [BUG-15] bloqueia empresa A acessando transação de empresa B
        if ($guard = $this->assertOwnership($transaction, $request)) {
            return $guard;
        }

        try {
            $result = $this->boletoService->charge(
                [
                    'amountBRL' => $request->input('amountBRL', $transaction->amount),
                    'description' => $request->input('description', $transaction->description),
                    'remoteIp' => $request->ip(),
                ],
                [
                    'name' => $request->input('customerData.name'),
                    'email' => $request->input('customerData.email'),
                    'document' => $request->input('customerData.document'),
                ]
            );

            $transaction->update([
                'asaas_payment_id' => $result['gatewayId'],
                'payment_method' => 'boleto',
                'status' => 'pending',
            ]);

            return response()->json([
                'ok' => true,
                'status' => 'success',
                'bankSlipUrl' => $result['bankSlipUrl'],
                'barcode' => $result['barcode'] ?? '',
                'gatewayId' => $result['gatewayId'],
            ]);
        } catch (\Throwable $e) {
            Log::error('BoletoController: erro', ['uuid' => $uuid, 'error' => $e->getMessage()]);
            return response()->json(['ok' => false, 'error' => $e->getMessage()], 400);
        }
    }

    protected function getPaymentMethod(): string
    {
        return 'boleto';
    }
    protected function getPaymentService(): mixed
    {
        return $this->boletoService;
    }
    protected function getViewName(): string
    {
        return 'checkout.boleto.front.pagamento';
    }
    protected function getSuccessViewName(): string
    {
        return 'checkout.boleto.front.sucesso';
    }
    protected function getSource(): string
    {
        return Transaction::SOURCE_CHECKOUT;
    }
    protected function getDefaultBillingType(): string
    {
        return 'BOLETO';
    }
    protected function needsPixData(): bool
    {
        return false;
    }

    protected function getFallbackView(
        Transaction|Subscription $transaction,
        array $asaasPayment,
        array $customerData,
        ?array $pixData,
        string $plano,
        string $ciclo,
        array $i18n,
        Request $request
    ): mixed {
        return view($this->getViewName(), compact(
            'transaction',
            'asaasPayment',
            'customerData',
            'plano',
            'ciclo'
        ));
    }
}
```
### Arquivo: app/Http/Controllers/Checkout/Pix/PixController.php
```php
<?php

declare(strict_types=1);

namespace App\Http\Controllers\Checkout\Pix;

use App\Http\Controllers\Checkout\AbstractCheckoutController;
use App\Models\Subscription;
use App\Models\Transaction;
use App\Services\CheckoutService;
use App\Services\Payment\PixPaymentService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class PixController extends AbstractCheckoutController
{
    public function __construct(
        \App\Services\AsaasPaymentService $asaasService,
        \App\Services\WebhookNotifierService $webhookNotifier,
        private PixPaymentService $pixService,
    ) {
        parent::__construct($asaasService, $webhookNotifier);
    }

    public function process(string $uuid, Request $request): mixed
    {
        $resource = CheckoutService::findResource($uuid);
        $transaction = $resource instanceof Transaction ? $resource : null;

        if (!$transaction) {
            return response()->json(['error' => 'Transação não encontrada'], 404);
        }

        // [BUG-15] bloqueia empresa A acessando transação de empresa B
        if ($guard = $this->assertOwnership($transaction, $request)) {
            return $guard;
        }

        $request->validate([
            'customerData.name' => 'required|string|min:3',
            'customerData.email' => 'required|email',
            'customerData.document' => 'required|string',
        ]);

        try {
            $result = $this->pixService->charge(
                [
                    'amountBRL' => $request->input('amountBRL', $transaction->amount),
                    'description' => $request->input('description', $transaction->description),
                    'remoteIp' => $request->ip(),
                ],
                [
                    'name' => $request->input('customerData.name'),
                    'email' => $request->input('customerData.email'),
                    'document' => $request->input('customerData.document'),
                ]
            );

            $transaction->update([
                'asaas_payment_id' => $result['gatewayId'],
                'payment_method' => 'pix',
                'status' => 'pending',
            ]);

            return response()->json([
                'ok' => true,
                'status' => 'success',
                'paymentMethod' => 'pix',
                'qrCodeBase64' => $result['qrCodeBase64'],
                'qrCodePayload' => $result['qrCodePayload'],
                'expiresAt' => $result['expiresAt'],
                'gatewayId' => $result['gatewayId'],
            ]);
        } catch (\Throwable $e) {
            Log::error('PixController: erro', ['uuid' => $uuid, 'error' => $e->getMessage()]);
            return response()->json(['ok' => false, 'error' => $e->getMessage()], 400);
        }
    }

    protected function getPaymentMethod(): string
    {
        return 'pix';
    }
    protected function getPaymentService(): mixed
    {
        return $this->pixService;
    }
    protected function getViewName(): string
    {
        return 'checkout.pix.front.pagamento';
    }
    protected function getSuccessViewName(): string
    {
        return 'checkout.pix.front.sucesso';
    }
    protected function getSource(): string
    {
        return Transaction::SOURCE_CHECKOUT;
    }
    protected function getDefaultBillingType(): string
    {
        return 'PIX';
    }
    protected function needsPixData(): bool
    {
        return true;
    }

    protected function getFallbackView(
        Transaction|Subscription $transaction,
        array $asaasPayment,
        array $customerData,
        ?array $pixData,
        string $plano,
        string $ciclo,
        array $i18n,
        Request $request
    ): mixed {
        return view($this->getViewName(), compact(
            'transaction',
            'asaasPayment',
            'customerData',
            'pixData',
            'plano',
            'ciclo'
        ));
    }
}
```
### Arquivo: app/Http/Controllers/Checkout/AbstractCheckoutController.php
```php
<?php

declare(strict_types=1);

namespace App\Http\Controllers\Checkout;

use App\Http\Controllers\Controller;
use App\Models\Subscription;
use App\Models\Transaction;
use App\Services\AsaasPaymentService;
use App\Services\CheckoutService;
use App\Services\WebhookNotifierService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

/**
 * Base de todos os controllers de pagamento.
 *
 * [DUP-06] show() estava copiado em 6 controllers:
 *          CheckoutController, BasileiaCheckoutController,
 *          AsaasCheckoutController, CardController,
 *          PixController, BoletoController
 *          → agora existe SOMENTE aqui
 *
 * [BUG-15] Ownership check ausente: empresa A acessava transação B
 *          → assertOwnership() centralizado aqui, chamado por todos os filhos
 */
abstract class AbstractCheckoutController extends Controller
{
    public function __construct(
        protected AsaasPaymentService $asaasService,
        protected WebhookNotifierService $webhookNotifier,
    ) {
    }

    // ─────────────────────────────────────────────────────────────
    // show() — [DUP-06]
    // ─────────────────────────────────────────────────────────────

    public function show(string $uuid, Request $request): mixed
    {
        $resource = CheckoutService::findResource($uuid);
        $asaasPaymentId = $resource->asaas_payment_id ?? $resource->gateway_subscription_id;

        $asaasPayment = CheckoutService::getAsaasPaymentWithFallback(
            $this->asaasService,
            $resource,
            $asaasPaymentId,
            $this->getDefaultBillingType(),
        );

        $customerData = CheckoutService::buildCustomerData($asaasPayment, $resource);

        $transaction = CheckoutService::createTransactionIfNotExists(
            $asaasPayment,
            $resource,
            $asaasPaymentId,
            $this->getSource(),
            $request,
        );

        $i18n = CheckoutService::loadI18n($request);
        $plano = $request->get('plano', $asaasPayment['description'] ?? 'Plano');
        $ciclo = $request->get('ciclo', 'mensal');
        $pixData = $this->needsPixData()
            ? CheckoutService::getPixDataIfNeeded($this->asaasService, $asaasPaymentId)
            : null;

        // Tenta renderizar o SPA
        $spaHtml = CheckoutService::renderSpa(
            CheckoutService::buildCheckoutData($transaction, $asaasPayment, $transaction->uuid, $request)
        );

        if ($spaHtml !== null) {
            return response($spaHtml);
        }

        // Fallback Blade
        return $this->getFallbackView(
            $transaction,
            $asaasPayment,
            $customerData,
            $pixData,
            $plano,
            $ciclo,
            $i18n,
            $request
        );
    }

    // ─────────────────────────────────────────────────────────────
    // Status polling
    // ─────────────────────────────────────────────────────────────

    public function status(string $uuid): JsonResponse
    {
        $resource = CheckoutService::findResource($uuid);
        $transaction = $resource instanceof Transaction ? $resource : null;

        if (!$transaction) {
            return response()->json(['status' => 'not_found'], 404);
        }

        CheckoutService::checkAndUpdateStatus(
            $transaction,
            $this->asaasService,
            fn($t) => $this->webhookNotifier->notify($t),
        );

        return response()->json(['status' => $transaction->refresh()->status]);
    }

    // ─────────────────────────────────────────────────────────────
    // Sucesso
    // ─────────────────────────────────────────────────────────────

    public function success(string $uuid): mixed
    {
        $resource = CheckoutService::findResource($uuid);
        return view($this->getSuccessViewName(), ['transaction' => $resource]);
    }

    // ─────────────────────────────────────────────────────────────
    // Ownership check — [BUG-15]
    // ─────────────────────────────────────────────────────────────

    /**
     * [BUG-15] Garante que a transação pertence à empresa do usuário atual.
     *
     * USE no início do process() de cada controller filho:
     *
     *   if ($guard = $this->assertOwnership($transaction, $request)) {
     *       return $guard; // 403
     *   }
     *
     * Retorna null se OK. Retorna JsonResponse 403 se não autorizado.
     */
    protected function assertOwnership(Transaction $transaction, Request $request): ?JsonResponse
    {
        // API autenticada
        $integration = $request->attributes->get('integration');
        if ($integration) {
            if ((int) $transaction->company_id !== (int) $integration->company_id) {
                Log::warning(static::class . ': acesso cross-company via API', [
                    'transaction_uuid' => $transaction->uuid,
                    'transaction_company' => $transaction->company_id,
                    'integration_company' => $integration->company_id,
                    'ip' => $request->ip(),
                ]);
                return response()->json(['error' => 'Forbidden'], 403);
            }
            return null;
        }

        // Dashboard
        $user = auth()->user();
        if ($user && $user->company_id && (int) $transaction->company_id !== (int) $user->company_id) {
            Log::warning(static::class . ': acesso cross-company via dashboard', [
                'transaction_uuid' => $transaction->uuid,
                'transaction_company' => $transaction->company_id,
                'user_company' => $user->company_id,
                'user_id' => $user->id,
                'ip' => $request->ip(),
            ]);
            return response()->json(['error' => 'Acesso negado'], 403);
        }

        return null; // OK
    }

    // ─────────────────────────────────────────────────────────────
    // Abstratos — implemente no controller filho
    // ─────────────────────────────────────────────────────────────

    abstract public function process(string $uuid, Request $request): mixed;
    abstract protected function getPaymentMethod(): string;
    abstract protected function getPaymentService(): mixed;
    abstract protected function getViewName(): string;
    abstract protected function getSuccessViewName(): string;
    abstract protected function getSource(): string;
    abstract protected function getDefaultBillingType(): string;
    abstract protected function needsPixData(): bool;

    abstract protected function getFallbackView(
        Transaction|Subscription $transaction,
        array $asaasPayment,
        array $customerData,
        ?array $pixData,
        string $plano,
        string $ciclo,
        array $i18n,
        Request $request,
    ): mixed;
}
```
### Arquivo: app/Http/Controllers/Checkout/EventCheckoutController.php
```php
<?php

namespace App\Http\Controllers\Checkout;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Services\CustomerService;
use App\Services\PaymentService;
use Illuminate\Http\Request;

class EventCheckoutController extends Controller
{
    public function show(string $slug)
    {
        $event = Event::where('slug', $slug)->firstOrFail();

        if (!$event->isDisponivel()) {
            return view('checkout.evento.esgotado', ['event' => $event]);
        }

        return view('checkout.evento.index', ['event' => $event]);
    }

    public function process(Request $request, string $slug, CustomerService $customerService, PaymentService $paymentService)
    {
        $event = Event::where('slug', $slug)->firstOrFail();

        if (!$event->isDisponivel()) {
            return back()->withErrors(['error' => 'Este evento não está mais disponível.'])->withInput();
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email',
            'document' => 'required|string|max:20',
            'phone' => 'nullable|string|max:20',
            'billing_type' => 'required|in:PIX,BOLETO,CREDIT_CARD',
        ]);

        $company = $event->company;
        $gateway = \App\Models\Gateway::where('company_id', $company->id)
            ->where('type', config('services.default_gateway', 'asaas'))
            ->firstOrFail();

        $customer = $customerService->findOrCreate([
            'company_id' => $company->id,
            'name' => $request->name,
            'email' => $request->email,
            'document' => preg_replace('/\D/', '', $request->document),
            'phone' => $request->phone,
        ]);

        $transaction = \App\Models\Transaction::create([
            'company_id' => $company->id,
            'gateway_id' => $gateway->id,
            'customer_id' => $customer->id,
            'description' => "Evento: {$event->titulo}",
            'amount' => $event->valor,
            'net_amount' => $event->valor,
            'currency' => 'BRL',
            'payment_method' => strtolower($request->billing_type),
            'status' => 'pending',
            'customer_name' => $request->name,
            'customer_email' => $request->email,
            'customer_document' => preg_replace('/\D/', '', $request->document),
        ]);

        $payment = $paymentService->processPayment($transaction, [
            'payment_method' => strtolower($request->billing_type),
            'billing_type' => $request->billing_type,
        ]);

        $event->incrementarVaga();

        if ($request->billing_type === 'PIX' && isset($payment['pixQrCode'])) {
            return view('checkout.evento.pagamento', [
                'event' => $event,
                'payment' => $payment,
                'transaction' => $transaction,
                'billing_type' => $request->billing_type,
            ]);
        }

        if ($request->billing_type === 'BOLETO' && isset($payment['bankSlipUrl'])) {
            return view('checkout.evento.pagamento', [
                'event' => $event,
                'payment' => $payment,
                'transaction' => $transaction,
                'billing_type' => $request->billing_type,
            ]);
        }

        if (isset($payment['invoiceUrl'])) {
            return redirect($payment['invoiceUrl']);
        }

        return redirect("/pay/{$transaction->uuid}/success");
    }

    public function success(string $slug)
    {
        $event = Event::where('slug', $slug)->firstOrFail();
        return view('checkout.card.front.sucesso', ['event' => $event]);
    }
}
```
### Arquivo: app/Http/Controllers/AsaasCheckoutController.php
```php
<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use App\Services\AsaasPaymentService;
use App\Services\CheckoutService;
use App\Helpers\PaymentStatusMapper;
use App\Services\WebhookNotifierService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

/**
 * @deprecated Legacy Asaas-specific checkout controller.
 * Use CardCheckoutController, PixCheckoutController, or BoletoCheckoutController instead.
 * This controller is kept for backward compatibility only.
 */
class AsaasCheckoutController extends Controller
{
    public function __construct(
        private AsaasPaymentService $asaasService,
        private WebhookNotifierService $webhookNotifier,
    ) {
    }

    public function show(string $asaasPaymentId, Request $request)
    {
        $asaasPayment = $this->asaasService->getPayment($asaasPaymentId);

        if (!$asaasPayment) {
            Log::warning('AsaasCheckout: Payment not found', [
                'asaas_payment_id' => $asaasPaymentId,
            ]);
            abort(404, 'Pagamento não encontrado');
        }

        $transaction = Transaction::where('asaas_payment_id', $asaasPaymentId)->first();

        $customerData = [
            'name' => $asaasPayment['customer']['name'] ?? '',
            'email' => $asaasPayment['customer']['email'] ?? '',
            'phone' => $asaasPayment['customer']['phone'] ?? '',
            'document' => $asaasPayment['customer']['cpfCnpj'] ?? '',
            'address' => [
                'cep' => $asaasPayment['customer']['postalCode'] ?? '',
                'endereco' => $asaasPayment['customer']['address'] ?? '',
                'numero' => $asaasPayment['customer']['addressNumber'] ?? '',
                'complemento' => $asaasPayment['customer']['complement'] ?? '',
                'bairro' => $asaasPayment['customer']['province'] ?? '',
                'cidade' => $asaasPayment['customer']['city'] ?? '',
                'estado' => $asaasPayment['customer']['state'] ?? '',
            ],
        ];

        if (!$transaction) {
            $companyId = CheckoutService::resolveCompanyId();

            $transaction = Transaction::create([
                'uuid' => Str::uuid(),
                'company_id' => $companyId,
                'asaas_payment_id' => $asaasPaymentId,
                'source' => 'basileia_vendas',
                'external_id' => '',
                'callback_url' => config('basileia.callback_url', ''),
                'amount' => $asaasPayment['value'] ?? 0,
                'description' => $asaasPayment['description'] ?? 'Pagamento',
                'payment_method' => PaymentStatusMapper::mapPaymentMethod($asaasPayment['billingType'] ?? ''),
                'status' => 'pending',
                'customer_name' => $customerData['name'],
                'customer_email' => $customerData['email'],
                'customer_phone' => $customerData['phone'],
                'customer_document' => $customerData['document'],
                'customer_address' => json_encode($customerData['address']),
            ]);
        }

        return view('checkout.asaas', [
            'transaction' => $transaction,
            'asaasPayment' => $asaasPayment,
            'customerData' => $customerData,
        ]);
    }

    public function process(string $asaasPaymentId, Request $request)
    {
        $transaction = Transaction::where('asaas_payment_id', $asaasPaymentId)->firstOrFail();

        $request->validate([
            'card_number' => 'required|string|min:13|max:19',
            'card_name' => 'required|string|min:3',
            'card_expiry' => 'required|string',
            'card_cvv' => 'required|string|min:3|max:4',
        ]);

        try {
            $asaasResponse = $this->asaasService->processCardPayment($asaasPaymentId, [
                'card_number' => $request->input('card_number'),
                'card_name' => $request->input('card_name'),
                'card_expiry' => $request->input('card_expiry'),
                'card_cvv' => $request->input('card_cvv'),
                'card_document' => $transaction->customer_document,
                'card_email' => $transaction->customer_email,
                'card_phone' => $transaction->customer_phone,
                'card_address' => $request->input('card_address', ''),
                'card_address_number' => $request->input('card_address_number', ''),
                'card_neighborhood' => $request->input('card_neighborhood', ''),
                'card_city' => $request->input('card_city', ''),
                'card_state' => $request->input('card_state', ''),
                'card_cep' => $request->input('card_cep', ''),
            ]);

            $status = PaymentStatusMapper::mapStatus($asaasResponse['status'] ?? '');

            $safeResponse = collect($asaasResponse ?? [])->except(['creditCardToken', 'creditCard', 'number', 'ccv', 'expiryMonth', 'expiryYear', 'holderName', 'creditCardHolderInfo'])->toArray();

            $transaction->update([
                'status' => $status,
                'gateway_response' => $safeResponse,
                'paid_at' => PaymentStatusMapper::isPaid($asaasResponse['status'] ?? '') ? now() : null,
            ]);

            $this->webhookNotifier->notify($transaction);

            return redirect()->route('checkout.asaas.success', $transaction->uuid);

        } catch (\Exception $e) {
            Log::error('AsaasCheckout: Payment processing failed', [
                'asaas_payment_id' => $asaasPaymentId,
                'error' => $e->getMessage(),
            ]);

            return back()->withErrors([
                'payment' => 'Erro ao processar pagamento: ' . $e->getMessage(),
            ])->withInput();
        }
    }

    public function success(string $uuid)
    {
        $transaction = Transaction::where('uuid', $uuid)->firstOrFail();

        return view('checkout.card.front.sucesso', [
            'transaction' => $transaction,
        ]);
    }
}```
### Arquivo: app/Http/Controllers/Dashboard/EventController.php
```php
<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Services\Gateway\GatewayFactory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class EventController extends Controller
{
    public function index()
    {
        $events = Event::where('company_id', Auth::user()->company_id)
            ->orderByDesc('created_at')
            ->paginate(15);

        return view('dashboard.events.index', compact('events'));
    }

    public function store(Request $request)
    {
        $request->validate([
            'titulo' => 'required|string|max:255',
            'descricao' => 'nullable|string|max:1000',
            'valor' => 'required|numeric|min:0.01',
            'vagas_total' => 'required|integer|min:1|max:10000',
            'whatsapp_vendedor' => 'required|string|max:20',
            'metodo_pagamento' => 'required|in:pix,boleto,credit_card,all',
            'data_inicio' => 'nullable|date',
            'data_fim' => 'nullable|date|after_or_equal:data_inicio',
        ]);

        $event = Event::create([
            'company_id' => Auth::user()->company_id,
            'titulo' => $request->titulo,
            'descricao' => $request->descricao,
            'valor' => $request->valor,
            'moeda' => 'BRL',
            'vagas_total' => $request->vagas_total,
            'whatsapp_vendedor' => preg_replace('/\D/', '', $request->whatsapp_vendedor),
            'metodo_pagamento' => $request->metodo_pagamento,
            'data_inicio' => $request->data_inicio,
            'data_fim' => $request->data_fim,
            'status' => 'ativo',
        ]);

        $link = url("/evento/{$event->slug}");

        return redirect()->route('dashboard.events.index')
            ->with('success', "Evento criado! Link: {$link}");
    }

    public function toggle(Event $event)
    {
        $this->authorizeCompany($event);

        if ($event->status === 'ativo') {
            $event->update(['status' => 'expirado']);
        } elseif ($event->status === 'expirado' && $event->vagasRestantes() > 0) {
            $event->update(['status' => 'ativo']);
        }

        return redirect()->route('dashboard.events.index')->with('success', 'Status atualizado.');
    }

    public function destroy(Event $event)
    {
        $this->authorizeCompany($event);
        $event->delete();

        return redirect()->route('dashboard.events.index')->with('success', 'Evento removido.');
    }

    private function authorizeCompany(Event $event): void
    {
        if ($event->company_id !== Auth::user()->company_id) {
            abort(403);
        }
    }
}
```
### Arquivo: app/Http/Controllers/Dashboard/CompanyController.php
```php
<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\Company;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class CompanyController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();

        if ($user->role !== 'super_admin') {
            abort(403, 'Acesso não autorizado.');
        }

        $request->validate([
            'search' => 'sometimes|string|max:255',
        ]);

        $query = Company::withCount('users', 'integrations');

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('document', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $companies = $query->orderBy('created_at', 'desc')->paginate(20);

        return view('dashboard.companies.index', compact('companies'));
    }

    public function store(Request $request)
    {
        $user = Auth::user();

        if ($user->role !== 'super_admin') {
            abort(403, 'Acesso não autorizado.');
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'document' => 'required|string|max:20|unique:companies,document',
            'email' => 'required|email|unique:companies,email',
            'phone' => 'sometimes|string|max:20',
            'owner_name' => 'required|string|max:255',
            'owner_email' => 'required|email|unique:users,email',
            'owner_password' => 'required|string|min:8',
        ]);

        $company = Company::create([
            'name' => $request->input('name'),
            'document' => $request->input('document'),
            'email' => $request->input('email'),
            'phone' => $request->input('phone'),
            'is_active' => true,
        ]);

        User::create([
            'company_id' => $company->id,
            'name' => $request->input('owner_name'),
            'email' => $request->input('owner_email'),
            'password' => Hash::make($request->input('owner_password')),
            'role' => 'admin',
        ]);

        return redirect()->route('dashboard.companies.show', $company->id)
            ->with('success', 'Empresa criada com sucesso.');
    }

    public function show(int $id)
    {
        $user = Auth::user();

        if ($user->role !== 'super_admin') {
            abort(403, 'Acesso não autorizado.');
        }

        $company = Company::with(['users', 'integrations'])->find($id);

        if (!$company) {
            abort(404, 'Empresa não encontrada.');
        }

        return view('dashboard.companies.show', compact('company'));
    }

    public function update(Request $request, int $id)
    {
        $user = Auth::user();

        if ($user->role !== 'super_admin') {
            abort(403, 'Acesso não autorizado.');
        }

        $request->validate([
            'name' => 'sometimes|string|max:255',
            'document' => ['sometimes', 'string', 'max:20', Rule::unique('companies', 'document')->ignore($id)],
            'email' => ['sometimes', 'email', Rule::unique('companies', 'email')->ignore($id)],
            'phone' => 'sometimes|string|max:20',
            'is_active' => 'sometimes|boolean',
        ]);

        $company = Company::find($id);

        if (!$company) {
            abort(404, 'Empresa não encontrada.');
        }

        $company->update($request->only(['name', 'document', 'email', 'phone', 'is_active']));

        return redirect()->route('dashboard.companies.show', $company->id)
            ->with('success', 'Empresa atualizada com sucesso.');
    }

    public function destroy(int $id)
    {
        $user = Auth::user();

        if ($user->role !== 'super_admin') {
            abort(403, 'Acesso não autorizado.');
        }

        $company = Company::find($id);

        if (!$company) {
            abort(404, 'Empresa não encontrada.');
        }

        $company->update(['is_active' => false]);

        return redirect()->route('dashboard.companies.index')
            ->with('success', 'Empresa desativada com sucesso.');
    }

    public function toggle(int $id)
    {
        $user = Auth::user();

        if ($user->role !== 'super_admin') {
            abort(403, 'Acesso não autorizado.');
        }

        $company = Company::find($id);

        if (!$company) {
            abort(404, 'Empresa não encontrada.');
        }

        $company->update(['status' => $company->status === 'active' ? 'inactive' : 'active']);

        return redirect()->route('dashboard.companies.index')
            ->with('success', 'Status da empresa atualizado.');
    }
}
```
### Arquivo: app/Http/Controllers/Dashboard/WebhookLogController.php
```php
<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\WebhookDelivery;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class WebhookLogController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        $companyId = $user->company_id;

        $request->validate([
            'status' => 'sometimes|in:pending,delivered,failed',
            'event_type' => 'sometimes|string',
        ]);

        $query = WebhookDelivery::whereHas('endpoint.integration', function ($q) use ($companyId) {
                $q->where('company_id', $companyId);
            })
            ->with(['endpoint.integration']);

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->filled('event_type')) {
            $query->where('event_type', $request->input('event_type'));
        }

        $deliveries = $query->orderBy('created_at', 'desc')->paginate(20);

        $filters = $request->only(['status', 'event_type']);

        return view('dashboard.webhooks.index', compact('deliveries', 'filters'));
    }

    public function show(int $id)
    {
        $user = Auth::user();
        $companyId = $user->company_id;

        $delivery = WebhookDelivery::whereHas('endpoint.integration', function ($q) use ($companyId) {
                $q->where('company_id', $companyId);
            })
            ->with(['endpoint.integration'])
            ->find($id);

        if (!$delivery) {
            abort(404, 'Webhook delivery não encontrada.');
        }

        return view('dashboard.webhooks.show', compact('delivery'));
    }

    public function retry(int $id)
    {
        $user = Auth::user();
        $companyId = $user->company_id;

        $delivery = WebhookDelivery::whereHas('endpoint.integration', function ($q) use ($companyId) {
                $q->where('company_id', $companyId);
            })
            ->find($id);

        if (!$delivery) {
            abort(404, 'Webhook delivery não encontrada.');
        }

        $delivery->update([
            'status' => 'pending',
            'attempts' => $delivery->attempts + 1,
            'next_retry_at' => now(),
        ]);

        return redirect()->route('dashboard.webhooks.show', $delivery->id)
            ->with('success', 'Webhook agendado para reenvio.');
    }
}
```
### Arquivo: app/Http/Controllers/Dashboard/DashboardController.php
```php
<?php

declare(strict_types=1);

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\Integration;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

/**
 * [BUG-04] Company::first() para superadmin → redirecionamento explícito
 * [QA-01]  7 queries Transaction separadas → 1 selectRaw (70% menos banco)
 */
class DashboardController extends Controller
{
    public function index(Request $request): mixed
    {
        $user = Auth::user();
        $companyId = $user->company_id;

        // [BUG-04] Superadmin sem empresa → seleciona explicitamente
        // ANTES: Company::first() → pegava empresa aleatória
        // AGORA: redireciona para selecionar
        if (!$companyId) {
            return redirect()->route('dashboard.companies.index')
                ->with('warning', 'Selecione uma empresa para visualizar o painel.');
        }

        $monthStart = now()->startOfMonth();
        $lastMonthStart = now()->subMonth()->startOfMonth();
        $lastMonthEnd = now()->subMonth()->endOfMonth();
        $today = now()->startOfDay();

        // [QA-01] Uma query só — antes eram 7 queries separadas
        $stats = DB::table('transactions')
            ->where('company_id', $companyId)
            ->selectRaw("
                COUNT(*) FILTER (WHERE created_at >= ?)                              AS total_month,
                COALESCE(SUM(amount) FILTER (WHERE created_at >= ?), 0)              AS volume_month,
                COALESCE(SUM(amount) FILTER (WHERE created_at BETWEEN ? AND ?), 0)  AS volume_last_month,
                COUNT(*) FILTER (WHERE status = 'approved' AND created_at >= ?)     AS approved_month,
                COUNT(*) FILTER (WHERE created_at >= ?)                              AS today_count,
                COALESCE(SUM(amount) FILTER (WHERE created_at >= ?), 0)              AS today_volume,
                COUNT(*) FILTER (WHERE status = 'pending')                           AS pending_count
            ", [
                $monthStart,                    // total_month
                $monthStart,                    // volume_month
                $lastMonthStart,
                $lastMonthEnd, // volume_last_month
                $monthStart,                    // approved_month
                $today,                         // today_count
                $today,                         // today_volume
            ])
            ->first();

        $volumeMonth = (float) ($stats->volume_month ?? 0);
        $volumeLastMonth = (float) ($stats->volume_last_month ?? 0);
        $totalMonth = (int) ($stats->total_month ?? 0);
        $approvedMonth = (int) ($stats->approved_month ?? 0);

        $volumeTrend = $volumeLastMonth > 0
            ? round(($volumeMonth - $volumeLastMonth) / $volumeLastMonth * 100, 1)
            : 0;

        $approvalRate = $totalMonth > 0
            ? round($approvedMonth / $totalMonth * 100, 1)
            : 0;

        $activeIntegrations = Integration::where('company_id', $companyId)
            ->where('status', 'active')->count();

        $totalIntegrations = Integration::where('company_id', $companyId)->count();

        $recentTransactions = Transaction::where('company_id', $companyId)
            ->with('integration')
            ->orderByDesc('created_at')
            ->limit(5)
            ->get();

        return view('dashboard.index', [
            'volumeMonth' => $volumeMonth,
            'volumeLastMonth' => $volumeLastMonth,
            'volumeTrend' => $volumeTrend,
            'totalMonth' => $totalMonth,
            'approvedMonth' => $approvedMonth,
            'approvalRate' => $approvalRate,
            'todayCount' => (int) ($stats->today_count ?? 0),
            'todayVolume' => (float) ($stats->today_volume ?? 0),
            'pendingCount' => (int) ($stats->pending_count ?? 0),
            'activeIntegrations' => $activeIntegrations,
            'totalIntegrations' => $totalIntegrations,
            'recentTransactions' => $recentTransactions,
        ]);
    }
}
```
### Arquivo: app/Http/Controllers/Dashboard/AuthController.php
```php
<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\LoginAttempt;
use App\Models\User;
use App\Services\TwoFactorAuthService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    private const MAX_FAILED_ATTEMPTS = 5;
    private const LOCKOUT_MINUTES = 30;

    public function __construct(
        private TwoFactorAuthService $twoFactorService
    ) {}

    public function showLogin()
    {
        return view('auth.login');
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $email = $request->input('email');
        $password = $request->input('password');

        $user = User::where('email', $email)->first();

        if ($user) {
            if ($user->locked_until && now()->lessThan($user->locked_until)) {
                $minutes = now()->diffInMinutes($user->locked_until);
                
                $this->registrarTentativa($user, $request, false, 'Conta bloqueada');
                
                return back()->withErrors([
                    'email' => "Conta temporariamente bloqueada. Tente novamente em {$minutes} minutos.",
                ])->withInput();
            }

            if (!Hash::check($password, $user->password)) {
                $user->increment('failed_login_attempts');
                
                $totalTentativas = $user->failed_login_attempts;
                
                if ($totalTentativas >= self::MAX_FAILED_ATTEMPTS) {
                    $user->update([
                        'locked_until' => now()->addMinutes(self::LOCKOUT_MINUTES),
                        'failed_login_attempts' => 0,
                    ]);
                    
                    Log::warning('Login: Conta bloqueada por múltiplas tentativas', [
                        'user_id' => $user->id,
                        'ip' => $request->ip(),
                    ]);
                    
                    $this->registrarTentativa($user, $request, false, 'Bloqueado por tentativas');
                    
                    return back()->withErrors([
                        'email' => "Conta bloqueada após {$totalTentativas} tentativas falhas. Tente novamente em " . self::LOCKOUT_MINUTES . " minutos.",
                    ])->withInput();
                }
                
                $this->registrarTentativa($user, $request, false, 'Senha incorreta');
                
                return back()->withErrors([
                    'email' => "Credenciais inválidas. Você tem " . (self::MAX_FAILED_ATTEMPTS - $totalTentativas) . " tentativas restantes.",
                ])->withInput();
            }

            if ($user->status !== 'active') {
                $this->registrarTentativa($user, $request, false, 'Conta inativa');
                
                return back()->withErrors([
                    'email' => 'Esta conta está inativa. Entre em contato com o administrador.',
                ])->withInput();
            }

            Auth::login($user, $request->boolean('remember'));
            
            $user->update([
                'failed_login_attempts' => 0,
                'locked_until' => null,
            ]);
            
            $this->registrarTentativa($user, $request, true);
            
            Log::info('Login: Usuário logado com sucesso', [
                'user_id' => $user->id,
                'ip' => $request->ip(),
            ]);
            
            $request->session()->regenerate();

            if ($user->must_change_password) {
                return redirect()->route('password.change')
                    ->with('warning', 'Você deve alterar sua senha no primeiro acesso.');
            }

            if ($user->two_factor_enabled) {
                $request->session()->put('2fa_required', true);
                return redirect()->route('profile.2fa.verify');
            }

            return redirect()->intended(route('dashboard.index'));
        }

        $this->registrarTentativa(null, $request, false, 'Usuário não encontrado', $email);

        return back()->withErrors([
            'email' => 'Credenciais inválidas.',
        ])->withInput();
    }

    public function logout(Request $request)
    {
        Log::info('Logout: Usuário deslogado', [
            'user_id' => Auth::id(),
            'ip' => $request->ip(),
        ]);

        Auth::logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('login');
    }

    private function registrarTentativa(?User $user, Request $request, bool $success, ?string $motivo = null, ?string $email = null): void
    {
        try {
            LoginAttempt::create([
                'user_id' => $user?->id,
                'email' => $email ?? $request->input('email'),
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'success' => $success,
                'failure_reason' => $motivo,
                'created_at' => now(),
            ]);
        } catch (\Exception $e) {
            Log::error('LoginAttempt: Erro ao registrar tentativa', [
                'error' => $e->getMessage(),
            ]);
        }
    }
}```
### Arquivo: app/Http/Controllers/Dashboard/ReportController.php
```php
<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Response;
use Illuminate\Support\Str;

class ReportController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        $companyId = $user->company_id;

        $summary = $this->buildSummary($companyId);

        return view('dashboard.reports.index', compact('summary'));
    }

    public function summary(Request $request)
    {
        $user = Auth::user();
        $companyId = $user->company_id;

        $request->validate([
            'date_from' => 'required|date',
            'date_to' => 'required|date|after_or_equal:date_from',
        ]);

        $summary = $this->buildSummary(
            $companyId,
            $request->input('date_from'),
            $request->input('date_to')
        );

        return view('dashboard.reports.summary', compact('summary'));
    }

    public function export(Request $request)
    {
        $user = Auth::user();
        $companyId = $user->company_id;

        $request->validate([
            'date_from' => 'sometimes|date',
            'date_to' => 'sometimes|date|after_or_equal:date_from',
            'status' => 'sometimes|in:pending,approved,refused,cancelled,refunded',
        ]);

        $query = Transaction::whereHas('integration', fn ($q) => $q->where('company_id', $companyId))
            ->with(['customer', 'integration', 'payments']);

        if ($request->filled('date_from')) {
            $query->where('created_at', '>=', $request->input('date_from'));
        }

        if ($request->filled('date_to')) {
            $query->where('created_at', '<=', $request->input('date_to') . ' 23:59:59');
        }

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        $transactions = $query->orderBy('created_at', 'desc')->get();

        $filename = 'transacoes_' . now()->format('Y-m-d_His') . '.csv';

        $headers = [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ];

        $callback = function () use ($transactions) {
            $file = fopen('php://output', 'w');

            fprintf($file, chr(0xEF) . chr(0xBB) . chr(0xBF));

            fputcsv($file, [
                'UUID', 'Status', 'Método', 'Valor', 'Cliente',
                'Email', 'Documento', 'Integração', 'Gateway',
                'Data de Criação',
            ]);

            foreach ($transactions as $transaction) {
                fputcsv($file, [
                    $transaction->uuid,
                    $transaction->status,
                    $transaction->payment_method,
                    number_format($transaction->amount, 2, ',', '.'),
                    $transaction->customer->name ?? '',
                    $transaction->customer->email ?? '',
                    $transaction->customer->document ?? '',
                    $transaction->integration->name ?? '',
                    $transaction->gateway,
                    $transaction->created_at->format('d/m/Y H:i:s'),
                ]);
            }

            fclose($file);
        };

        return Response::stream($callback, 200, $headers);
    }

    private function buildSummary(?int $companyId, ?string $dateFrom = null, ?string $dateTo = null): array
    {
        $query = Transaction::query();

        if ($companyId) {
            $query->whereHas('integration', fn ($q) => $q->where('company_id', $companyId));
        } elseif (!Auth::user()->isSuperAdmin()) {
            $query->whereRaw('1=0');
        }

        if ($dateFrom) {
            $query->where('created_at', '>=', $dateFrom);
        }

        if ($dateTo) {
            $query->where('created_at', '<=', $dateTo . ' 23:59:59');
        }

        $total = $query->count();
        $approved = (clone $query)->where('status', 'approved')->count();
        $refused = (clone $query)->where('status', 'refused')->count();
        $cancelled = (clone $query)->where('status', 'cancelled')->count();
        $pending = (clone $query)->where('status', 'pending')->count();
        $refunded = (clone $query)->where('status', 'refunded')->count();

        $totalAmount = (float) (clone $query)->sum('amount');
        $approvedAmount = (float) (clone $query)->where('status', 'approved')->sum('amount');
        $refundedAmount = (float) (clone $query)->where('status', 'refunded')->sum('amount');

        $approvalRate = $total > 0 ? round(($approved / $total) * 100, 2) : 0;

        $methodsQuery = Transaction::query();

        if ($companyId) {
            $methodsQuery->whereHas('integration', fn ($q) => $q->where('company_id', $companyId));
        } elseif (!Auth::user()->isSuperAdmin()) {
            $methodsQuery->whereRaw('1=0');
        }

        $paymentMethods = $methodsQuery
            ->when($dateFrom, fn ($q) => $q->where('created_at', '>=', $dateFrom))
            ->when($dateTo, fn ($q) => $q->where('created_at', '<=', $dateTo . ' 23:59:59'))
            ->selectRaw('payment_method, COUNT(*) as total, SUM(amount) as total_amount')
            ->groupBy('payment_method')
            ->get()
            ->toArray();

        return [
            'date_from' => $dateFrom,
            'date_to' => $dateTo,
            'total_transactions' => $total,
            'approved_transactions' => $approved,
            'refused_transactions' => $refused,
            'cancelled_transactions' => $cancelled,
            'pending_transactions' => $pending,
            'refunded_transactions' => $refunded,
            'total_amount' => $totalAmount,
            'approved_amount' => $approvedAmount,
            'refunded_amount' => $refundedAmount,
            'approval_rate' => $approvalRate,
            'by_payment_method' => $paymentMethods,
        ];
    }
}
```
### Arquivo: app/Http/Controllers/Dashboard/ProfileController.php
```php
<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\TwoFactorAuthService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ProfileController extends Controller
{
    public function __construct(
        private TwoFactorAuthService $twoFactorService
    ) {}

    public function show2FASetup()
    {
        $user = Auth::user();

        if ($user->two_factor_enabled) {
            return redirect()->route('dashboard.index');
        }

        $secret = $this->twoFactorService->generateSecret();
        $user->update(['two_factor_secret' => $secret]);

        $qrCodeUrl = $this->twoFactorService->generateQRCodeUrl($user);

        return view('auth.2fa.setup', compact('qrCodeUrl', 'secret'));
    }

    public function enable2FA(Request $request)
    {
        $request->validate([
            'code' => 'required|digits:6',
        ]);

        $user = Auth::user();

        if ($this->twoFactorService->enable($user, $request->input('code'))) {
            Log::info('2FA enabled by user', ['user_id' => $user->id]);
            $request->session()->put('2fa_verified', true);
            return redirect()->route('dashboard.index')
                ->with('success', 'Autenticação de dois fatores ativada com sucesso!');
        }

        return back()->withErrors(['code' => 'Código inválido.']);
    }

    public function show2FAVerify()
    {
        return view('auth.2fa.verify');
    }

    public function verify2FA(Request $request)
    {
        $request->validate([
            'code' => 'required',
        ]);

        $user = Auth::user();

        if ($this->twoFactorService->verifyCode($user, $request->input('code')) ||
            $this->twoFactorService->verifyBackupCode($user, $request->input('code'))) {
            
            $request->session()->put('2fa_verified', true);
            Auth::login($user);
            return redirect()->intended(route('dashboard.index'));
        }

        return back()->withErrors(['code' => 'Código inválido.']);
    }

    public function show2FADisable()
    {
        return view('auth.2fa.disable');
    }

    public function disable2FA(Request $request)
    {
        $request->validate([
            'password' => 'required',
        ]);

        $user = Auth::user();

        if ($this->twoFactorService->disable($user, $request->input('password'))) {
            Log::info('2FA disabled by user', ['user_id' => $user->id]);
            return redirect()->route('dashboard.index')
                ->with('success', 'Autenticação de dois fatores desativada.');
        }

        return back()->withErrors(['password' => 'Senha incorreta.']);
    }
}```
### Arquivo: app/Http/Controllers/Dashboard/GatewayController.php
```php
<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\Gateway;
use GuzzleHttp\Client;
use GuzzleHttp\Exception\ClientException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class GatewayController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        $companyId = $user->company_id;

        $gateways = Gateway::where('company_id', $companyId)
            ->orderBy('created_at', 'desc')
            ->get();

        return view('dashboard.gateways.index', compact('gateways'));
    }

    public function create()
    {
        return view('dashboard.gateways.create');
    }

    public function store(Request $request)
    {
        try {
            $request->validate([
                'name' => 'required|string|max:255',
                'slug' => 'required|string|max:50|unique:gateways,slug',
                'is_default' => 'sometimes|boolean',
                'config' => 'sometimes|array',
                'config.api_key' => 'required|string',
                'config.api_secret' => 'nullable|string',
                'config.sandbox' => 'nullable|boolean',
                'config.webhook_url' => 'nullable|url',
            ]);

            $user = Auth::user();

            $config = $request->input('config', []);

            if ($request->boolean('is_default')) {
                Gateway::where('company_id', $user->company_id)
                    ->update(['is_default' => false]);
            }

            $gateway = Gateway::create([
                'company_id' => $user->company_id,
                'name' => $request->input('name'),
                'slug' => $request->input('slug'),
                'type' => $request->input('slug'),
                'status' => 'active',
                'is_default' => $request->boolean('is_default', false),
            ]);

            if ($request->filled('config')) {
                $configData = $request->input('config', []);
                foreach ($configData as $key => $value) {
                    if ($value !== null && $value !== '') {
                        $gateway->setConfig($key, $value);
                    }
                }
            }

            return redirect()->route('dashboard.gateways.index')
                ->with('success', 'Gateway adicionado com sucesso.');
        } catch (\Exception $e) {
            return redirect()->back()
                ->withInput()
                ->with('error', 'Erro ao salvar: '.$e->getMessage());
        }
    }

    public function show(int $id)
    {
        $user = Auth::user();

        $gateway = Gateway::where('company_id', $user->company_id)
            ->find($id);

        if (! $gateway) {
            abort(404, 'Gateway não encontrado.');
        }

        $config = [];
        foreach ($gateway->configs as $configModel) {
            $value = $configModel->decrypted_value;
            if (in_array($configModel->key, ['api_key', 'api_secret', 'webhook_token', 'token'])) {
                $value = $this->maskValue($value);
            }
            $config[$configModel->key] = $value;
        }

        $gateway->config_masked = $config;

        return view('dashboard.gateways.show', compact('gateway'));
    }

    public function edit(int $id)
    {
        $user = Auth::user();
        $gateway = Gateway::where('company_id', $user->company_id)->find($id);

        if (! $gateway) {
            abort(404, 'Gateway não encontrado.');
        }

        return view('dashboard.gateways.edit', compact('gateway'));
    }

    public function update(Request $request, int $id)
    {
        $request->validate([
            'name' => 'sometimes|string|max:255',
            'is_default' => 'sometimes|boolean',
            'config' => 'sometimes|array',
            'is_active' => 'sometimes|boolean',
        ]);

        $user = Auth::user();

        $gateway = Gateway::where('company_id', $user->company_id)->find($id);

        if (! $gateway) {
            abort(404, 'Gateway não encontrado.');
        }

        if ($request->boolean('is_default')) {
            Gateway::where('company_id', $user->company_id)
                ->where('id', '!=', $id)
                ->update(['is_default' => false]);
        }

        $gateway->update([
            'name' => $request->input('name'),
            'is_default' => $request->boolean('is_default'),
            'status' => $request->boolean('is_active', true) ? 'active' : 'inactive',
        ]);

        if ($request->has('config')) {
            foreach ($request->input('config') as $key => $value) {
                if ($value !== null && $value !== '') {
                    $gateway->setConfig($key, $value);
                }
            }
        }

        return redirect()->route('dashboard.gateways.index')
            ->with('success', 'Gateway atualizado com sucesso.');
    }

    public function destroy(int $id)
    {
        $user = Auth::user();

        $gateway = Gateway::where('company_id', $user->company_id)->find($id);

        if (! $gateway) {
            abort(404, 'Gateway não encontrado.');
        }

        $gateway->delete();

        return redirect()->route('dashboard.gateways.index')
            ->with('success', 'Gateway removido permanentemente.');
    }

    public function toggle(int $id)
    {
        $user = Auth::user();

        $gateway = Gateway::where('company_id', $user->company_id)->find($id);

        if (! $gateway) {
            abort(404, 'Gateway não encontrado.');
        }

        $gateway->update(['status' => $gateway->status === 'active' ? 'inactive' : 'active']);

        return redirect()->route('dashboard.gateways.index')
            ->with('success', 'Status do gateway atualizado.');
    }

    private function maskValue(string $value): string
    {
        if (str_starts_with($value, 'ERROR:')) {
            return $value;
        }

        if (strlen($value) <= 8) {
            return str_repeat('*', strlen($value));
        }

        return substr($value, 0, 4).str_repeat('*', strlen($value) - 8).substr($value, -4);
    }

    public function test(Request $request, int $id)
    {
        $user = Auth::user();
        $gateway = Gateway::where('company_id', $user->company_id)->find($id);

        if (! $gateway) {
            return response()->json(['success' => false, 'message' => 'Gateway não encontrado.']);
        }

        $apiKey = $gateway->getConfig('api_key');

        if (! $apiKey) {
            return response()->json(['success' => false, 'message' => 'API Key não configurada.']);
        }

        $results = [];
        $allPassed = true;

        try {
            $client = new Client;
            $sandboxConfig = $gateway->getConfig('sandbox');
            $environment = $sandboxConfig !== null
                ? (! $sandboxConfig ? 'production' : 'sandbox')
                : config('services.asaas.environment', env('APP_ENV', 'sandbox'));

            $baseUrl = $environment === 'sandbox'
                ? 'https://sandbox.asaas.com/api/v3'
                : 'https://api.asaas.com/v3';

            $headers = [
                'access_token' => $apiKey,
                'Content-Type' => 'application/json',
            ];

            // Teste 1: Validar API Key - Usando endpoint de conta
            try {
                $response = $client->get($baseUrl.'/myAccount', ['headers' => $headers]);
                $data = json_decode($response->getBody()->getContents(), true);
                $results[] = [
                    'test' => 'API Key',
                    'status' => 'passed',
                    'message' => 'API Key válida',
                    'data' => $data['email'] ?? ($data['businessEmail'] ?? 'N/A'),
                ];
            } catch (\Exception $e) {
                $results[] = ['test' => 'API Key', 'status' => 'failed', 'message' => 'API Key inválida ou endpoint não encontrado'];
                $allPassed = false;
            }

            // Teste 2: Listar clientes
            try {
                $response = $client->get($baseUrl.'/customers?limit=1', ['headers' => $headers]);
                $results[] = ['test' => 'Listar Clientes', 'status' => 'passed', 'message' => 'Consulta OK'];
            } catch (\Exception $e) {
                $results[] = ['test' => 'Listar Clientes', 'status' => 'failed', 'message' => 'Erro: '.substr($e->getMessage(), 0, 50)];
                $allPassed = false;
            }

            // Teste 3: Criar cobrança teste (R$ 5,00)
            try {
                // Tentar buscar um cliente real para o teste
                $customerResponse = $client->get($baseUrl.'/customers?limit=1', ['headers' => $headers]);
                $customers = json_decode($customerResponse->getBody()->getContents(), true);

                if (empty($customers['data'])) {
                    throw new \Exception('Nenhum cliente encontrado no Asaas para realizar o teste de cobrança.');
                }

                $customerId = $customers['data'][0]['id'];

                $paymentData = [
                    'customer' => $customerId,
                    'billingType' => 'PIX',
                    'value' => 5.00,
                    'dueDate' => date('Y-m-d', strtotime('+1 day')),
                    'description' => 'Teste de conexão - Checkout Basileia',
                ];
                $response = $client->post($baseUrl.'/payments', [
                    'headers' => $headers,
                    'json' => $paymentData,
                ]);
                $paymentDataResult = json_decode($response->getBody()->getContents(), true);
                $paymentId = $paymentDataResult['id'] ?? null;

                $envName = $gateway->getConfig('sandbox') ? 'SANDBOX' : 'PRODUÇÃO';
                $results[] = [
                    'test' => 'Criar Cobrança',
                    'status' => 'passed',
                    'message' => "Cobrança criada com sucesso ($envName)",
                    'data' => "ID: $paymentId (Acesse seu painel Asaas $envName para conferir)",
                ];
            } catch (\Exception $e) {
                $errorMessage = $e->getMessage();
                if ($e instanceof ClientException && $e->hasResponse()) {
                    $body = json_decode($e->getResponse()->getBody()->getContents(), true);
                    if (isset($body['errors'][0]['description'])) {
                        $errorMessage = $body['errors'][0]['description'];
                    }
                }

                $results[] = ['test' => 'Criar Cobrança', 'status' => 'failed', 'message' => 'Erro: '.substr($errorMessage, 0, 100)];
                $allPassed = false;
            }

            // Teste 5: Listar formas de pagamento
            try {
                $response = $client->get($baseUrl.'/payments', ['headers' => $headers]);
                $results[] = ['test' => 'Listar Cobranças', 'status' => 'passed', 'message' => 'Consulta OK'];
            } catch (\Exception $e) {
                $results[] = ['test' => 'Listar Cobranças', 'status' => 'failed', 'message' => 'Erro'];
                $allPassed = false;
            }

            // Teste 6: Webhook - Consultar configuração de webhook
            try {
                $webhookUrl = url('/api/webhooks/'.$gateway->slug);
                $webhookConfigured = false;
                $currentAsaasUrl = 'N/A';

                try {
                    $response = $client->get($baseUrl.'/webhook', ['headers' => $headers]);
                    $webhookData = json_decode($response->getBody()->getContents(), true);
                    $currentAsaasUrl = $webhookData['url'] ?? 'N/A';
                    if ($currentAsaasUrl !== 'N/A' && str_contains($currentAsaasUrl, $webhookUrl)) {
                        $webhookConfigured = true;
                    }
                } catch (\Exception $e) {
                    // Tentar plural se singular falhar
                    try {
                        $response = $client->get($baseUrl.'/webhooks', ['headers' => $headers]);
                        $webhookData = json_decode($response->getBody()->getContents(), true);
                        foreach ($webhookData['data'] ?? [] as $wh) {
                            if (isset($wh['url']) && str_contains($wh['url'], $webhookUrl)) {
                                $webhookConfigured = true;
                                $currentAsaasUrl = $wh['url'];
                                break;
                            }
                        }
                    } catch (\Exception $e2) {
                        $results[] = ['test' => 'Webhook', 'status' => 'warning', 'message' => 'Erro ao consultar: '.substr($e->getMessage(), 0, 50)];
                        throw $e;
                    }
                }

                $results[] = [
                    'test' => 'Webhook',
                    'status' => $webhookConfigured ? 'passed' : 'warning',
                    'message' => $webhookConfigured ? 'Webhook OK' : 'URL divergente ou não configurada',
                    'data' => "Sistema: $webhookUrl | Asaas: $currentAsaasUrl",
                ];
            } catch (\Exception $e) {
                // Já tratado no try interno ou erro fatal
            }

            // Teste 7: Assinaturas (Se disponível)
            try {
                $response = $client->get($baseUrl.'/subscriptions?limit=1', ['headers' => $headers]);
                $results[] = ['test' => 'Assinaturas', 'status' => 'passed', 'message' => 'API de assinaturas OK'];
            } catch (\Exception $e) {
                $msg = $e->getMessage();
                if ($e instanceof ClientException && $e->hasResponse()) {
                    $body = json_decode($e->getResponse()->getBody()->getContents(), true);
                    $msg = $body['errors'][0]['description'] ?? $msg;
                }
                $results[] = ['test' => 'Assinaturas', 'status' => 'warning', 'message' => 'Info: '.substr($msg, 0, 80)];
            }

            return response()->json([
                'success' => $allPassed,
                'message' => $allPassed ? 'Todos os testes passaram!' : 'Alguns testes falharam',
                'results' => $results,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erro geral: '.$e->getMessage(),
                'results' => $results,
            ]);
        }
    }
}
```
### Arquivo: app/Http/Controllers/Dashboard/PasswordController.php
```php
<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class PasswordController extends Controller
{
    public function showChangeForm()
    {
        return view('auth.change-password');
    }

    public function changePassword(Request $request)
    {
        $request->validate([
            'current_password' => 'required',
            'new_password' => ['required', 'string', 'min:12'],
            'new_password_confirmation' => 'required|same:new_password',
        ], [
            'new_password.min' => 'A senha deve ter pelo menos 12 caracteres.',
            'new_password.required' => 'A nova senha é obrigatória.',
            'new_password_confirmation.required' => 'A confirmação da senha é obrigatória.',
            'new_password_confirmation.same' => 'As senhas não conferem.',
        ]);

        $user = Auth::user();

        if (!Hash::check($request->current_password, $user->password)) {
            Log::warning('PasswordChange: Senha atual incorreta', [
                'user_id' => $user->id,
                'ip' => $request->ip(),
            ]);
            return back()->withErrors([
                'current_password' => 'A senha atual está incorreta.',
            ]);
        }

        $validacao = $this->validarSenhaForte($request->new_password);
        if (!$validacao['valida']) {
            return back()->withErrors([
                'new_password' => $validacao['mensagem'],
            ]);
        }

        $user->update([
            'password' => Hash::make($request->new_password),
            'must_change_password' => false,
            'password_changed_at' => now(),
        ]);

        Log::info('PasswordChange: Senha alterada com sucesso', [
            'user_id' => $user->id,
        ]);

        return redirect()->route('dashboard.index')
            ->with('success', 'Senha alterada com sucesso!');
    }

    public function validarSenhaForte(string $senha): array
    {
        $erros = [];

        if (strlen($senha) < 12) {
            $erros[] = 'Mínimo de 12 caracteres';
        }

        if (!preg_match('/[A-Z]/', $senha)) {
            $erros[] = 'pelo menos 1 letra maiúscula';
        }

        if (!preg_match('/[a-z]/', $senha)) {
            $erros[] = 'pelo menos 1 letra minúscula';
        }

        if (!preg_match('/[0-9]/', $senha)) {
            $erros[] = 'pelo menos 1 número';
        }

        if (!preg_match('/[!@#$%&*]/', $senha)) {
            $erros[] = 'pelo menos 1 caractere especial (!@#$%&*)';
        }

        if (!empty($erros)) {
            return [
                'valida' => false,
                'mensagem' => 'A senha deve conter: ' . implode(', ', $erros) . '.',
            ];
        }

        return ['valida' => true, 'mensagem' => 'Senha válida.'];
    }
}```
### Arquivo: app/Http/Controllers/Dashboard/ReceiptController.php
```php
<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Company;
use Illuminate\Support\Facades\Auth;

class ReceiptController extends Controller
{
    /**
     * Show the receipt template settings page.
     */
    public function index()
    {
        $company = Auth::user()->company;
        $settings = $company->settings ?? [];
        $receipt = $settings['receipt'] ?? [
            'header_text' => 'Comprovante de Pagamento',
            'footer_text' => 'Obrigado por sua compra!',
            'show_logo' => true,
            'show_customer_data' => true,
        ];

        return view('dashboard.settings.receipt', compact('receipt'));
    }

    /**
     * Update the receipt template settings.
     */
    public function update(Request $request)
    {
        $request->validate([
            'header_text' => 'required|string|max:255',
            'footer_text' => 'required|string|max:500',
        ]);

        $company = Auth::user()->company;
        $settings = $company->settings ?? [];
        
        $settings['receipt'] = [
            'header_text' => $request->input('header_text'),
            'footer_text' => $request->input('footer_text'),
            'show_logo' => $request->has('show_logo'),
            'show_customer_data' => $request->has('show_customer_data'),
            'custom_css' => $request->input('custom_css'),
        ];

        $company->update(['settings' => $settings]);

        return redirect()->route('dashboard.settings.receipt')
            ->with('success', 'Modelo de comprovante atualizado com sucesso.');
    }
}
```
### Arquivo: app/Http/Controllers/Dashboard/CheckoutConfigController.php
```php
<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\CheckoutConfig;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CheckoutConfigController extends Controller
{
    public function index()
    {
        $configs = CheckoutConfig::where('company_id', auth()->user()->company_id)
            ->orderBy('is_active', 'desc')
            ->orderBy('updated_at', 'desc')
            ->get();

        return view('dashboard.checkout-configs.index', compact('configs'));
    }

    public function create()
    {
        $config = new CheckoutConfig();
        $config->config = CheckoutConfig::defaultConfig();

        return view('dashboard.checkout-configs.edit', [
            'config' => $config,
            'is_new' => true,
        ]);
    }

    public function edit(int $id)
    {
        $config = CheckoutConfig::where('company_id', auth()->user()->company_id)
            ->findOrFail($id);

        return view('dashboard.checkout-configs.edit', [
            'config' => $config,
            'is_new' => false,
        ]);
    }

    public function save(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:100',
        ]);

        $companyId = auth()->user()->company_id;

        $configData = $request->input('config', []);
        $slug = $request->input('slug') 
            ?? Str::slug($request->input('name'))
            . '-' . Str::random(4);

        $config = CheckoutConfig::updateOrCreate(
            [
                'id' => $request->input('id'),
                'company_id' => $companyId,
            ],
            [
                'name' => $request->input('name'),
                'slug' => $slug,
                'company_id' => $companyId,
                'config' => $configData,
                'description' => $request->input('description'),
            ]
        );

        return redirect()->route('dashboard.checkout-configs.index')
            ->with('success', 'Configuração salva!');
    }

    public function publish(Request $request, int $id)
    {
        $config = CheckoutConfig::where('company_id', auth()->user()->company_id)
            ->findOrFail($id);

        $config->publish();

        return back()->with('success', 'Publicado em produção!');
    }

    public function delete(int $id)
    {
        $config = CheckoutConfig::where('company_id', auth()->user()->company_id)
            ->findOrFail($id);

        $config->delete();

        return redirect()->route('dashboard.checkout-configs.index')
            ->with('success', 'Configuração excluída!');
    }

    public function duplicate(int $id)
    {
        $original = CheckoutConfig::where('company_id', auth()->user()->company_id)
            ->findOrFail($id);

        $clone = $original->replicate();
        $clone->name = $original->name . ' (cópia)';
        $clone->slug = Str::slug($clone->name) . '-' . Str::random(4);
        $clone->is_active = false;
        $clone->save();

        return redirect()->route('dashboard.checkout-configs.edit', $clone->id)
            ->with('success', 'Cópia criada! Edite e salve.');
    }

    public function preview(int $id)
    {
        $config = CheckoutConfig::findOrFail($id);

        return view('checkout.preview', [
            'config' => $config,
            'preview' => true,
        ]);
    }
}
```
### Arquivo: app/Http/Controllers/Dashboard/SourceConfigController.php
```php
<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\SourceConfig;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class SourceConfigController extends Controller
{
    public function index()
    {
        $sources = SourceConfig::orderBy('created_at', 'desc')->get();
        return view('dashboard.sources.index', compact('sources'));
    }

    public function store(Request $request)
    {
        $request->validate([
            'source_name' => 'required|string|max:255|unique:source_configs,source_name',
            'callback_url' => 'required|url',
            'webhook_secret' => 'required|string|min:16',
        ]);

        $webhookSecret = $request->input('webhook_secret');
        
        SourceConfig::create([
            'source_name' => $request->input('source_name'),
            'callback_url' => $request->input('callback_url'),
            'webhook_secret' => $webhookSecret,
            'active' => $request->boolean('active', true),
        ]);

        return redirect()->route('dashboard.sources.index')
            ->with('success', 'Sistema cadastrado com sucesso!');
    }

    public function update(Request $request, SourceConfig $source)
    {
        $request->validate([
            'source_name' => 'required|string|max:255|unique:source_configs,source_name,' . $source->id,
            'callback_url' => 'required|url',
            'webhook_secret' => 'required|string|min:16',
        ]);

        $source->update([
            'source_name' => $request->input('source_name'),
            'callback_url' => $request->input('callback_url'),
            'webhook_secret' => $request->input('webhook_secret'),
            'active' => $request->boolean('active', true),
        ]);

        return redirect()->route('dashboard.sources.index')
            ->with('success', 'Sistema atualizado com sucesso!');
    }

    public function destroy(SourceConfig $source)
    {
        $source->delete();
        
        return redirect()->route('dashboard.sources.index')
            ->with('success', 'Sistema removido com sucesso!');
    }

    public function toggle(SourceConfig $source)
    {
        $source->update([
            'active' => !$source->active,
        ]);

        $status = $source->active ? 'ativado' : 'desativado';
        
        return redirect()->route('dashboard.sources.index')
            ->with('success', "Sistema {$status} com sucesso!");
    }
}```
### Arquivo: app/Http/Controllers/Dashboard/TransactionDashboardController.php
```php
<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class TransactionDashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        $companyId = $user->company_id;

        $request->validate([
            'status' => 'sometimes|in:pending,approved,refused,cancelled,refunded',
            'date_from' => 'sometimes|date',
            'date_to' => 'sometimes|date|after_or_equal:date_from',
            'gateway' => 'sometimes|string',
            'integration_id' => 'sometimes|integer|exists:integrations,id',
            'search' => 'sometimes|string|max:255',
        ]);

        $query = Transaction::where('company_id', $companyId)
            ->with(['customer', 'integration', 'payments']);

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->filled('date_from')) {
            $query->where('created_at', '>=', $request->input('date_from'));
        }

        if ($request->filled('date_to')) {
            $query->where('created_at', '<=', $request->input('date_to') . ' 23:59:59');
        }

        if ($request->filled('gateway')) {
            $query->where('gateway', $request->input('gateway'));
        }

        if ($request->filled('integration_id')) {
            $query->where('integration_id', $request->input('integration_id'));
        }

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('uuid', 'like', "%{$search}%")
                  ->orWhereHas('customer', fn ($c) =>
                      $c->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhere('document', 'like', "%{$search}%")
                  );
            });
        }

        $transactions = $query->orderBy('created_at', 'desc')->paginate(20);

        $filters = $request->only(['status', 'date_from', 'date_to', 'gateway', 'integration_id', 'search']);

        return view('dashboard.transactions.index', compact('transactions', 'filters'));
    }

    public function show(Request $request, int $id)
    {
        $user = Auth::user();
        $companyId = $user->company_id;

        $transaction = Transaction::where('company_id', $companyId)
            ->orWhereHas('integration', fn ($q) => $q->where('company_id', $companyId))
            ->with(['customer', 'integration', 'payments', 'items'])
            ->find($id);

        if (!$transaction) {
            abort(404, 'Transação não encontrada.');
        }

        return view('dashboard.transactions.show', compact('transaction'));
    }

    public function export(Request $request)
    {
        $user = Auth::user();
        $companyId = $user->company_id;

        $transactions = Transaction::where('company_id', $companyId)
            ->with(['customer', 'integration'])
            ->orderBy('created_at', 'desc')
            ->limit(5000)
            ->get();

        $csv = "UUID,Cliente,Email,Valor,Moeda,Método,Status,Data\n";
        foreach ($transactions as $tx) {
            $csv .= sprintf(
                "%s,%s,%s,%.2f,%s,%s,%s,%s\n",
                $tx->uuid,
                $tx->customer?->name ?? '-',
                $tx->customer?->email ?? '-',
                $tx->amount,
                $tx->currency,
                $tx->payment_method,
                $tx->status,
                $tx->created_at?->format('Y-m-d H:i:s') ?? '-',
            );
        }

        return response($csv)
            ->header('Content-Type', 'text/csv')
            ->header('Content-Disposition', 'attachment; filename="transacoes_' . date('Y-m-d') . '.csv"');
    }
}
```
### Arquivo: app/Http/Controllers/Dashboard/LabController.php
```php
<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\CheckoutConfig;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class LabController extends Controller
{
    public function index()
    {
        $configs = CheckoutConfig::where('company_id', Auth::user()->company_id)
            ->orderBy('is_active', 'desc')
            ->orderBy('updated_at', 'desc')
            ->get();

        return view('dashboard.lab', compact('configs'));
    }

    public function createAndEdit()
    {
        $config = new CheckoutConfig;
        $config->name = 'Novo Checkout '.date('d/m H:i');
        $config->slug = 'checkout-'.Str::random(8);
        $config->company_id = Auth::user()->company_id;
        $config->config = CheckoutConfig::defaultConfig();
        $config->save();

        return redirect()->route('dashboard.checkout-configs.edit', $config->id);
    }
}
```
### Arquivo: app/Http/Controllers/Dashboard/IntegrationController.php
```php
<?php

declare(strict_types=1);

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\Integration;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

/**
 * [BUG-04] Company::first() sem filtro de empresa removido.
 *          Superadmin sem empresa vinculada é redirecionado para seleção explícita.
 */
class IntegrationController extends Controller
{
    public function index(): mixed
    {
        $user      = Auth::user();
        $companyId = $user->company_id;

        // [BUG-04] NUNCA usa Company::first() como fallback
        // Superadmin sem empresa → redireciona para seleção
        if (empty($companyId)) {
            return redirect()->route('dashboard.companies.index')
                ->with('warning', 'Selecione ou crie uma empresa antes de gerenciar integrações.');
        }

        $integrations = Integration::where('company_id', $companyId)
            ->withCount('transactions')
            ->get();

        $template = Integration::where('company_id', $companyId)->latest()->first();

        return view('dashboard.integrations.index', compact('integrations', 'template'));
    }

    public function store(Request $request): mixed
    {
        $request->validate([
            'name'           => 'required|string|max:255',
            'base_url'       => 'nullable|url',
            'webhook_url'    => 'nullable|url',
            'webhook_secret' => 'nullable|string|max:255',
        ]);

        $user = Auth::user();

        // Guarda segurança extra
        if (empty($user->company_id)) {
            return redirect()->route('dashboard.companies.index')
                ->with('warning', 'Selecione uma empresa antes de criar uma integração.');
        }

        $apiKey = 'cklive.' . Str::random(32);

        $integration = Integration::create([
            'company_id'     => $user->company_id,
            'name'           => $request->input('name'),
            'slug'           => Str::slug($request->input('name')),
            'base_url'       => $request->input('base_url', 'https://vendas.basileia.global'),
            'webhook_url'    => $request->input('webhook_url'),
            'webhook_secret' => $request->input('webhook_secret')
                ? trim($request->input('webhook_secret'))
                : null,
            'api_key_hash'   => hash('sha256', $apiKey),
            'api_key_prefix' => substr($apiKey, 0, 16),
            'permissions'    => 'all',
            'status'         => 'active',
        ]);

        return redirect()
            ->route('dashboard.integrations.show', $integration->id)
            ->with('success', 'Integração criada com sucesso. API Key: ' . $apiKey);
    }

    public function show(int $id): mixed
    {
        $user        = Auth::user();
        $integration = Integration::where('company_id', $user->company_id)
            ->with('webhookEndpoints')
            ->withCount('transactions')
            ->find($id);

        if (! $integration) {
            abort(404, 'Integração não encontrada.');
        }

        $integration->api_key_prefix_display = $integration->api_key_prefix . '...';

        return view('dashboard.integrations.show', compact('integration'));
    }

    public function update(Request $request, int $id): mixed
    {
        $request->validate([
            'name'           => 'sometimes|string|max:255',
            'description'    => 'sometimes|string|max:500',
            'base_url'       => 'sometimes|url',
            'webhook_url'    => 'sometimes|url',
            'webhook_events' => 'sometimes|array',
        ]);

        $user        = Auth::user();
        $integration = Integration::where('company_id', $user->company_id)->find($id);

        if (! $integration) {
            abort(404, 'Integração não encontrada.');
        }

        $integration->update(array_merge(
            $request->only(['name', 'description', 'base_url', 'webhook_url']),
            $request->has('webhook_secret')
                ? ['webhook_secret' => trim($request->input('webhook_secret'))]
                : []
        ));

        return redirect()
            ->route('dashboard.integrations.show', $integration->id)
            ->with('success', 'Integração atualizada com sucesso.');
    }

    public function destroy(int $id): mixed
    {
        $user        = Auth::user();
        $integration = Integration::where('company_id', $user->company_id)->find($id);

        if (! $integration) {
            abort(404, 'Integração não encontrada.');
        }

        $integration->update(['status' => 'inactive']);

        return redirect()
            ->route('dashboard.integrations.index')
            ->with('success', 'Integração desativada com sucesso.');
    }

    public function toggle(int $id): mixed
    {
        $user        = Auth::user();
        $integration = Integration::where('company_id', $user->company_id)->find($id);

        if (! $integration) {
            abort(404, 'Integração não encontrada.');
        }

        $integration->update([
            'status' => $integration->status === 'active' ? 'inactive' : 'active',
        ]);

        return redirect()
            ->route('dashboard.integrations.index')
            ->with('success', 'Status da integração atualizado.');
    }

    public function regenerateKey(int $id): mixed
    {
        $user        = Auth::user();
        $integration = Integration::where('company_id', $user->company_id)->find($id);

        if (! $integration) {
            abort(404, 'Integração não encontrada.');
        }

        $newApiKey = 'cklive.' . Str::random(32);

        $integration->update([
            'api_key_hash'   => hash('sha256', $newApiKey),
            'api_key_prefix' => substr($newApiKey, 0, 16),
        ]);

        return redirect()
            ->route('dashboard.integrations.show', $integration->id)
            ->with('success', 'Nova API Key gerada com sucesso!')
            ->with('new_api_key', $newApiKey);
    }
}
```
### Arquivo: app/Http/Controllers/Public/HomeController.php
```php
<?php

declare(strict_types=1);

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Subscription;
use App\Models\Transaction;
use App\Services\CheckoutService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

/**
 * [BUG-05] company_id hardcoded => 1 removido.
 *          Usa CheckoutService::resolveCompanyId() — único ponto de resolução.
 */
class HomeController extends Controller
{
    public function index(Request $request): mixed
    {
        // Fluxo 1: redirect por asaas_payment_id (vindo do Basileia Vendas)
        if ($request->has('asaas_payment_id')) {
            return $this->handleAsaasRedirect($request);
        }

        // Fluxo 2: redirect por UUID
        $uuid = $request->get('uuid');
        if ($uuid) {
            return $this->handleUuidRedirect($uuid);
        }

        return view('home');
    }

    private function handleAsaasRedirect(Request $request): mixed
    {
        $asaasPaymentId = $request->get('asaas_payment_id');

        // Já existe → redireciona direto
        $transaction = Transaction::where('asaas_payment_id', $asaasPaymentId)->first();
        if ($transaction) {
            return redirect()->away(route('checkout.show', ['uuid' => $transaction->uuid]), 301);
        }

        // [BUG-05] NUNCA usa company_id hardcoded — resolve pelo contexto
        $companyId = CheckoutService::resolveCompanyId();

        if (! $companyId) {
            Log::warning('HomeController: company_id não resolvido para asaas_payment_id', [
                'asaas_payment_id' => $asaasPaymentId,
                'ip'               => $request->ip(),
            ]);
            return view('home', ['error' => 'Empresa não identificada. Verifique o link de pagamento.']);
        }

        $transaction = Transaction::create([
            'uuid'              => (string) Str::uuid(),
            'company_id'        => $companyId, // ← dinâmico, nunca hardcoded
            'asaas_payment_id'  => $asaasPaymentId,
            'source'            => 'basileiavendas',
            'amount'            => (float) $request->get('valor', 0),
            'description'       => $request->get('plano', 'Pagamento Basileia'),
            'payment_method'    => 'credit_card',
            'status'            => 'pending',
            'customer_name'     => $request->get('cliente', ''),
            'customer_email'    => $request->get('email', ''),
            'customer_document' => preg_replace('/\D/', '', $request->get('documento', '')),
            'customer_phone'    => preg_replace('/\D/', '', $request->get('whatsapp', '')),
        ]);

        Log::info('HomeController: transação criada via redirect', [
            'uuid'             => $transaction->uuid,
            'company_id'       => $companyId,
            'asaas_payment_id' => $asaasPaymentId,
        ]);

        return redirect()->away(route('checkout.show', ['uuid' => $transaction->uuid]), 301);
    }

    private function handleUuidRedirect(string $uuid): mixed
    {
        $transaction  = Transaction::where('uuid', $uuid)->first();
        $subscription = Subscription::where('uuid', $uuid)->first();

        if ($transaction)  return redirect()->away(route('checkout.show', $uuid), 301);
        if ($subscription) return redirect()->away(route('checkout.show', $uuid), 301);

        return view('home', [
            'error' => 'Checkout não encontrado. Verifique o código e tente novamente.',
            'uuid'  => $uuid,
        ]);
    }
}```
### Arquivo: app/Http/Controllers/Public/PaymentStatusController.php
```php
<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use Illuminate\Http\Request;

class PaymentStatusController extends Controller
{
    public function show(string $uuid)
    {
        $transaction = Transaction::where('uuid', $uuid)
            ->with(['customer', 'payments', 'items'])
            ->first();

        if (!$transaction) {
            return view('checkout.error', [
                'message' => 'Pagamento não encontrado.',
            ]);
        }

        $autoRefresh = $transaction->status === 'pending';

        return view('checkout.status', [
            'transaction' => $transaction,
            'autoRefresh' => $autoRefresh,
            'refreshInterval' => 10,
        ]);
    }
}
```
### Arquivo: app/Http/Controllers/Public/CheckoutPageController.php
```php
<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use App\Services\CardValidator;
use App\Services\PaymentService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\RateLimiter;

class CheckoutPageController extends Controller
{
    private const ALLOWED_PAYMENT_METHODS = ['pix', 'boleto', 'credit_card', 'debit_card'];
    private const IDEMPOTENCY_KEY_PREFIX = 'checkout_payment_';

    public function __construct(
        private PaymentService $paymentService,
        private CardValidator $cardValidator
    ) {
    }

    public function show(string $uuid, Request $request)
    {
        $transaction = Transaction::where('uuid', $uuid)
            ->where('status', 'pending')
            ->with(['customer', 'items', 'integration', 'integration.company'])
            ->first();

        if (!$transaction) {
            return $this->errorResponse('Pagamento não encontrado ou já processado.');
        }

        if (!$transaction->integration || $transaction->integration->status !== 'active') {
            Log::warning('Checkout access denied: integration inactive', [
                'transaction_id' => $transaction->id,
                'uuid' => $uuid,
            ]);
            return $this->errorResponse('Pagamento temporariamente indisponível.');
        }

        if ($transaction->expires_at && now()->greaterThan($transaction->expires_at)) {
            Log::warning('Checkout access denied: transaction expired', [
                'transaction_id' => $transaction->id,
                'uuid' => $uuid,
            ]);
            return $this->errorResponse('Link de pagamento expirado.');
        }

        $requestedMethod = $request->get('method');

        if ($requestedMethod && in_array(strtolower($requestedMethod), self::ALLOWED_PAYMENT_METHODS)) {
            $paymentMethod = strtolower($requestedMethod);
        } else {
            $paymentMethod = $transaction->payment_method;
        }

        if (!in_array($paymentMethod, self::ALLOWED_PAYMENT_METHODS)) {
            $paymentMethod = 'pix';
        }

        $installments = $transaction->installments ?? 1;

        return view('checkout.index', compact('transaction', 'paymentMethod', 'installments'));
    }

    public function process(Request $request, string $uuid)
    {
        $transaction = Transaction::where('uuid', $uuid)
            ->where('status', 'pending')
            ->with('integration', 'integration.company')
            ->first();

        if (!$transaction) {
            return back()->withErrors([
                'payment' => 'Transação não encontrada ou já processada.',
            ]);
        }

        if (!$transaction->integration || $transaction->integration->status !== 'active') {
            Log::warning('Payment attempt denied: integration inactive', [
                'transaction_id' => $transaction->id,
                'uuid' => $uuid,
            ]);
            return back()->withErrors([
                'payment' => 'Pagamento temporariamente indisponível.',
            ]);
        }

        $idempotencyKey = self::IDEMPOTENCY_KEY_PREFIX . $transaction->id;
        if (
            RateLimiter::attempt($idempotencyKey, 1, function () use ($transaction) {
                return $transaction->payments()->count() > 0;
            }, 300)
        ) {
            Log::warning('Duplicate payment attempt blocked', [
                'transaction_id' => $transaction->id,
                'uuid' => $uuid,
                'ip' => $request->ip(),
            ]);
            return back()->withErrors([
                'payment' => 'Pagamento já processado. Verifique o status da transação.',
            ]);
        }

        $paymentMethod = $request->input('payment_method');

        if (!in_array($paymentMethod, self::ALLOWED_PAYMENT_METHODS)) {
            return back()->withErrors([
                'payment' => 'Método de pagamento inválido.',
            ]);
        }

        $rules = [
            'payment_method' => 'required|in:' . implode(',', self::ALLOWED_PAYMENT_METHODS),
        ];

        if (in_array($paymentMethod, ['credit_card', 'debit_card'])) {
            $rules = array_merge($rules, [
                'card_number' => 'required|string|min:13|max:19',
                'card_holder_name' => 'required|string|max:255|min:3',
                'card_expiry_month' => 'required|integer|min:1|max:12',
                'card_expiry_year' => 'required|integer|min:' . date('Y'),
                'card_cvv' => 'required|string|min:3|max:4',
                'installments' => 'sometimes|integer|min:1|max:12',
            ]);
        }

        $request->validate($rules);

        if (in_array($paymentMethod, ['credit_card', 'debit_card'])) {
            $sanitizedCardNumber = $this->cardValidator->sanitize($request->input('card_number'));

            $cardValidation = $this->cardValidator->validate(
                $sanitizedCardNumber,
                $request->input('card_cvv')
            );

            if (!$cardValidation['valid']) {
                Log::warning('Card validation failed', [
                    'transaction_id' => $transaction->id,
                    'ip' => $request->ip(),
                    'reason' => $cardValidation['error'],
                ]);
                return back()->withErrors([
                    'payment' => 'Dados do cartão inválidos. Verifique e tente novamente.',
                ]);
            }

            if (
                !$this->cardValidator->validateExpiry(
                    $request->input('card_expiry_month'),
                    $request->input('card_expiry_year')
                )
            ) {
                return back()->withErrors([
                    'payment' => 'Cartão expirado. Utilize um cartão válido.',
                ]);
            }
        }

        try {
            $paymentData = [
                'transaction_uuid' => $transaction->uuid,
                'payment_method' => $paymentMethod,
            ];

            if (in_array($paymentMethod, ['credit_card', 'debit_card'])) {
                $paymentData['card'] = [
                    'number' => $sanitizedCardNumber,
                    'holder_name' => strip_tags($request->input('card_holder_name')),
                    'expiry_month' => $request->input('card_expiry_month'),
                    'expiry_year' => $request->input('card_expiry_year'),
                    'cvv' => $request->input('card_cvv'),
                    'installments' => $request->input('installments', 1),
                ];
            }

            $paymentData['ip'] = $request->ip();
            $paymentData['user_agent'] = $request->userAgent();

            Log::info('Payment initiated', [
                'transaction_id' => $transaction->id,
                'uuid' => $uuid,
                'amount' => $transaction->amount,
                'payment_method' => $paymentMethod,
                'card_brand' => $cardValidation['brand'] ?? null,
            ]);

            $this->paymentService->process($paymentData, $transaction->integration);

            return redirect()->route('checkout.success', ['uuid' => $transaction->uuid]);
        } catch (\Exception $e) {
            Log::error('Payment processing failed', [
                'transaction_id' => $transaction->id,
                'uuid' => $uuid,
                'error' => $e->getMessage(),
                'ip' => $request->ip(),
            ]);

            RateLimiter::clear($idempotencyKey);

            return back()->withErrors([
                'payment' => 'Erro ao processar pagamento. Tente novamente em alguns minutos.',
            ])->withInput();
        }
    }

    public function success(string $uuid)
    {
        $transaction = Transaction::where('uuid', $uuid)
            ->with(['customer', 'payments'])
            ->first();

        if (!$transaction) {
            return $this->errorResponse('Transação não encontrada.');
        }

        return view('checkout.card.front.sucesso', compact('transaction'));
    }

    private function errorResponse(string $message)
    {
        if (request()->expectsJson() || request()->is('api/*')) {
            return response()->json(['error' => $message], 403);
        }

        return view('checkout.error', ['message' => $message]);
    }
}
```
### Arquivo: app/Http/Controllers/Public/EventCheckoutController.php
```php
<?php

declare(strict_types=1);

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\Transaction;
use App\Services\CustomerService;
use App\Services\PaymentService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class EventCheckoutController extends Controller
{
    public function show(string $slug): mixed
    {
        $event = Event::where('slug', $slug)->firstOrFail();

        if (! $event->isDisponivel()) {
            return view('checkout.evento.esgotado', compact('event'));
        }

        return view('checkout.evento.index', compact('event'));
    }

    public function process(Request $request, string $slug, CustomerService $customerService, PaymentService $paymentService): mixed
    {
        $event = Event::where('slug', $slug)->firstOrFail();

        if (! $event->isDisponivel()) {
            return back()->withErrors(['error' => 'Este evento não está mais disponível.'])->withInput();
        }

        $request->validate([
            'name'         => 'required|string|max:255',
            'email'        => 'required|email',
            'document'     => 'required|string|max:20',
            'phone'        => 'nullable|string|max:20',
            'billingtype'  => 'required|in:PIX,BOLETO,CREDITCARD',
        ]);

        // [BUG-04] company_id vem do evento, não de Company::first()
        $companyId = $event->company_id;

        $customer = $customerService->findOrCreate([
            'company_id' => $companyId,
            'name'       => $request->name,
            'email'      => $request->email,
            'document'   => preg_replace('/\D/', '', $request->document),
            'phone'      => $request->phone,
        ], $event->company);

        $transaction = Transaction::create([
            'uuid'              => (string) Str::uuid(),
            'company_id'        => $companyId, // ← do evento, nunca hardcoded
            'event_id'          => $event->id,
            'amount'            => $event->valor,
            'description'       => 'Ingresso: ' . $event->titulo,
            'status'            => 'pending',
            'payment_method'    => strtolower($request->billingtype),
            'customer_name'     => $request->name,
            'customer_email'    => $request->email,
            'customer_document' => preg_replace('/\D/', '', $request->document),
        ]);

        try {
            $payment = $paymentService->processPayment([
                'transaction_uuid' => $transaction->uuid,
                'billingtype'      => $request->billingtype,
                'amount'           => $event->valor,
                'customer'         => [
                    'name'     => $request->name,
                    'email'    => $request->email,
                    'document' => preg_replace('/\D/', '', $request->document),
                ],
            ]);

            $event->incrementarVaga();

            if ($request->billingtype === 'PIX' && isset($payment['pixQrCode'])) {
                return view('checkout.evento.pagamento', compact('event', 'payment', 'transaction') + ['billingtype' => $request->billingtype]);
            }

            if ($request->billingtype === 'BOLETO' && isset($payment['bankSlipUrl'])) {
                return view('checkout.evento.pagamento', compact('event', 'payment', 'transaction') + ['billingtype' => $request->billingtype]);
            }

            return redirect(route('evento.success', ['slug' => $slug]));
        } catch (\Throwable $e) {
            Log::error('EventCheckoutController: erro', ['error' => $e->getMessage(), 'slug' => $slug]);
            return back()->withErrors(['payment' => 'Erro ao processar pagamento.'])->withInput();
        }
    }

    public function success(string $slug): mixed
    {
        $event = Event::where('slug', $slug)->firstOrFail();
        return view('checkout.card.front.sucesso', compact('event'));
    }
}```
### Arquivo: app/Http/Controllers/WebhookController.php
```php
<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Helpers\PaymentStatusMapper;
use App\Models\Transaction;
use App\Services\WebhookNotifierService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

/**
 * [QA-03] statusMap inline removido:
 *
 * ANTES (duplicava a lógica):
 *   $statusMap = ['CONFIRMED' => 'approved', 'RECEIVED' => 'approved', ...];
 *   $status = $statusMap[$payload['payment']['status']] ?? 'pending';
 *
 * AGORA (fonte única de verdade):
 *   $status = PaymentStatusMapper::mapStatus($rawStatus);
 */
class WebhookController extends Controller
{
    public function __construct(
        private WebhookNotifierService $webhookNotifier,
    ) {
    }

    public function handle(Request $request): \Illuminate\Http\JsonResponse
    {
        $payload = $request->all();
        $event = $payload['event'] ?? '';
        $paymentId = $payload['payment']['id'] ?? '';
        $rawStatus = $payload['payment']['status'] ?? '';

        if (!$paymentId) {
            Log::warning('WebhookController: payload sem payment.id', ['ip' => $request->ip()]);
            return response()->json(['ok' => false, 'error' => 'payment.id ausente'], 422);
        }

        $transaction = Transaction::where('asaas_payment_id', $paymentId)->first();

        if (!$transaction) {
            Log::info('WebhookController: transação não encontrada localmente', [
                'payment_id' => $paymentId,
                'event' => $event,
            ]);
            return response()->json(['ok' => true, 'warning' => 'Transação não encontrada']);
        }

        // [QA-03] Usa PaymentStatusMapper — NUNCA statusMap inline
        $status = PaymentStatusMapper::mapStatus($rawStatus);
        $paidAt = PaymentStatusMapper::isPaid($rawStatus) ? now() : null;

        if ($transaction->status !== $status) {
            $transaction->update(['status' => $status, 'paid_at' => $paidAt]);

            Log::info('WebhookController: status atualizado', [
                'payment_id' => $paymentId,
                'event' => $event,
                'status' => $status,
            ]);

            $this->webhookNotifier->notify($transaction->fresh());
        }

        return response()->json(['ok' => true]);
    }
}```
### Arquivo: app/Http/Controllers/Api/V1/CheckoutWebhookController.php
```php
<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Helpers\PaymentStatusMapper;
use App\Http\Controllers\Controller;
use App\Models\Integration;
use App\Models\Transaction;
use App\Models\WebhookEvent;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

/**
 * Recebe callbacks do Asaas para o sistema de Checkout.
 * Diferente do ApiV1\WebhookController (que serve a API externa),
 * este controller processa eventos internos do checkout.
 *
 * [QA-03] statusMap inline removido — usa PaymentStatusMapper.
 */
class CheckoutWebhookController extends Controller
{
    private const ASAAS_IP_WHITELIST = ['13.90.0.0/16', '13.91.0.0/16'];
    private const LOCK_TIMEOUT       = 300;

    public function handle(Request $request): JsonResponse
    {
        if (! $this->validateAsaasIp($request)) {
            Log::warning('CheckoutWebhookController: IP não autorizado', ['ip' => $request->ip()]);
            return response()->json(['message' => 'Forbidden'], Response::HTTP_FORBIDDEN);
        }

        $payload              = $request->all();
        $signature            = $request->header('asaas-access-token');
        $integration          = $this->resolveIntegrationBySignature($signature);
        $gatewayTransactionId = $payload['payment']['id'] ?? $payload['paymentId'] ?? null;
        $eventType            = $payload['event']         ?? $payload['notificationType'] ?? null;

        if (! $integration) {
            Log::warning('CheckoutWebhookController: assinatura inválida', ['ip' => $request->ip()]);
            return response()->json(['message' => 'Unauthorized'], Response::HTTP_UNAUTHORIZED);
        }

        if (! $gatewayTransactionId || ! $eventType) {
            return response()->json(['message' => 'Invalid payload'], Response::HTTP_BAD_REQUEST);
        }

        // Idempotência
        $idempotencyKey = 'asaas.' . $gatewayTransactionId . '.' . $eventType;
        if (WebhookEvent::where('idempotency_key', $idempotencyKey)->exists()) {
            Log::debug('CheckoutWebhookController: já processado', ['key' => $idempotencyKey]);
            return response()->json(['message' => 'Already processed']);
        }

        // Lock distribuído
        $lockKey = 'webhook_lock.' . $gatewayTransactionId;
        if (! Cache::lock($lockKey, self::LOCK_TIMEOUT)->get()) {
            Log::warning('CheckoutWebhookController: lock ativo', [
                'gateway_transaction_id' => $gatewayTransactionId,
            ]);
            return response()->json(['message' => 'Processing'], 409);
        }

        try {
            $transaction = Transaction::where('gateway_transaction_id', $gatewayTransactionId)
                ->whereHas('integration', fn ($q) => $q->where('id', $integration->id))
                ->first();

            if (! $transaction) {
                Log::warning('CheckoutWebhookController: transação não encontrada', [
                    'gateway_transaction_id' => $gatewayTransactionId,
                ]);
                return response()->json(['message' => 'Transaction not found'], Response::HTTP_NOT_FOUND);
            }

            // [QA-03] NUNCA usa statusMap inline — usa PaymentStatusMapper
            $rawStatus = $payload['payment']['status'] ?? '';
            $newStatus = PaymentStatusMapper::mapStatus($rawStatus);
            $paidAt    = PaymentStatusMapper::isPaid($rawStatus) ? now() : null;

            if ($newStatus) {
                $transaction->update(['status' => $newStatus, 'paid_at' => $paidAt]);
                $transaction->payments()->update(['status' => $newStatus]);
            }

            WebhookEvent::create([
                'integration_id'  => $integration->id,
                'transaction_id'  => $transaction->id,
                'event_type'      => $eventType,
                'idempotency_key' => $idempotencyKey,
                'payload'         => $payload,
            ]);

            return response()->json(['message' => 'Processed']);
        } finally {
            Cache::lock($lockKey)->release();
        }
    }

    private function validateAsaasIp(Request $request): bool
    {
        $ip = $request->ip();
        foreach (self::ASAAS_IP_WHITELIST as $range) {
            if ($this->ipInRange($ip, $range)) return true;
        }
        return false;
    }

    private function ipInRange(string $ip, string $range): bool
    {
        if (! str_contains($range, '/')) {
            return $ip === $range;
        }
        [$subnet, $bits] = explode('/', $range);
        $ip     = ip2long($ip);
        $subnet = ip2long($subnet);
        $mask   = -1 << (32 - (int) $bits);
        return ($ip & $mask) === ($subnet & $mask);
    }

    private function resolveIntegrationBySignature(?string $signature): ?Integration
    {
        if (! $signature) return null;
        return Integration::where('webhook_secret', $signature)
            ->where('status', 'active')
            ->first();
    }
}
```
### Arquivo: app/Http/Controllers/Api/V1/VendasWebhookController.php
```php
<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class VendasWebhookController extends Controller
{
    /**
     * Handle incoming webhooks from Basileia Vendas.
     * Verified via X-Checkout-Signature and api.auth middleware.
     */
    public function handle(Request $request)
    {
        try {
            // The api.auth middleware might have already verified the ck_live_ key
            $integration = $request->get('integration');

            // Fallback: If middleware was bypassed (e.g. diagnostic routes), try manual lookup
            if (!$integration) {
                $apiKey = $request->header('X-API-Key') ?? $request->header('Authorization');
                if (str_starts_with($apiKey, 'Bearer ')) {
                    $apiKey = substr($apiKey, 7);
                }

                if ($apiKey) {
                    $integration = \App\Models\Integration::where('api_key_hash', hash('sha256', $apiKey))
                        ->where('status', 'active')
                        ->first();
                }
            }

            if (!$integration) {
                Log::warning('Vendas Webhook: Integration context not found', [
                    'headers' => $request->headers->all(),
                    'params' => $request->all(),
                ]);
                return response()->json(['error' => 'Integration context not found. Ensure X-API-Key is sent.'], 401);
            }

            $signature = $request->header('X-Checkout-Signature') ?? $request->header('X-Hub-Signature-256');
            if (str_starts_with($signature, 'sha256=')) {
                $signature = substr($signature, 7);
            }

            $secret = $integration->webhook_secret;

            if ($secret && $signature) {
                $rawBody = $request->getContent();
                $expectedSignature = hash_hmac('sha256', $rawBody, $secret);

                // FIXED: Use standardized JSON format for fallback check
                $jsonPayload = json_encode($request->all(), JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
                $expectedJsonSignature = hash_hmac('sha256', $jsonPayload, $secret);

                if (!hash_equals($expectedSignature, $signature) && !hash_equals($expectedJsonSignature, $signature)) {
                    Log::emergency('Vendas Webhook: Invalid signature', [
                        'integration_id' => $integration->id,
                        'received' => $signature,
                        'expected_raw' => $expectedSignature,
                        'expected_json' => $expectedJsonSignature,
                    ]);

                    return response()->json([
                        'error' => 'Invalid signature',
                    ], 401);
                }
            }

            // Process the payload
            $payload = $request->all();

            // Generate a secure, tokenized transaction record for this notification
            $transaction = \App\Models\Transaction::create([
                'uuid' => (string) \Illuminate\Support\Str::uuid(),
                'company_id' => $integration->company_id,
                'integration_id' => $integration->id,
                'asaas_payment_id' => $payload['asaas_payment_id'] ?? null,
                'source' => 'vendas_webhook',
                'amount' => $payload['valor'] ?? 0,
                'description' => $payload['plano'] ?? 'Pagamento Basiléia',
                'status' => 'pending',
                'customer_name' => $payload['cliente'] ?? '',
                'customer_email' => $payload['email'] ?? '',
                'customer_document' => $payload['documento'] ?? '',
                'customer_phone' => $payload['whatsapp'] ?? '',
            ]);

            Log::info('Vendas Webhook received and tokenized', [
                'integration_id' => $integration->id,
                'transaction_uuid' => $transaction->uuid,
                'event' => $payload['event'] ?? 'unknown'
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Notification received and link tokenized',
                'checkout_url' => route('checkout.show', $transaction->uuid),
                'short_url' => route('checkout.short', $transaction->asaas_payment_id ?? 'none')
            ]);

        } catch (\Exception $e) {
            Log::error('Vendas Webhook Exception: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'Internal Server Error'
            ], 500);
        }
    }
}
```
### Arquivo: app/Http/Controllers/Api/V1/AuthController.php
```php
<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Credenciais inválidas.'],
            ]);
        }

        if (isset($user->status) && $user->status !== 'active') {
             throw ValidationException::withMessages([
                'email' => ['Esta conta está inativa.'],
            ]);
        }

        if (isset($user->locked_until) && $user->locked_until && now()->lessThan($user->locked_until)) {
            throw ValidationException::withMessages([
                'email' => ['Conta temporariamente bloqueada.'],
            ]);
        }

        $token = $user->createToken('api-token')->plainTextToken;

        return response()->json([
            'user' => $user->only(['id', 'name', 'email', 'role', 'company_id']),
            'token' => $token,
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logout realizado.']);
    }

    public function refresh(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        $token = $request->user()->createToken('api-token')->plainTextToken;

        return response()->json(['token' => $token]);
    }
}
```
### Arquivo: app/Http/Controllers/Api/V1/ReportController.php
```php
<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class ReportController extends Controller
{
    public function summary(Request $request)
    {
        $request->validate([
            'date_from' => 'sometimes|date',
            'date_to' => 'sometimes|date|after_or_equal:date_from',
        ]);

        $integration = $request->attributes->get('integration');

        $query = Transaction::where('integration_id', $integration->id);

        if ($request->filled('date_from')) {
            $query->where('created_at', '>=', $request->input('date_from'));
        }

        if ($request->filled('date_to')) {
            $query->where('created_at', '<=', $request->input('date_to') . ' 23:59:59');
        }

        $total = $query->count();
        $approved = (clone $query)->where('status', 'approved')->count();
        $refused = (clone $query)->where('status', 'refused')->count();
        $cancelled = (clone $query)->where('status', 'cancelled')->count();
        $pending = (clone $query)->where('status', 'pending')->count();

        $totalAmount = (clone $query)->sum('amount');
        $approvedAmount = (clone $query)->where('status', 'approved')->sum('amount');

        $approvalRate = $total > 0 ? round(($approved / $total) * 100, 2) : 0;

        return response()->json([
            'summary' => [
                'total_transactions' => $total,
                'approved_transactions' => $approved,
                'refused_transactions' => $refused,
                'cancelled_transactions' => $cancelled,
                'pending_transactions' => $pending,
                'total_amount' => (float) $totalAmount,
                'approved_amount' => (float) $approvedAmount,
                'approval_rate' => $approvalRate,
            ],
        ]);
    }

    public function transactions(Request $request)
    {
        $request->validate([
            'date_from' => 'sometimes|date',
            'date_to' => 'sometimes|date|after_or_equal:date_from',
            'status' => 'sometimes|in:pending,approved,refused,cancelled,refunded',
            'payment_method' => 'sometimes|in:pix,boleto,credit_card,debit_card',
            'per_page' => 'sometimes|integer|min:1|max:500',
        ]);

        $integration = $request->attributes->get('integration');

        $query = Transaction::where('integration_id', $integration->id)
            ->with(['customer', 'payments']);

        if ($request->filled('date_from')) {
            $query->where('created_at', '>=', $request->input('date_from'));
        }

        if ($request->filled('date_to')) {
            $query->where('created_at', '<=', $request->input('date_to') . ' 23:59:59');
        }

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->filled('payment_method')) {
            $query->where('payment_method', $request->input('payment_method'));
        }

        $transactions = $query->orderBy('created_at', 'desc')
            ->paginate($request->input('per_page', 15));

        return response()->json($transactions);
    }
}
```
### Arquivo: app/Http/Controllers/Api/V1/SubscriptionController.php
```php
<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Subscription;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class SubscriptionController extends Controller
{
    public function index(Request $request)
    {
        $request->validate([
            'status' => 'sometimes|in:active,paused,cancelled',
            'per_page' => 'sometimes|integer|min:1|max:100',
        ]);

        $integration = $request->attributes->get('integration');

        $query = Subscription::where('integration_id', $integration->id)
            ->with(['customer', 'plan']);

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        $subscriptions = $query->orderBy('created_at', 'desc')
            ->paginate($request->input('per_page', 15));

        return response()->json($subscriptions);
    }

    public function store(Request $request, \App\Services\Gateway\AsaasGateway $asaas)
    {
        // 1. Diagnostic Log: Understand exactly what the Vendor is sending
        \Illuminate\Support\Facades\Log::info("Checkout: Subscription Request Ingested", [
            'payload_keys' => array_keys($request->all()),
            'integration_id' => $integration->id ?? null,
        ]);

        // 2. Smart Request Mapping: Support synonyms from Vendor
        $data = $request->all();

        // Map Amount/Value
        if (!isset($data['amount']) && isset($data['value']))
            $data['amount'] = $data['value'];
        if (!isset($data['amount']) && isset($data['valor']))
            $data['amount'] = $data['valor'];

        // Map Plan Name
        if (!isset($data['plan_name']) && isset($data['description']))
            $data['plan_name'] = $data['description'];
        if (!isset($data['plan_name']) && isset($data['plano']))
            $data['plan_name'] = $data['plano'];
        if (!isset($data['plan_name']))
            $data['plan_name'] = 'Assinatura Basileia'; // Default

        // Map Customer (Documento / CPF / CNPJ)
        if (isset($data['customer']) && is_array($data['customer'])) {
            if (!isset($data['customer']['document']) && isset($data['customer']['documento']))
                $data['customer']['document'] = $data['customer']['documento'];
            if (!isset($data['customer']['document']) && isset($data['customer']['cpf_cnpj']))
                $data['customer']['document'] = $data['customer']['cpf_cnpj'];
            if (!isset($data['customer']['document']) && isset($data['customer']['cpf']))
                $data['customer']['document'] = $data['customer']['cpf'];
        }

        // Map Billing Cycle (Frequencia / Ciclo)
        if (!isset($data['billing_cycle']) && isset($data['frequencia']))
            $data['billing_cycle'] = $data['frequencia'];
        if (!isset($data['billing_cycle']) && isset($data['ciclo']))
            $data['billing_cycle'] = $data['ciclo'];
        if (!isset($data['billing_cycle']))
            $data['billing_cycle'] = 'monthly'; // Default

        // 3. Robust Validation
        $validator = \Illuminate\Support\Facades\Validator::make($data, [
            'customer' => 'required|array',
            'customer.name' => 'required|string',
            'customer.email' => 'required|email',
            'customer.document' => 'required|string',
            'customer.phone' => 'sometimes|string',
            'customer.address' => 'sometimes|array',
            'plan_name' => 'required|string',
            'amount' => 'required|numeric',
            'billing_cycle' => 'sometimes|string',
            'payment_method' => 'sometimes|in:credit_card,pix,boleto',
            'callback_url' => 'sometimes|url',
            'metadata' => 'sometimes|array',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => 'Validation Failed',
                'details' => $validator->errors(),
                'received' => $request->all()
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $integration = $request->attributes->get('integration');

        try {
            // 4. Create/Find local Customer
            $customerData = [
                'name' => $data['customer']['name'],
                'document' => preg_replace('/\D/', '', $data['customer']['document']),
                'phone' => $data['customer']['phone'] ?? null,
                'address' => $data['customer']['address'] ?? null,
            ];

            $customer = \App\Models\Customer::updateOrCreate(
                ['email' => $data['customer']['email'], 'company_id' => $integration->company_id],
                $customerData
            );

            // 5. Create/Find Customer in Asaas (With full profile for Invoicing)
            $address = $data['customer']['address'] ?? [];
            $asaasCustomer = $asaas->createCustomer([
                'name' => $data['customer']['name'],
                'email' => $data['customer']['email'],
                'document' => $data['customer']['document'],
                'phone' => $data['customer']['phone'] ?? null,
                'address' => $address['street'] ?? null,
                'address_number' => $address['number'] ?? null,
                'neighborhood' => $address['neighborhood'] ?? null,
                'city' => $address['city'] ?? null,
                'state' => $address['state'] ?? null,
                'zip_code' => $address['postalCode'] ?? null,
                'external_reference' => 'customer_' . $customer->id,
            ]);

            // 6. Map Asaas Cycle (yearly -> ANNUAL)
            $cycle = strtoupper($data['billing_cycle']);
            if ($cycle === 'YEARLY' || $cycle === 'ANUAL')
                $cycle = 'ANNUAL';
            if ($cycle === 'MONTHLY' || $cycle === 'MENSAL')
                $cycle = 'MONTHLY';

            // 7. Create Subscription in Asaas
            $asaasSubscription = $asaas->createSubscription([
                'customer' => $asaasCustomer['id'],
                'billing_type' => strtoupper($data['payment_method'] ?? 'credit_card'),
                'value' => $data['amount'],
                'next_due_date' => now()->addDays(3)->format('Y-m-d'),
                'cycle' => $cycle,
                'description' => $data['plan_name'],
                'externalReference' => 'sub_' . time(),
            ]);

            // 8. Save local subscription
            $subscription = Subscription::create([
                'uuid' => \Illuminate\Support\Str::uuid(),
                'integration_id' => $integration->id,
                'company_id' => $integration->company_id,
                'customer_id' => $customer->id,
                'plan_name' => $data['plan_name'],
                'amount' => $data['amount'],
                'billing_cycle' => strtolower($data['billing_cycle']),
                'gateway_subscription_id' => $asaasSubscription['id'],
                'callback_url' => $data['callback_url'] ?? null,
                'metadata' => $data['metadata'] ?? [],
                'status' => 'active',
            ]);

            $result = [
                'uuid' => $subscription->uuid,
                'payment_url' => $subscription->payment_url,
            ];

            return response()->json([
                'subscription' => $result,
                'transaction' => $result, // Alias for Vendor compatibility
                'message' => 'Subscription created successfully. Link generated.'
            ], Response::HTTP_CREATED);

        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error("Subscription store error: " . $e->getMessage());
            return response()->json([
                'error' => 'Gateway error: ' . $e->getMessage(),
                'status' => 'failed'
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }
    }

    public function show(Request $request, int $id)
    {
        $integration = $request->attributes->get('integration');

        $subscription = Subscription::where('integration_id', $integration->id)
            ->with(['customer', 'plan', 'transactions'])
            ->find($id);

        if (!$subscription) {
            return response()->json(['message' => 'Assinatura não encontrada.'], Response::HTTP_NOT_FOUND);
        }

        return response()->json(['subscription' => $subscription]);
    }

    public function pause(Request $request, int $id)
    {
        $integration = $request->attributes->get('integration');

        $subscription = Subscription::where('integration_id', $integration->id)->find($id);

        if (!$subscription) {
            return response()->json(['message' => 'Assinatura não encontrada.'], Response::HTTP_NOT_FOUND);
        }

        $subscription->update(['status' => 'paused']);

        return response()->json([
            'subscription' => $subscription,
            'message' => 'Assinatura pausada com sucesso.',
        ]);
    }

    public function resume(Request $request, int $id)
    {
        $integration = $request->attributes->get('integration');

        $subscription = Subscription::where('integration_id', $integration->id)->find($id);

        if (!$subscription) {
            return response()->json(['message' => 'Assinatura não encontrada.'], Response::HTTP_NOT_FOUND);
        }

        $subscription->update(['status' => 'active']);

        return response()->json([
            'subscription' => $subscription,
            'message' => 'Assinatura reativada com sucesso.',
        ]);
    }

    public function destroy(Request $request, int $id)
    {
        $integration = $request->attributes->get('integration');

        $subscription = Subscription::where('integration_id', $integration->id)->find($id);

        if (!$subscription) {
            return response()->json(['message' => 'Assinatura não encontrada.'], Response::HTTP_NOT_FOUND);
        }

        $subscription->update(['status' => 'cancelled']);

        return response()->json([
            'subscription' => $subscription,
            'message' => 'Assinatura cancelada com sucesso.',
        ]);
    }
}
```
### Arquivo: app/Http/Controllers/Api/V1/WebhookController.php
```php
<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Helpers\PaymentStatusMapper;
use App\Http\Controllers\Controller;
use App\Models\Integration;
use App\Models\Transaction;
use App\Models\WebhookEvent;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

/**
 * Recebe webhooks do Asaas (IP whitelist + asaas-access-token).
 *
 * [QA-03] statusMap inline removido — usa PaymentStatusMapper::mapStatus()
 *         e PaymentStatusMapper::isPaid() como fonte única de verdade.
 */
class WebhookController extends Controller
{
    private const LOCK_TIMEOUT = 300;

    private function getAsaasIpWhitelist(): array
    {
        $configured = config('services.asaas.webhook_ip_whitelist');
        if ($configured) {
            return array_map('trim', explode(',', $configured));
        }
        // IPs oficiais do Asaas — configure via ASAAS_WEBHOOK_IP_WHITELIST no .env
        return ['13.90.0.0/16', '13.91.0.0/16'];
    }

    public function asaas(Request $request): JsonResponse
    {
        if (! $this->validateAsaasIp($request)) {
            Log::warning('Api\V1\WebhookController: IP não autorizado', [
                'ip'      => $request->ip(),
                'payload' => $request->all(),
            ]);
            return response()->json(['message' => 'Forbidden'], Response::HTTP_FORBIDDEN);
        }

        $payload   = $request->all();
        $signature = $request->header('asaas-access-token');

        $integration = $this->resolveIntegrationBySignature($signature);
        if (! $integration) {
            Log::warning('Api\V1\WebhookController: assinatura inválida', ['ip' => $request->ip()]);
            return response()->json(['message' => 'Unauthorized'], Response::HTTP_UNAUTHORIZED);
        }

        $gatewayTransactionId = $payload['payment']['id'] ?? $payload['paymentId'] ?? null;
        $eventType            = $payload['event']         ?? $payload['notificationType'] ?? null;

        if (! $gatewayTransactionId || ! $eventType) {
            return response()->json(['message' => 'Invalid payload'], Response::HTTP_BAD_REQUEST);
        }

        // Idempotência
        $idempotencyKey = 'asaas.' . $gatewayTransactionId . '.' . $eventType;
        if (WebhookEvent::where('idempotency_key', $idempotencyKey)->exists()) {
            Log::debug('Api\V1\WebhookController: webhook já processado', ['key' => $idempotencyKey]);
            return response()->json(['message' => 'Already processed']);
        }

        // Lock distribuído
        $lockKey = 'webhook_lock.' . $gatewayTransactionId;
        if (! Cache::lock($lockKey, self::LOCK_TIMEOUT)->get()) {
            Log::warning('Api\V1\WebhookController: processamento bloqueado (lock)', [
                'gateway_transaction_id' => $gatewayTransactionId,
            ]);
            return response()->json(['message' => 'Processing'], 409);
        }

        try {
            $transaction = Transaction::where('gateway_transaction_id', $gatewayTransactionId)
                ->whereHas('integration', fn ($q) => $q->where('id', $integration->id))
                ->first();

            if (! $transaction) {
                Log::warning('Api\V1\WebhookController: transação não encontrada', [
                    'gateway_transaction_id' => $gatewayTransactionId,
                ]);
                return response()->json(['message' => 'Transaction not found'], Response::HTTP_NOT_FOUND);
            }

            // [QA-03] Usa PaymentStatusMapper — NUNCA statusMap inline
            $rawStatus = $payload['payment']['status'] ?? '';
            $newStatus = PaymentStatusMapper::mapStatus($rawStatus);
            $paidAt    = PaymentStatusMapper::isPaid($rawStatus) ? now() : null;

            if ($newStatus && $transaction->status !== $newStatus) {
                $transaction->update(['status' => $newStatus, 'paid_at' => $paidAt]);
                $transaction->payments()->update(['status' => $newStatus]);

                Log::info('Api\V1\WebhookController: status atualizado', [
                    'gateway_transaction_id' => $gatewayTransactionId,
                    'event'                  => $eventType,
                    'new_status'             => $newStatus,
                ]);
            }

            WebhookEvent::create([
                'integration_id'  => $integration->id,
                'transaction_id'  => $transaction->id,
                'event_type'      => $eventType,
                'idempotency_key' => $idempotencyKey,
                'payload'         => $payload,
            ]);

            $this->dispatchCheckoutWebhook($transaction, $eventType);

            return response()->json(['message' => 'Processed']);
        } finally {
            Cache::lock($lockKey)->release();
        }
    }

    public function stripe(Request $request): JsonResponse
    {
        Log::info('Api\V1\WebhookController: Stripe webhook recebido', [
            'event_type' => $request->input('type', 'unknown'),
        ]);
        return response()->json(['message' => 'Received']);
    }

    public function pagseguro(Request $request): JsonResponse
    {
        Log::info('Api\V1\WebhookController: PagSeguro webhook recebido', [
            'event_type' => $request->input('notificationType', 'unknown'),
        ]);
        return response()->json(['message' => 'Received']);
    }

    private function dispatchCheckoutWebhook(Transaction $transaction, string $eventType): void
    {
        $integration = $transaction->integration;
        if (! $integration || ! $integration->webhook_url) {
            return;
        }

        // [QA-03] Usa PaymentStatusMapper para mapear para evento semântico
        $checkoutEvent = PaymentStatusMapper::mapToWebhookEvent($transaction->status);

        $webhookPayload = array_filter([
            'event'       => $checkoutEvent,
            'transaction' => array_filter([
                'uuid'        => $transaction->uuid,
                'external_id' => $transaction->external_id,
                'status'      => $transaction->status,
                'gateway_id'  => $transaction->gateway_transaction_id,
            ], fn ($v) => ! is_null($v)),
            'timestamp'   => now()->toIso8601String(),
        ]);

        $jsonPayload = json_encode($webhookPayload, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
        $secret      = $integration->webhook_secret;
        $signature   = $secret ? hash_hmac('sha256', $jsonPayload, $secret) : null;

        $headers = ['Content-Type' => 'application/json', 'User-Agent' => 'Checkout/1.0'];
        if ($signature) {
            $headers['X-Checkout-Signature']  = $signature;
            $headers['X-Hub-Signature-256']   = 'sha256=' . $signature;
        }

        try {
            $response = \Illuminate\Support\Facades\Http::timeout(30)
                ->withHeaders($headers)
                ->withBody($jsonPayload, 'application/json')
                ->post($integration->webhook_url);

            if ($response->successful()) {
                Log::info('Api\V1\WebhookController: webhook enviado', [
                    'transaction_id' => $transaction->id,
                    'event'          => $checkoutEvent,
                ]);
            } else {
                Log::error('Api\V1\WebhookController: webhook falhou', [
                    'transaction_id' => $transaction->id,
                    'status'         => $response->status(),
                ]);
            }
        } catch (\Throwable $e) {
            Log::error('Api\V1\WebhookController: exceção ao enviar webhook', [
                'transaction_id' => $transaction->id,
                'error'          => $e->getMessage(),
            ]);
        }
    }

    private function validateAsaasIp(Request $request): bool
    {
        $ip = $request->ip();
        foreach ($this->getAsaasIpWhitelist() as $range) {
            if ($this->ipInRange($ip, $range)) return true;
        }
        return false;
    }

    private function ipInRange(string $ip, string $range): bool
    {
        if (! str_contains($range, '/')) {
            return $ip === $range;
        }
        [$subnet, $bits] = explode('/', $range);
        $ip     = ip2long($ip);
        $subnet = ip2long($subnet);
        $mask   = -1 << (32 - (int) $bits);
        return ($ip & $mask) === ($subnet & $mask);
    }

    private function resolveIntegrationBySignature(?string $signature): ?Integration
    {
        if (! $signature) return null;
        return Integration::where('webhook_secret', $signature)
            ->where('status', 'active')
            ->first();
    }
}
```
### Arquivo: app/Http/Controllers/Api/V1/TransactionController.php
```php
<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\TransactionService;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class TransactionController extends Controller
{
    public function __construct(private TransactionService $transactionService)
    {
    }

    public function index(Request $request)
    {
        $request->validate([
            'status' => 'sometimes|in:pending,approved,refused,cancelled,refunded',
            'date_from' => 'sometimes|date',
            'date_to' => 'sometimes|date|after_or_equal:date_from',
            'integration_id' => 'sometimes|integer|exists:integrations,id',
            'per_page' => 'sometimes|integer|min:1|max:100',
        ]);

        $integration = $request->attributes->get('integration');

        $filters = $request->only(['status', 'date_from', 'date_to', 'integration_id']);
        $filters['integration_id'] = $filters['integration_id'] ?? $integration->id;

        $transactions = $this->transactionService->listPaginated(
            $filters,
            $request->input('per_page', 15)
        );

        return response()->json($transactions);
    }

    public function store(Request $request)
    {
        $request->validate([
            'amount' => 'required|numeric|min:1',
            'customer' => 'required|array',
            'customer.name' => 'required|string|max:255',
            'customer.email' => 'required|email',
            'customer.document' => 'required|string|max:20',
            'customer.phone' => 'sometimes|string|max:20',
            'payment_method' => 'sometimes|in:pix,boleto,credit_card,debit_card',
            'installments' => 'sometimes|integer|min:1|max:12',
            'items' => 'sometimes|array',
            'items.*.description' => 'required_with:items|string|max:255',
            'items.*.quantity' => 'required_with:items|integer|min:1',
            'items.*.unit_price' => 'required_with:items|numeric|min:0',
            'metadata' => 'sometimes|array',
            'callback_url' => 'sometimes|url',
            'expires_in' => 'sometimes|integer|min:1|max:720',
        ]);

        $integration = $request->attributes->get('integration');

        $validated = $request->validated();

        $transaction = $this->transactionService->create(
            $validated,
            $integration
        );

        return response()->json([
            'transaction' => [
                'uuid' => $transaction->uuid,
                'payment_url' => $transaction->payment_url,
            ],
        ], Response::HTTP_CREATED);
    }

    public function show(Request $request, string $uuid)
    {
        $integration = $request->attributes->get('integration');

        $transaction = $this->transactionService->findByUuid($uuid, $integration);

        if (!$transaction) {
            return response()->json(['message' => 'Transação não encontrada.'], Response::HTTP_NOT_FOUND);
        }

        return response()->json([
            'transaction' => $transaction->load(['payments', 'items', 'customer', 'fraudAnalysis']),
        ]);
    }

    public function cancel(Request $request, string $uuid)
    {
        $integration = $request->attributes->get('integration');

        $transaction = $this->transactionService->cancel($uuid, $integration);

        if (!$transaction) {
            return response()->json(['message' => 'Transação não encontrada.'], Response::HTTP_NOT_FOUND);
        }

        return response()->json([
            'transaction' => $transaction,
            'message' => 'Transação cancelada com sucesso.',
        ]);
    }

    public function refund(Request $request, string $uuid)
    {
        $request->validate([
            'amount' => 'sometimes|numeric|min:1',
        ]);

        $integration = $request->attributes->get('integration');

        $transaction = $this->transactionService->refund(
            $uuid,
            $integration,
            $request->input('amount')
        );

        if (!$transaction) {
            return response()->json(['message' => 'Transação não encontrada.'], Response::HTTP_NOT_FOUND);
        }

        return response()->json([
            'transaction' => $transaction,
            'message' => 'Estorno realizado com sucesso.',
        ]);
    }
}
```
### Arquivo: app/Http/Controllers/Api/V1/CustomerController.php
```php
<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\CustomerService;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class CustomerController extends Controller
{
    public function __construct(private CustomerService $customerService)
    {
    }

    public function index(Request $request)
    {
        $request->validate([
            'search' => 'sometimes|string|max:255',
            'per_page' => 'sometimes|integer|min:1|max:100',
        ]);

        $integration = $request->attributes->get('integration');

        $customers = $this->customerService->listPaginated(
            $integration,
            $request->input('search'),
            $request->input('per_page', 15)
        );

        return response()->json($customers);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'document' => 'required|string|max:20',
            'phone' => 'sometimes|string|max:20',
            'address' => 'sometimes|array',
            'address.zipcode' => 'required_with:address|string|max:10',
            'address.street' => 'required_with:address|string|max:255',
            'address.number' => 'required_with:address|string|max:20',
            'address.complement' => 'sometimes|string|max:255',
            'address.neighborhood' => 'required_with:address|string|max:255',
            'address.city' => 'required_with:address|string|max:255',
            'address.state' => 'required_with:address|string|max:2',
        ]);

        $integration = $request->attributes->get('integration');

        $customer = $this->customerService->create($request->validated(), $integration);

        return response()->json([
            'customer' => $customer,
        ], Response::HTTP_CREATED);
    }

    public function show(Request $request, int $id)
    {
        $integration = $request->attributes->get('integration');

        $customer = $this->customerService->findById($id, $integration);

        if (!$customer) {
            return response()->json(['message' => 'Cliente não encontrado.'], Response::HTTP_NOT_FOUND);
        }

        return response()->json([
            'customer' => $customer->load('transactions'),
        ]);
    }

    public function update(Request $request, int $id)
    {
        $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|max:255',
            'document' => 'sometimes|string|max:20',
            'phone' => 'sometimes|string|max:20',
            'address' => 'sometimes|array',
        ]);

        $integration = $request->attributes->get('integration');

        $customer = $this->customerService->update($id, $request->validated(), $integration);

        if (!$customer) {
            return response()->json(['message' => 'Cliente não encontrado.'], Response::HTTP_NOT_FOUND);
        }

        return response()->json([
            'customer' => $customer,
        ]);
    }
}
```
### Arquivo: app/Http/Controllers/Api/V1/PaymentController.php
```php
<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\PaymentService;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class PaymentController extends Controller
{
    public function __construct(private PaymentService $paymentService)
    {
    }

    public function process(Request $request)
    {
        $request->validate([
            'transaction_uuid' => 'required|string|exists:transactions,uuid',
            'payment_method' => 'required|in:pix,boleto,credit_card,debit_card',
            'card' => 'required_if:payment_method,credit_card,debit_card|array',
            'card.number' => 'required_if:payment_method,credit_card,debit_card|string',
            'card.holder_name' => 'required_if:payment_method,credit_card,debit_card|string|max:255',
            'card.expiry_month' => 'required_if:payment_method,credit_card,debit_card|integer|min:1|max:12',
            'card.expiry_year' => 'required_if:payment_method,credit_card,debit_card|integer|min:' . date('Y'),
            'card.cvv' => 'required_if:payment_method,credit_card,debit_card|string|min:3|max:4',
            'card.installments' => 'sometimes|integer|min:1|max:12',
        ]);

        $integration = $request->attributes->get('integration');

        $payment = $this->paymentService->process($request->validated(), $integration);

        return response()->json([
            'payment' => $payment,
        ], Response::HTTP_CREATED);
    }

    public function status(Request $request, string $uuid)
    {
        $integration = $request->attributes->get('integration');

        $payment = $this->paymentService->findByUuid($uuid, $integration);

        if (!$payment) {
            return response()->json(['message' => 'Pagamento não encontrado.'], Response::HTTP_NOT_FOUND);
        }

        return response()->json(['payment' => $payment]);
    }

    public function pix(Request $request, string $uuid)
    {
        $integration = $request->attributes->get('integration');

        $pixData = $this->paymentService->getPixData($uuid, $integration);

        if (!$pixData) {
            return response()->json(['message' => 'Dados PIX não encontrados.'], Response::HTTP_NOT_FOUND);
        }

        return response()->json(['pix' => $pixData]);
    }

    public function boleto(Request $request, string $uuid)
    {
        $integration = $request->attributes->get('integration');

        $boletoData = $this->paymentService->getBoletoData($uuid, $integration);

        if (!$boletoData) {
            return response()->json(['message' => 'Dados do boleto não encontrados.'], Response::HTTP_NOT_FOUND);
        }

        return response()->json(['boleto' => $boletoData]);
    }
}
```
### Arquivo: app/Http/Controllers/Api/PaymentApiController.php
```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Integration;
use App\Models\Transaction;
use App\Services\Gateway\GatewayResolver;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class PaymentApiController extends Controller
{
    public function receive(Request $request)
    {
        $apiKey = $request->header('Authorization');
        if (!$apiKey) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $apiKey = str_replace('Bearer ', '', $apiKey);
        $integration = Integration::where('api_key_hash', hash('sha256', $apiKey))->first();

        if (!$integration) {
            return response()->json(['error' => 'Invalid API Key'], 403);
        }

        $request->validate([
            'asaas_id' => 'required|string',
            'callback_url' => 'sometimes|url',
            'metadata' => 'sometimes|array',
        ]);

        try {
            $asaas = GatewayResolver::resolveGateway('asaas');

            // Fetch payment details from Asaas to sync local data
            $asaasData = $asaas->getPayment($request->input('asaas_id'));

            if (isset($asaasData['error']) && $asaasData['error'] === 'Gateway not configured') {
                return response()->json(['error' => 'Gateway not configured. Please configure ASAAS_API_KEY.'], 503);
            }

            $transaction = Transaction::create([
                'uuid' => (string) Str::uuid(),
                'company_id' => $integration->company_id,
                'integration_id' => $integration->id,
                'asaas_payment_id' => $request->input('asaas_id'),
                'asaas_customer_id' => $asaasData['customer'] ?? null,
                'amount' => $asaasData['value'],
                'currency' => 'BRL',
                'status' => 'pending',
                'callback_url' => $request->input('callback_url') ?? $integration->webhook_url,
                'metadata' => $request->input('metadata') ?? [],
                'customer_name' => $asaasData['customer_name'] ?? null, // Will fetch full customer details if needed
                'customer_email' => $asaasData['customer_email'] ?? null,
            ]);

            return response()->json([
                'status' => 'success',
                'checkout_url' => config('app.url') . '/pay/' . $transaction->uuid,
                'transaction_uuid' => $transaction->uuid,
            ]);

        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 400);
        }
    }
}
```
### Arquivo: app/Http/Controllers/AsaasWebhookController.php
```php
<?php

namespace App\Http\Controllers;

use App\Models\Subscription;
use App\Models\Transaction;
use App\Models\WebhookEvent;
use App\Services\WebhookNotifierService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class AsaasWebhookController extends Controller
{
    private const LOCK_TIMEOUT = 300;

    public function __construct(
        private WebhookNotifierService $webhookNotifier,
    ) {
    }

    public function handle(Request $request)
    {
        $event = $request->input('event');
        $data = $request->input('payment') ?? $request->input('subscription');

        if (!$event || !$data) {
            Log::warning('AsaasWebhook: Missing data in payload', ['payload_keys' => array_keys($request->all())]);
            return response()->json(['error' => 'Invalid payload'], 400);
        }

        $paymentId = $data['id'] ?? null;

        Log::info('AsaasWebhook: Event received', [
            'event' => $event,
            'id' => $paymentId,
        ]);

        // Search in both Transactions and Subscriptions
        $transaction = Transaction::where('asaas_payment_id', $paymentId)->first()
            ?? Transaction::where('gateway_transaction_id', $paymentId)->first()
            ?? Subscription::where('gateway_subscription_id', $paymentId)->first();

        // --- Per-Gateway Token Validation ---
        // Even if transaction not found, we should try to validate with a global token if available
        $gateway = $transaction?->gateway;
        $expectedToken = $gateway ? $gateway->getConfig('webhook_token') : config('services.asaas.webhook_token');
        $receivedToken = $request->header('asaas-access-token');

        if ($expectedToken && $receivedToken !== $expectedToken) {
            Log::warning('AsaasWebhook: Invalid token', [
                'gateway_id' => $gateway->id ?? 'global',
                'payment_id' => $paymentId
            ]);
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        if (!$transaction) {
            Log::warning('AsaasWebhook: Resource not found locally', [
                'asaas_id' => $paymentId,
            ]);
            return response()->json(['ok' => true]);
        }

        // --- Idempotency check: skip if already processed ---
        $idempotencyKey = 'asaas_webhook:' . $paymentId . ':' . $event;
        if (WebhookEvent::where('idempotency_key', $idempotencyKey)->exists()) {
            Log::debug('AsaasWebhook: Already processed', ['idempotency_key' => $idempotencyKey]);
            return response()->json(['ok' => true, 'status' => 'already_processed']);
        }

        // Distributed lock to prevent concurrent processing
        $lock = Cache::lock('webhook:asaas:' . $paymentId, self::LOCK_TIMEOUT);
        if (!$lock->get()) {
            Log::warning('AsaasWebhook: Already processing', ['payment_id' => $paymentId]);
            return response()->json(['ok' => true, 'status' => 'processing'], 409);
        }

        try {
            $status = match ($data['status'] ?? '') {
                'RECEIVED', 'CONFIRMED', 'RECEIVED_IN_CASH' => 'approved',
                'PENDING', 'AWAITING_RISK_ANALYSIS' => 'pending',
                'OVERDUE' => 'overdue',
                'CANCELED', 'DELETED' => 'cancelled',
                'REFUNDED', 'REFUND_REQUESTED' => 'refunded',
                'CHARGEBACK', 'CHARGEBACK_REQUESTED', 'CHARGEBACK_DISPUTE' => 'chargeback',
                default => 'unknown',
            };

            $transaction->update([
                'status' => $status,
                'paid_at' => in_array($data['status'] ?? '', ['RECEIVED', 'CONFIRMED', 'RECEIVED_IN_CASH']) ? now() : ($transaction->paid_at),
            ]);

            // Register idempotency record
            WebhookEvent::create([
                'company_id' => $transaction->company_id,
                'transaction_id' => $transaction->id,
                'event_type' => $event,
                'idempotency_key' => $idempotencyKey,
                'payload' => $data,
            ]);

            $this->webhookNotifier->notify($transaction);

            return response()->json(['ok' => true]);
        } finally {
            $lock->release();
        }
    }
}
```
### Arquivo: routes/dashboard.php
```php
<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Dashboard\AuthController;
use App\Http\Controllers\Dashboard\CheckoutConfigController;
use App\Http\Controllers\Dashboard\CompanyController;
use App\Http\Controllers\Dashboard\DashboardController;
use App\Http\Controllers\Dashboard\EventController;
use App\Http\Controllers\Dashboard\GatewayController;
use App\Http\Controllers\Dashboard\IntegrationController;
use App\Http\Controllers\Dashboard\LabController;
use App\Http\Controllers\Dashboard\PasswordController;
use App\Http\Controllers\Dashboard\ProfileController;
use App\Http\Controllers\Dashboard\ReceiptController;
use App\Http\Controllers\Dashboard\ReportController;
use App\Http\Controllers\Dashboard\SourceConfigController;
use App\Http\Controllers\Dashboard\TransactionDashboardController;
use App\Http\Controllers\Dashboard\WebhookLogController;

/*
|--------------------------------------------------------------------------
| Dashboard Routes
|--------------------------------------------------------------------------
| Todas as rotas do painel administrativo (auth, dashboard, gateways, etc).
| Extraídas do web.php para isolamento modular.
|--------------------------------------------------------------------------
*/

// ── Auth ────────────────────────────────────────────────────────────────
Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
Route::post('/login', [AuthController::class, 'login'])->name('login.post');
Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

// ── Password ────────────────────────────────────────────────────────────
Route::get('/password/change', [PasswordController::class, 'showChangeForm'])->name('password.change')->middleware('auth');
Route::post('/password/change', [PasswordController::class, 'changePassword'])->middleware('auth');

// ── 2FA ─────────────────────────────────────────────────────────────────
Route::get('/profile/2fa/setup', [ProfileController::class, 'show2FASetup'])->name('profile.2fa.setup')->middleware('auth');
Route::post('/profile/2fa/enable', [ProfileController::class, 'enable2FA'])->name('profile.2fa.enable')->middleware('auth');
Route::get('/profile/2fa/verify', [ProfileController::class, 'show2FAVerify'])->name('profile.2fa.verify')->middleware('auth');
Route::post('/profile/2fa/verify', [ProfileController::class, 'verify2FA'])->name('profile.2fa.verify.post')->middleware('auth');
Route::get('/profile/2fa/disable', [ProfileController::class, 'show2FADisable'])->name('profile.2fa.disable')->middleware('auth');
Route::post('/profile/2fa/disable', [ProfileController::class, 'disable2FA'])->name('profile.2fa.disable.post')->middleware('auth');

// ── Dashboard (authenticated) ───────────────────────────────────────────
Route::prefix('/dashboard')->middleware(['auth', 'password.expiry'])->group(function () {
    Route::get('/', [DashboardController::class, 'index'])->name('dashboard.index');

    // Lab
    Route::get('/lab', [LabController::class, 'index'])->name('dashboard.lab');
    Route::post('/lab/checkout/new', [LabController::class, 'createAndEdit'])->name('dashboard.lab.checkout.create');

    // Tokenizer Tool
    Route::get('/tokenizer', [DashboardController::class, 'tokenizer'])->name('dashboard.tokenizer');
    Route::post('/tokenizer', [DashboardController::class, 'tokenize'])->name('dashboard.tokenizer.post');

    // Checkout Builder
    Route::get('/checkout-configs', [CheckoutConfigController::class, 'index'])->name('dashboard.checkout-configs');
    Route::get('/checkout-configs/create', [CheckoutConfigController::class, 'create'])->name('dashboard.checkout-configs.create');
    Route::get('/checkout-configs/{id}/edit', [CheckoutConfigController::class, 'edit'])->name('dashboard.checkout-configs.edit');
    Route::post('/checkout-configs/save', [CheckoutConfigController::class, 'save'])->name('dashboard.checkout-configs.save');
    Route::post('/checkout-configs/{id}/publish', [CheckoutConfigController::class, 'publish'])->name('dashboard.checkout-configs.publish');
    Route::get('/checkout-configs/{id}/preview', [CheckoutConfigController::class, 'preview'])->name('dashboard.checkout-configs.preview');

    // Transactions
    Route::get('/transactions', [TransactionDashboardController::class, 'index'])->name('dashboard.transactions');
    Route::get('/transactions/{id}', [TransactionDashboardController::class, 'show'])->name('dashboard.transactions.show');
    Route::get('/transactions-export', [TransactionDashboardController::class, 'export'])->name('dashboard.transactions.export');

    // Integrations
    Route::resource('integrations', IntegrationController::class)->names('dashboard.integrations');
    Route::post('/integrations/{id}/toggle', [IntegrationController::class, 'toggle'])->name('dashboard.integrations.toggle');
    Route::post('/integrations/{id}/regenerate-key', [IntegrationController::class, 'regenerateKey'])->name('dashboard.integrations.regenerate-key');

    // Webhook logs
    Route::get('/webhooks', [WebhookLogController::class, 'index'])->name('dashboard.webhooks');
    Route::get('/webhooks/{id}', [WebhookLogController::class, 'show'])->name('dashboard.webhooks.show');
    Route::post('/webhooks/{id}/retry', [WebhookLogController::class, 'retry'])->name('dashboard.webhooks.retry');

    // Gateways
    Route::resource('gateways', GatewayController::class)->names('dashboard.gateways');
    Route::post('/gateways/{id}/toggle', [GatewayController::class, 'toggle'])->name('dashboard.gateways.toggle');
    Route::post('/gateways/{id}/test', [GatewayController::class, 'test'])->name('dashboard.gateways.test');

    // Companies (super admin)
    Route::resource('companies', CompanyController::class)->names('dashboard.companies');
    Route::post('/companies/{id}/toggle', [CompanyController::class, 'toggle'])->name('dashboard.companies.toggle');

    // Reports
    Route::get('/reports', [ReportController::class, 'index'])->name('dashboard.reports');
    Route::get('/reports/summary', [ReportController::class, 'summary'])->name('dashboard.reports.summary');
    Route::get('/reports/export', [ReportController::class, 'export'])->name('dashboard.reports.export');

    // Configurações do Sistema
    Route::get('/settings/receipt', [ReceiptController::class, 'index'])->name('dashboard.settings.receipt');
    Route::put('/settings/receipt', [ReceiptController::class, 'update'])->name('dashboard.settings.receipt.update');

    // Events / Links
    Route::get('/events', [EventController::class, 'index'])->name('dashboard.events.index');
    Route::post('/events', [EventController::class, 'store'])->name('dashboard.events.store');
    Route::post('/events/{event}/toggle', [EventController::class, 'toggle'])->name('dashboard.events.toggle');
    Route::delete('/events/{event}', [EventController::class, 'destroy'])->name('dashboard.events.destroy');

    // Source Configs (Sistemas de Origem)
    Route::get('/sources', [SourceConfigController::class, 'index'])->name('dashboard.sources.index');
    Route::post('/sources', [SourceConfigController::class, 'store'])->name('dashboard.sources.store');
    Route::put('/sources/{source}', [SourceConfigController::class, 'update'])->name('dashboard.sources.update');
    Route::patch('/sources/{source}/toggle', [SourceConfigController::class, 'toggle'])->name('dashboard.sources.toggle');
    Route::delete('/sources/{source}', [SourceConfigController::class, 'destroy'])->name('dashboard.sources.destroy');
});
```
### Arquivo: routes/demo.php
```php
<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Artisan;
use App\Models\Company;
use App\Models\Customer;
use App\Models\Transaction;
use Illuminate\Support\Str;

/*
|--------------------------------------------------------------------------
| Demo & Debug Routes
|--------------------------------------------------------------------------
| Rotas de demonstração e depuração. Carregadas apenas em ambiente local.
|--------------------------------------------------------------------------
*/

if (!function_exists('crc16')) {
    function crc16(string $data): int
    {
        $crc = 0xFFFF;
        for ($i = 0; $i < strlen($data); $i++) {
            $crc ^= ord($data[$i]);
            for ($j = 0; $j < 8; $j++) {
                if (($crc & 0x0001) !== 0) {
                    $crc = ($crc >> 1) ^ 0x1021;
                } else {
                    $crc = $crc >> 1;
                }
            }
        }

        return $crc;
    }
}

// ── Debug Routes ────────────────────────────────────────────────────────
Route::get('/clear-views', function () {
    Artisan::call('view:clear');
    Artisan::call('optimize:clear');

    $path = resource_path('views/dashboard/gateways/create.blade.php');
    $content = file_exists($path) ? 'FILE EXISTS: ' . substr(file_get_contents($path), 0, 500) : 'FILE NOT FOUND';
    $git = shell_exec('git log -n 1 --oneline 2>&1');

    return [
        'message' => 'Cache limpo!',
        'git_status' => $git,
        'path' => $path,
        'first_500_chars' => $content,
    ];
});

Route::get('/test-db', function () {
    try {
        \DB::connection()->getPdo();
        return "Conexão com o Banco de Dados: OK!";
    } catch (\Exception $e) {
        return "Erro de Conexão: " . $e->getMessage();
    }
});

// ── Demo: Criar transações de teste ─────────────────────────────────────
Route::get('/demo-criar/{metodo}', function ($metodo) {
    $company = Company::first();
    if (!$company) {
        return response('Empresa não encontrada', 404);
    }

    $customer = Customer::firstOrCreate(
        ['email' => 'teste@demo.com'],
        [
            'name' => 'Cliente Teste Demo',
            'company_id' => $company->id,
            'phone' => '11999999999',
        ]
    );

    $uuid = (string) Str::uuid();
    $asaasId = 'pay_demo_' . time();

    $metodoMap = [
        'pix' => 'pix',
        'cartao' => 'credit_card',
        'boleto' => 'boleto',
    ];
    $paymentMethod = $metodoMap[$metodo] ?? 'credit_card';

    $tx = Transaction::create([
        'uuid' => $uuid,
        'company_id' => $company->id,
        'customer_id' => $customer->id,
        'description' => 'Plano Premium - Teste ' . strtoupper($metodo),
        'amount' => 97.00,
        'currency' => 'BRL',
        'status' => 'pending',
        'asaas_payment_id' => $asaasId,
        'payment_method' => $paymentMethod,
    ]);

    return redirect('/demo/' . $metodo . '/' . $uuid);
})->name('demo.criar');

// ── Demo: PIX ───────────────────────────────────────────────────────────
Route::get('/demo/pix/{uuid}', function ($uuid) {
    $resource = Transaction::where('uuid', $uuid)->firstOrFail();

    $amount = number_format($resource->amount, 2, '.', '');
    $txId = 'TX' . $resource->id . time();
    $merchantName = 'Basileia';
    $merchantCity = 'SAOPAULO';

    $payload = '000201'
        . '01021226' . str_pad($txId, 26, '0', STR_PAD_RIGHT)
        . '52040000'
        . '5303986'
        . '54' . str_pad($amount, 2, '0', STR_PAD_LEFT)
        . '5802BR'
        . '59' . str_pad($merchantName, 25, ' ', STR_PAD_RIGHT)
        . '60' . str_pad($merchantCity, 15, ' ', STR_PAD_RIGHT)
        . '62140510' . $txId
        . '6304';

    $crc = strtoupper(dechex(crc16($payload)));
    $payload .= str_pad($crc, 4, '0', STR_PAD_LEFT);

    $pixData = [
        'encodedImage' => '',
        'payload' => $payload,
    ];

    return view('checkout.pix.pagamento', [
        'transaction' => $resource,
        'pixData' => $pixData,
        'customerData' => [],
    ]);
})->name('demo.pix');

// ── Demo: Cartão ────────────────────────────────────────────────────────
Route::get('/demo/cartao/{uuid}', function ($uuid) {
    $resource = Transaction::where('uuid', $uuid)->firstOrFail();

    return view('checkout.card.pagamento', [
        'transaction' => $resource,
        'customerData' => [
            'name' => $resource->customer_name ?? '',
            'email' => $resource->customer_email ?? '',
            'document' => $resource->customer_document ?? '',
        ],
        'plano' => $resource->description,
        'ciclo' => 'mensal',
    ]);
})->name('demo.cartao');

// ── Demo: Boleto ────────────────────────────────────────────────────────
Route::get('/demo/boleto/{uuid}', function ($uuid) {
    $resource = Transaction::where('uuid', $uuid)->firstOrFail();

    $asaasData = [
        'billingType' => 'BOLETO',
        'value' => $resource->amount,
        'description' => $resource->description,
        'boletoUrl' => 'https://www.asaas.com/boleto/test',
        'installmentCount' => 1,
    ];
    $pixData = [];

    return view('checkout.boleto.pagamento', [
        'transaction' => $resource,
        'asaasData' => $asaasData,
        'pixData' => $pixData,
        'customerData' => [],
        'plano' => $resource->description,
        'ciclo' => 'mensal',
    ]);
})->name('demo.boleto');

// ── Demo: Checkout multi-tipo ───────────────────────────────────────────
Route::get('/demo-checkout/{type}/{uuid}', function ($type, $uuid) {
    $resource = Transaction::where('uuid', $uuid)->firstOrFail();
    $asaasData = [
        'billingType' => 'CREDIT_CARD',
        'value' => $resource->amount,
        'installmentCount' => 12,
        'description' => $resource->description,
    ];
    $customerData = [
        'name' => $resource->customer->name,
        'email' => $resource->customer->email,
        'phone' => $resource->customer->phone,
        'address' => [
            'endereco' => 'Av. Paulista',
            'numero' => '1000',
            'bairro' => 'Bela Vista',
            'cidade' => 'São Paulo',
            'estado' => 'SP',
            'cep' => '01310-100',
        ],
    ];

    $view = match ($type) {
        'premium' => 'checkout.index',
        'basileia' => 'checkout.asaas',
        'pix' => 'checkout.pix.front.pagamento',
        'boleto' => 'checkout.boleto.front.pagamento',
        default => 'checkout.index',
    };

    return view($view, [
        'transaction' => $resource,
        'asaasData' => $asaasData,
        'customerData' => $customerData,
        'pixData' => [],
        'plano' => 'Plano Mensal',
        'ciclo' => 'mensal',
        'features' => [
            ['t' => 'Pagamento Seguro', 'd' => 'Dados protegidos com criptografia SSL.'],
            ['t' => 'Processamento Instantâneo', 'd' => 'Confirmação rápida para liberação.'],
            ['t' => 'Suporte ao Cliente', 'd' => 'Assistência dedicada 24h.'],
        ],
    ]);
});
```
### Arquivo: routes/checkout.php
```php
<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\AsaasCheckoutController;
use App\Http\Controllers\BasileiaCheckoutController;
use App\Http\Controllers\CheckoutController;
use App\Http\Controllers\Checkout\Boleto\BoletoController;
use App\Http\Controllers\Checkout\Card\CardController;
use App\Http\Controllers\Checkout\EventCheckoutController;
use App\Http\Controllers\Checkout\Pix\PixController;

/*
|--------------------------------------------------------------------------
| Checkout Routes (Modularized)
|--------------------------------------------------------------------------
*/

// ── Asaas Direct Checkout (Legacy) ───────────────────────────────────────
Route::get('/checkout/asaas/{asaasPaymentId}', [AsaasCheckoutController::class, 'show'])->name('checkout.asaas.show');
Route::post('/checkout/asaas/process/{asaasPaymentId}', [AsaasCheckoutController::class, 'process'])->name('checkout.asaas.process');
Route::get('/checkout/asaas/success/{uuid}', [AsaasCheckoutController::class, 'success'])->name('checkout.asaas.success');

// ── Eventos ─────────────────────────────────────────────────────────────
Route::get('/evento/{slug}', [EventCheckoutController::class, 'show'])->name('evento.show');
Route::post('/evento/{slug}/pay', [EventCheckoutController::class, 'process'])->name('evento.process');
Route::get('/evento/{slug}/success', [EventCheckoutController::class, 'success'])->name('evento.success');

// ── PIX (Modular) ───────────────────────────────────────────────────────
Route::prefix('checkout/pix')->name('checkout.pix.')->group(function () {
    Route::get('/{uuid}', [PixController::class, 'show'])->name('show');
    Route::post('/process/{uuid}', [PixController::class, 'process'])->name('process');
    Route::get('/status/{uuid}', [PixController::class, 'status'])->name('status');
    Route::get('/success/{uuid}', [PixController::class, 'success'])->name('success');
});

// ── Boleto (Modular) ────────────────────────────────────────────────────
Route::prefix('checkout/boleto')->name('checkout.boleto.')->group(function () {
    Route::get('/{uuid}', [BoletoController::class, 'show'])->name('show');
    Route::post('/process/{uuid}', [BoletoController::class, 'process'])->name('process');
    Route::get('/status/{uuid}', [BoletoController::class, 'status'])->name('status');
    Route::get('/success/{uuid}', [BoletoController::class, 'success'])->name('success');
});

// ── Card / Default (Modular) ────────────────────────────────────────────
Route::prefix('checkout')->group(function () {
    Route::get('/{uuid}', [CardController::class, 'show'])
        ->name('checkout.show')
        ->where('uuid', '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}');

    Route::post('/process/{uuid}', [CardController::class, 'process'])->name('checkout.process');
    Route::get('/status/{uuid}', [CardController::class, 'status'])->name('checkout.status');
    Route::get('/success/{uuid}', [CardController::class, 'success'])->name('checkout.card.success');
});

// ── Short URL Support ───────────────────────────────────────────────────
Route::get('/c/{asaasPaymentId}', [BasileiaCheckoutController::class, 'handle'])
    ->name('checkout.short')
    ->middleware('secure.token');

// ── Legacy Pay Routes ───────────────────────────────────────────────────
Route::prefix('pay')->group(function () {
    Route::post('/{uuid}/process', [CheckoutController::class, 'process'])->name('checkout.legacy.process');
    Route::get('/{uuid}/success', [CheckoutController::class, 'success'])->name('checkout.legacy.success');
    Route::get('/{uuid}/receipt', [CheckoutController::class, 'receipt'])->name('checkout.receipt');
});

// ── Catch-All ───────────────────────────────────────────────────────────
Route::get('/{uuid}', [CheckoutController::class, 'show'])
    ->where('uuid', '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}')
    ->name('checkout.pay');
```
### Arquivo: routes/webhook.php
```php
<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\V1\WebhookController;
use App\Http\Controllers\Api\V1\CheckoutWebhookController;

// Webhooks from external gateways
Route::prefix('/webhooks/gateway')->group(function () {
    Route::post('/stripe', [WebhookController::class, 'stripe'])->name('webhooks.stripe');
    Route::post('/pagseguro', [WebhookController::class, 'pagseguro'])->name('webhooks.pagseguro');
});

// Webhook que o Checkout recebe de sistemas externos (ex: Basileia Vendas)
// Rota pública protegida por token de integração (ck_live_...) e assinatura X-Checkout-Signature
Route::middleware('api.auth')
    ->post('/webhooks/checkout', [\App\Http\Controllers\Api\V1\VendasWebhookController::class, 'handle'])
    ->name('webhooks.vendas');
```
### Arquivo: routes/console.php
```php
<?php

use Illuminate\Support\Facades\Schedule;
use App\Commands\RetryFailedWebhooks;

Schedule::command('webhooks:retry-failed')->everyFiveMinutes();
Schedule::command('payments:sync-pending')->everyTenMinutes();
Schedule::command('reports:generate-daily')->dailyAt('02:00');
Schedule::command('logs:cleanup')->weekly();
```
### Arquivo: routes/web.php
```php
<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Public\HomeController;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
| Este arquivo contém apenas a rota principal e carrega os módulos
| de rotas separados. Cada domínio funcional tem seu próprio arquivo.
|
| Módulos:
|   routes/dashboard.php  — Auth, 2FA, Dashboard admin
|   routes/checkout.php   — Checkout público (PIX, Cartão, Boleto, Asaas)
|   routes/demo.php       — Rotas de demonstração e debug
|--------------------------------------------------------------------------
*/

// ── Home ────────────────────────────────────────────────────────────────
Route::get('/', [HomeController::class, 'index'])->middleware('secure.token');
```
### Arquivo: routes/api.php
```php
<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\TransactionController;
use App\Http\Controllers\Api\V1\PaymentController;
use App\Http\Controllers\Api\V1\CustomerController;
use App\Http\Controllers\Api\V1\SubscriptionController;
use App\Http\Controllers\Api\V1\ReportController;
use App\Http\Controllers\Api\V1\CheckoutWebhookController;
use App\Http\Controllers\Api\V1\WebhookController;
use App\Http\Controllers\AsaasWebhookController;

Route::get('diag-check', function() {
    return response()->json([
        'status' => 'OK',
        'server' => 'CheckOut-Production',
        'version' => 'NUCLEAR_DIAG_999',
        'timestamp' => now()->toIso8601String(),
    ]);
});

// Webhook do Asaas (Rota pública oficial)
Route::post('webhooks/asaas', [AsaasWebhookController::class, 'handle'])->name('webhook.asaas');

Route::prefix('v1')->group(function () {
    // Ingestão de pagamentos do Vendas/Sistemas Externos
    Route::post('payments/receive', [\App\Http\Controllers\Api\PaymentApiController::class, 'receive']);

    // Auth
    Route::post('auth/login', [AuthController::class, 'login'])->middleware('throttle:5,1');
    Route::post('auth/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
    Route::post('auth/refresh', [AuthController::class, 'refresh'])->middleware('auth:sanctum');

    // Protected routes (via integration ck_live_... keys)
    Route::middleware('api.auth')->group(function () {
        // Transactions
        Route::apiResource('transactions', TransactionController::class);
        Route::post('transactions/{id}/cancel', [TransactionController::class, 'cancel']);
        Route::post('transactions/{id}/refund', [TransactionController::class, 'refund']);

        // Payments
        Route::post('payments/process', [PaymentController::class, 'process']);
        Route::get('payments/{id}/status', [PaymentController::class, 'status']);
        Route::get('payments/{id}/pix', [PaymentController::class, 'pix']);
        Route::get('payments/{id}/boleto', [PaymentController::class, 'boleto']);

        // Customers
        Route::apiResource('customers', CustomerController::class);

        // Subscriptions
        Route::apiResource('subscriptions', SubscriptionController::class);
        Route::post('subscriptions/{id}/pause', [SubscriptionController::class, 'pause']);
        Route::post('subscriptions/{id}/resume', [SubscriptionController::class, 'resume']);

        // Reports
        Route::get('reports/summary', [ReportController::class, 'summary']);
        Route::get('reports/transactions', [ReportController::class, 'transactions']);
    });
});
```
