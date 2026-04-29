<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use App\Services\AsaasPaymentService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class CheckoutController extends Controller
{
    private AsaasPaymentService $asaas;

    public function __construct(AsaasPaymentService $asaas)
    {
        $this->asaas = $asaas;
    }

    /**
     * Show the payment page for a transaction or subscription.
     * GET /pay/{uuid}
     */
    public function show(string $uuid)
    {
        $resource = \App\Models\Transaction::where('uuid', $uuid)->first() 
                   ?? \App\Models\Subscription::where('uuid', $uuid)->firstOrFail();

        // If it's a transaction already approved, show success/receipt directly
        if ($resource instanceof \App\Models\Transaction && $resource->status === 'approved') {
            return view('checkout.success', ['transaction' => $resource]);
        }

        $gatewayId = $resource->asaas_payment_id ?? $resource->gateway_subscription_id;
        $isSubscription = $resource instanceof \App\Models\Subscription;
        $asaasData = [];
        $pixData = [];

        if ($gatewayId) {
            // Fetch latest data from Asaas
            try {
                $asaasData = $this->asaas->getPayment($gatewayId);
                
                if (!$asaasData) {
                    Log::warning("Asaas record not found for ID {$gatewayId} in the current environment (" . config('services.asaas.environment') . "). Falling back to local data.");
                    
                    // Fallback to local database info to avoid crashing the checkout
                    $methodMap = ['credit_card' => 'CREDIT_CARD', 'pix' => 'PIX', 'boleto' => 'BOLETO'];
                    $billingType = $methodMap[$resource->payment_method ?? 'credit_card'] ?? 'CREDIT_CARD';
                    
                    $asaasData = [
                        'billingType' => $billingType,
                        'installmentCount' => 1,
                        'value' => $resource->amount,
                        'status' => 'PENDING'
                    ];
                }

                if (($asaasData['billingType'] ?? '') === 'PIX') {
                    $pixData = $this->asaas->getPixQrCode($gatewayId) ?? [
                        'payload' => 'PENDENTE_SYNC',
                        'encodedImage' => null
                    ];
                }
            } catch (\Exception $e) {
                Log::error("Error loading checkout for UUID {$uuid}: " . $e->getMessage());
                // Even on exception, try to show the screen if we have a resource
                if ($resource) {
                    $methodMap = ['credit_card' => 'CREDIT_CARD', 'pix' => 'PIX', 'boleto' => 'BOLETO'];
                    $asaasData = [
                        'billingType' => $methodMap[$resource->payment_method ?? 'credit_card'] ?? 'CREDIT_CARD',
                        'value' => $resource->amount,
                        'status' => 'PENDING'
                    ];
                } else {
                    return view('checkout.error', ['message' => "Erro ao carregar dados do pagamento: " . $e->getMessage()]);
                }
            }
        } else {
            // Test Mode or pending gateway sync
            $methodMap = ['credit_card' => 'CREDIT_CARD', 'pix' => 'PIX', 'boleto' => 'BOLETO'];
            $billingType = $methodMap[$resource->payment_method ?? 'credit_card'] ?? 'CREDIT_CARD';
            $asaasData = [
                'billingType' => $billingType,
                'installmentCount' => 1,
                'value' => $resource->amount,
            ];
            if ($billingType === 'PIX') {
                // QR Code fictício para demonstração (Aponta para basileia.global)
                $pixData = [
                    'payload' => '00020126580014BR.GOV.BCB.PIX0136test-pix-payload-basileia-global',
                    'encodedImage' => 'iVBORw0KGgoAAAANSUhEUgAAAOEAAADhCAMAAAAJbSJIAAAAflBMVEX///8AAAD8/Pz4+Pj09PTw8PDs7Ozo6Ojk5OTg4ODc3Nzb29vX19fT09PZ2dna2tre3t7f39/m5ubp6enq6urj4+Pn5+fl5eXh4eHf39/d3d3c3Nzk5OTV1dXU1NTv7+/y8vLz8/P19fX29vb4+Pj5+fn7+/v8/Pz9/f3+/v778nI3AAAFDElEQVR4nO2dW3fTMBCG000pLTY0NCYhXGgh7P//L9zSlu6YkbzV2XN7z8uW7NidLzYajaS8CIIgCIIgCIIgCIIgCIIgCIIgiFeiL4/A0O0Zat/n9K275C64y2379An0h/YyApe+fTj97mToO8v9m7Gf7ZrvuTfAtGf9qL86A9v+Zp476XfuBTFteBv6/XmCjB8v08/kZebvuj/E0rN0/YI5M3fX3SBf9/8N95uR/uzjE/X780K89iydL5iv5u66m+RLH3N/iKVnyfyC+WruqrtJvs8B94dYepYOHM6NHeY65v7Z09zhT96Gv/0XfCbe61n8F397h7mOub/5XmD87f2A3+tZPP9/Y4e5Tvz3P/+9nOfnZ/Fv6TDXMfc393uD8df0e4PnWfxXPcx1zP3O/X6D+df9+wZfIePfw9fAt/g9vY0d5jrnfj8wf7t92wG/27Pt/m627+C27+m2b+22Z9eC/HhBvr9A9hcA1fACfX9BXv99Xv/Y99fX19fX19fXf1L8S/6Of7R/0X/96f6if6f/47/of89f+rf2F/3Xn+4v+nf6P/6L/vf8pX9rf9F//en+on+n/+O/6H/PX/q39hf915/uL/p3+j/+i/73/KV/a3/Rf/3p/qJ/p//jv+h/z1/69/M1f/4uL6n5L7f6Mlvz/uI9+vMueX+9K88v2ZJftie/7L9/0n+6P+9i7jZ6uH2U7Mivv83V/7pLH467VfL9S/Lp9fH6p9jG0v5m6fMreZlvz/9pZ/6e++C7H0tY5v8Nf8G/79/S+vszp67/hY6Wre3pX6Wr8T+8qXXv/07tKV0/vKl09vat09fSuclvp6uW60rWf60rXYX+nZ9f6XvTfL/ov+m9p//2i/6L/lvbf6L+lW9p/o/+W9t8v+m9p//3u3++Vrt/u6V39O8/1pfvX6UrXPteVrsf+Tp6uF779u5OnhW8Xvv27k6fpeunbvzt5uuW60vXU6UrX06crXU+frvQWvrul/Te6pe9uaf+Obum7W9q/Y56m6+VvXpe/eV3+5nX5m9flb15X9O9/vK68f/8DdV1R/39fV9T7f35dUf9/X1fU+39+Xf9/v66p93vUdcP/9+uKemfXdf7mdfmb1+VvXpe/eV3R7/+8f96v6z/v+3Vdv6P7/vK76N/5XfTv/C76d34XfTtP07X/L3ld6Xv/O13/9/yOrufv96jrV76u6+n7PeXfH13Pv5On6/Xyd6brCevvFf+fI13X07uK/u90Pfx+j7peL3/zuvzN6/I3r8vfvC5/87rS7/eX9789S/sXp2fpfD1L+9+ezeXpWvpfz9L2X/Nf8v85l7/rv+y/fNJfv0veX9fS/pT/f++S978df0veX8fS/hR/fXed7P/46/Xyd6dr9Omdr9Gn6P9O1+jTdI0+RdcV/e5/vK7oV/S7/3Wd+B/S9fS99K8l/v+9S/6Pvx9/87rO+N+v68R+v64T+v88Tf/pf4Xon8df0T/vX+id+B/Sp/7Xv/vL9PT36S/9bT5mS37Zlvv9Zebuen78Nn+f78RszZfO0vU9ZsuP+Z7mzv/y+0fPzPxZf97F/8zP9p69+9+v68Tf7oXvL/Fv98Lff9n9f8v86X8L/2b8pX+397v/+8n+p7/W/qL/Nf6r/vX8pX89/6L/Gv69/vX6pX/dv1+vX/rX/fv1+mXpWv9pX7S06E7uM9296W57h7v/Z0v/AnCshQYt7FshAAAAAElFTkSuQmCC',
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

        return view('checkout.index', [
            'transaction' => $resource, 
            'asaasData' => $asaasData, 
            'pixData' => $pixData,
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

    /**
     * Process a credit card payment.
     * POST /pay/{uuid}/process
     */
    public function process(Request $request, string $uuid)
    {
        $resource = \App\Models\Transaction::where('uuid', $uuid)->first() 
                   ?? \App\Models\Subscription::where('uuid', $uuid)->firstOrFail();

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
            
            $asaasResponse = $this->asaas->processCardPayment($gatewayId, [
                'card_number' => $request->input('card_number'),
                'card_name' => $request->input('holder_name'),
                'card_expiry' => $request->input('expiry_month') . '/' . $request->input('expiry_year'),
                'card_cvv' => $request->input('cvv'),
                'card_document' => $resource->customer_document ?? $resource->customer?->document ?? '',
                'card_email' => $resource->customer_email ?? $resource->customer?->email ?? 'contato@basileia.global',
                'card_cep' => $resource->customer_zip_code ?? ($resource->customer?->address['postalCode'] ?? '00000000'),
                'card_address_number' => $resource->customer_number ?? ($resource->customer?->address['number'] ?? '1'),
            ], $request->ip());

            if (in_array($asaasResponse['status'], ['CONFIRMED', 'RECEIVED'])) {
                $resource->update([
                    'status' => 'approved',
                    'paid_at' => now(),
                    'gateway_response' => json_encode($asaasResponse),
                ]);

                // Tokenization: Save card for auto-renewal
                if (!empty($asaasResponse['creditCardToken'])) {
                    \App\Models\PaymentToken::updateOrCreate(
                        ['token' => $asaasResponse['creditCardToken']],
                        [
                            'company_id' => $resource->company_id,
                            'customer_id' => $resource->customer_id,
                            'gateway' => 'asaas',
                            'brand' => $asaasResponse['payment'] ?? 'CARTÃO', // Simplified
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
        $resource = \App\Models\Transaction::where('uuid', $uuid)->first() 
                   ?? \App\Models\Subscription::where('uuid', $uuid)->firstOrFail();
        
        return view('checkout.success', ['transaction' => $resource]);
    }

    /**
     * Show the receipt for a transaction.
     * GET /pay/{uuid}/receipt
     */
    public function receipt(string $uuid)
    {
        $resource = \App\Models\Transaction::where('uuid', $uuid)->first() 
                   ?? \App\Models\Subscription::where('uuid', $uuid)->firstOrFail();
        
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
