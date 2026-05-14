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

    public function success(string $uuidOrToken)
    {
        // Tenta resolver como token efêmero primeiro
        $resolvedUuid = CheckoutService::resolveSuccessToken($uuidOrToken);
        $uuid = $resolvedUuid ?? $uuidOrToken;

        $resource = Transaction::where('uuid', $uuid)->first()
            ?? \App\Models\Subscription::where('uuid', $uuid)->firstOrFail();

        // NUNCA passa o objeto Transaction inteiro — apenas dados seguros
        return view('checkout.card.front.sucesso', CheckoutService::buildSuccessData($resource));
    }
}