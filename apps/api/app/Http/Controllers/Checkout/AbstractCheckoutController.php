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

    public function success(string $uuidOrToken, Request $request): mixed
    {
        // Fluxo 1: Token efêmero (seguro — uso único, 30min)
        $resolvedUuid = CheckoutService::resolveSuccessToken($uuidOrToken);

        if ($resolvedUuid) {
            $resource = CheckoutService::findResource($resolvedUuid);
            return view($this->getSuccessViewName(), CheckoutService::buildSuccessData($resource));
        }

        // Fluxo 2: Legacy UUID (compatibilidade — dados mínimos, sem nome/email/documento)
        $resource = CheckoutService::findResource($uuidOrToken);
        return view($this->getSuccessViewName(), CheckoutService::buildSuccessData($resource));
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
