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
