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

    public function success(string $uuidOrToken)
    {
        $resolvedUuid = \App\Services\CheckoutService::resolveSuccessToken($uuidOrToken);
        $uuid = $resolvedUuid ?? $uuidOrToken;

        $transaction = Transaction::where('uuid', $uuid)->firstOrFail();

        return view('checkout.card.front.sucesso', \App\Services\CheckoutService::buildSuccessData($transaction));
    }
}