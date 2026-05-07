<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\AsaasPaymentService;
use App\Models\Transaction;
use App\Models\Subscription;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

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
        
        return view('checkout.success', ['transaction' => $resource]);
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
