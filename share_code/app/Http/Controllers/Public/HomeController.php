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
}