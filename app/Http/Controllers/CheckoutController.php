<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use App\Services\Gateway\AsaasGateway;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class CheckoutController extends Controller
{
    private AsaasGateway $asaas;

    public function __construct(AsaasGateway $asaas)
    {
        $this->asaas = $asaas;
    }

    /**
     * Show the payment page for a transaction or subscription.
     * GET /pay/{uuid}
     */
    public function show(string $uuid)
    {
        $resource = \App\Models\Transaction::where('uuid', $uuid)->first();

        if (!$resource && \Illuminate\Support\Str::isUuid($uuid)) {
            $resource = \App\Models\Subscription::where('uuid', $uuid)->first();
        }

        if (!$resource) {
            abort(404, 'Pagamento não encontrado.');
        }

        // If it's a transaction already approved, show success/receipt directly
        if ($resource instanceof \App\Models\Transaction && $resource->status === 'approved') {
            return view('checkout.success', ['transaction' => $resource]);
        }

        $gatewayId = $resource->asaas_payment_id ?? $resource->gateway_subscription_id;

        // Fetch latest data from Asaas
        try {
            $isSubscription = $resource instanceof \App\Models\Subscription;
            $endpoint = $isSubscription ? "/subscriptions/{$gatewayId}" : "/payments/{$gatewayId}";
            $asaasData = $this->asaas->request('get', $endpoint);
            
            // If it's a PIX payment, we might need the QR Code
            $pixData = [];
            if (isset($asaasData['billingType']) && $asaasData['billingType'] === 'PIX') {
                $pixData = $this->asaas->request('get', "/payments/{$gatewayId}/pixQrCode");
            }

            return view('checkout.pay', ['transaction' => $resource, 'asaasData' => $asaasData, 'pixData' => $pixData, 'isSubscription' => $isSubscription]);

        } catch (\Exception $e) {
            Log::error("Error loading checkout: " . $e->getMessage());
            return view('checkout.error', ['message' => 'Erro ao carregar dados do pagamento ou plano expirado.']);
        }
    }

    /**
     * Process a credit card payment.
     * POST /pay/{uuid}/process
     */
    public function process(Request $request, string $uuid)
    {
        $resource = \App\Models\Transaction::where('uuid', $uuid)->first();

        if (!$resource && \Illuminate\Support\Str::isUuid($uuid)) {
            $resource = \App\Models\Subscription::where('uuid', $uuid)->first();
        }

        if (!$resource) {
            abort(404, 'Pagamento não encontrado.');
        }

        $request->validate([
            'holder_name' => 'required|string',
            'card_number' => 'required|string',
            'expiry_month' => 'required|string|size:2',
            'expiry_year' => 'required|string|size:4',
            'cvv' => 'required|string|min:3|max:4',
        ]);

        try {
            $isSubscription = $resource instanceof \App\Models\Subscription;
            $gatewayId = $isSubscription ? $resource->gateway_subscription_id : $resource->asaas_payment_id;
            $endpoint = $isSubscription ? "/subscriptions/{$gatewayId}/payWithCreditCard" : "/payments/{$gatewayId}/payWithCreditCard";

            // Logic to pay with credit card via Asaas
            $response = $this->asaas->request('post', $endpoint, [
                'creditCard' => [
                    'holderName' => $request->input('holder_name'),
                    'number' => preg_replace('/\D/', '', $request->input('card_number')),
                    'expiryMonth' => $request->input('expiry_month'),
                    'expiryYear' => $request->input('expiry_year'),
                    'ccv' => $request->input('cvv'),
                ],
                'creditCardHolderInfo' => [
                    'name' => $request->input('holder_name'),
                    'email' => $resource->customer_email ?? $resource->customer?->email ?? 'contato@basileia.global',
                    'cpfCnpj' => preg_replace('/\D/', '', $resource->customer_document ?? $resource->customer?->document ?? ''),
                    'postalCode' => preg_replace('/\D/', '', $resource->customer_zip_code ?? ($resource->customer?->address['postalCode'] ?? '00000000')),
                    'addressNumber' => $resource->customer_number ?? ($resource->customer?->address['number'] ?? '1'),
                    'phone' => preg_replace('/\D/', '', $resource->customer_phone ?? $resource->customer?->phone ?? ''),
                ],
                'remoteIp' => $request->ip(),
            ]);

            if ($response['status'] === 'CONFIRMED' || $response['status'] === 'RECEIVED') {
                $resource->update([
                    'status' => 'approved',
                    'paid_at' => now(),
                    'gateway_response' => $response,
                ]);

                // Tokenization: Save card for auto-renewal
                if (!empty($response['creditCardToken'])) {
                    \App\Models\PaymentToken::updateOrCreate(
                        ['token' => $response['creditCardToken']],
                        [
                            'company_id' => $resource->company_id,
                            'customer_id' => $resource->customer_id,
                            'gateway' => 'asaas',
                            'brand' => $response['payment'] ?? 'CARTÃO', // Simplified
                            'last4' => substr($request->input('card_number'), -4),
                            'expiry_month' => $request->input('expiry_month'),
                            'expiry_year' => $request->input('expiry_year'),
                        ]
                    );
                }

                // Notify Vendas (Back-sync)
                $callbackUrl = $resource->callback_url ?? ($resource->integration?->webhook_url ?? null);
                if ($callbackUrl) {
                    try {
                        \Illuminate\Support\Facades\Http::post($callbackUrl, [
                            'event' => $isSubscription ? 'subscription.paid' : 'payment.approved',
                            'asaas_id' => $gatewayId,
                            'resource_uuid' => $resource->uuid,
                            'status' => 'approved',
                            'amount' => $resource->amount,
                        ]);
                    } catch (\Exception $e) {
                        Log::error("Failed to notify Vendas: " . $e->getMessage());
                    }
                }
                
                return response()->json(['status' => 'success', 'redirect' => route('checkout.success', $uuid)]);
            }

            return response()->json(['status' => 'error', 'message' => 'Pagamento recusado ou em análise.'], 400);

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
        $resource = \App\Models\Transaction::where('uuid', $uuid)->first();

        if (!$resource && \Illuminate\Support\Str::isUuid($uuid)) {
            $resource = \App\Models\Subscription::where('uuid', $uuid)->first();
        }

        if (!$resource) {
            abort(404, 'Pagamento não encontrado.');
        }
        
        return view('checkout.success', ['transaction' => $resource]);
    }

    /**
     * Show the receipt for a transaction.
     * GET /pay/{uuid}/receipt
     */
    public function receipt(string $uuid)
    {
        $resource = \App\Models\Transaction::where('uuid', $uuid)->first();

        if (!$resource && \Illuminate\Support\Str::isUuid($uuid)) {
            $resource = \App\Models\Subscription::where('uuid', $uuid)->first();
        }

        if (!$resource) {
            abort(404, 'Pagamento não encontrado.');
        }
        
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
}
