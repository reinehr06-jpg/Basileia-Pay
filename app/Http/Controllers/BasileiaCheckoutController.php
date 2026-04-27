<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use App\Services\AsaasPaymentService;
use App\Services\WebhookNotifierService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class BasileiaCheckoutController extends Controller
{
    public function __construct(
        private AsaasPaymentService $asaasService,
        private WebhookNotifierService $webhookNotifier,
    ) {}

    public function handle(string $asaasPaymentId, Request $request)
    {
        Log::info('BasileiaCheckout: Iniciando checkout', [
            'asaas_payment_id' => $asaasPaymentId,
            'params' => $request->all(),
        ]);

        $apiKey = config('services.asaas.api_key');
        
        // Se a chave global não estiver definida, busca a chave do gateway padrão no banco
        if (empty($apiKey)) {
            $defaultGateway = \App\Models\Gateway::where('status', 'active')
                ->where('is_default', true)
                ->first() ?? \App\Models\Gateway::where('status', 'active')->first();
                
            if ($defaultGateway) {
                $apiKey = $defaultGateway->getConfig('api_key');
                // Configure o serviço para usar esta chave
                config(['services.asaas.api_key' => $apiKey]);
            }
        }

        if (empty($apiKey)) {
            Log::warning('AsaasPaymentService: ASAAS_API_KEY not configured in .env or Database');
            throw new \RuntimeException('Gateway not configured (API Key is missing)');
        }

        $asaasPayment = $this->asaasService->getPayment($asaasPaymentId);
        
        if (!$asaasPayment) {
            Log::warning('BasileiaCheckout: Payment not found', [
                'asaas_payment_id' => $asaasPaymentId,
            ]);
            return view('checkout.error', ['message' => 'Pagamento não encontrado']);
        }

        $pixData = [];
        if (isset($asaasPayment['billingType']) && $asaasPayment['billingType'] === 'PIX') {
            $pixData = $this->asaasService->getPixQrCode($asaasPaymentId) ?? [];
        }

        $customer = $asaasPayment['customer'] ?? [];
        $billingType = $asaasPayment['billingType'] ?? (strtoupper($request->get('metodo', $request->get('forma_pagamento', 'CREDIT_CARD'))));
        if ($billingType === 'PIX' && !isset($asaasPayment['billingType'])) {
             // If we forced PIX from URL but Asaas didn't return it (e.g. error)
        }
        
        // Asaas might return only the customer ID (string) or the full object (array)
        $isCustomerArray = is_array($customer);
        
        $customerData = [
            'name' => ($isCustomerArray ? ($customer['name'] ?? null) : null) ?? $request->get('cliente', ''),
            'email' => ($isCustomerArray ? ($customer['email'] ?? null) : null) ?? $request->get('email', ''),
            'phone' => ($isCustomerArray ? ($customer['phone'] ?? null) : null) ?? $request->get('whatsapp', ''),
            'document' => ($isCustomerArray ? ($customer['cpfCnpj'] ?? null) : null) ?? $request->get('documento', ''),
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
            try {
                // Busca a empresa (Basileia como fallback)
                $companyId = $request->get('company_id', \App\Models\Company::first()?->id ?? 1);

                $transaction = Transaction::create([
                    'uuid' => (string) Str::uuid(),
                    'company_id' => $companyId,
                    'asaas_payment_id' => $asaasPaymentId,
                    'source' => 'basileia_vendas',
                    'external_id' => $request->get('venda_id', ''),
                    'callback_url' => config('basileia.callback_url', $request->get('callback_url', '')),
                    'amount' => $asaasPayment['value'] ?? $request->get('valor', 0),
                    'description' => $asaasPayment['description'] ?? 'Pagamento Basileia',
                    'payment_method' => $this->mapPaymentMethod($billingType),
                    'status' => 'pending',
                    'customer_name' => $customerData['name'],
                    'customer_email' => $customerData['email'],
                    'customer_phone' => $customerData['phone'],
                    'customer_document' => $customerData['document'],
                    'customer_address' => json_encode($customerData['address']),
                    'metadata' => [
                        'plano' => $plano,
                        'ciclo' => $ciclo,
                        'venda_id' => $request->get('venda_id', ''),
                        'hash' => $request->get('hash', ''),
                    ],
                ]);

                Log::info('BasileiaCheckout: Transação criada', [
                    'transaction_id' => $transaction->id,
                    'uuid' => $transaction->uuid,
                ]);
            } catch (\Exception $e) {
                Log::error('BasileiaCheckout: Erro ao criar transação', [
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString()
                ]);
                return view('checkout.error', ['message' => 'Erro interno ao processar checkout: ' . $e->getMessage()]);
            }
        }

        // Ativar o FRONT PREMIUM (Layered Book Style)
        return view('checkout.premium', [
            'step' => $request->get('success') ? 3 : 1,
            'transaction' => $transaction,
            'paymentMethod' => strtolower($asaasPayment['billingType'] ?? 'pix'),
            'asaasPayment' => $asaasPayment,
            'customerData' => $customerData,
            'plano' => $plano,
            'ciclo' => $ciclo,
            'pixData' => $pixData ?? ['payload' => '', 'encodedImage' => ''],
        ]);
    }

    public function process(string $asaasPaymentId, Request $request)
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

            $status = $this->mapStatus($asaasResponse['status'] ?? '');
            $paidAt = in_array($asaasResponse['status'] ?? '', ['CONFIRMED', 'RECEIVED']) ? now() : null;

            $transaction->update([
                'status' => $status,
                'paid_at' => $paidAt,
                'gateway_response' => json_encode($asaasResponse),
            ]);

            $this->webhookNotifier->notify($transaction);

            // Redireciona de volta com o parâmetro de sucesso para mostrar a Layer 3 no visual Premium
            return redirect()->to(route('basileia.checkout', $asaasPaymentId) . '?success=1');

        } catch (\Exception $e) {
            Log::error('BasileiaCheckout: Payment processing failed', ['error' => $e->getMessage()]);
            return back()->withErrors(['payment' => $e->getMessage()])->withInput();
        }
    }

    public function success(string $uuid)
    {
        // Se cair aqui via UUID (link antigo), redirecionamos para o novo visual premium
        $transaction = Transaction::where('uuid', $uuid)->firstOrFail();
        return redirect()->to(route('basileia.checkout', $transaction->asaas_payment_id) . '?success=1');
    }

    private function mapPaymentMethod(string $billingType): string
    {
        return match ($billingType) {
            'CREDIT_CARD' => 'credit_card',
            'PIX' => 'pix',
            'BOLETO' => 'boleto',
            default => 'credit_card',
        };
    }

    private function mapStatus(string $asaasStatus): string
    {
        return match ($asaasStatus) {
            'CONFIRMED', 'RECEIVED', 'RECEIVED_IN_CASH' => 'approved',
            'PENDING', 'AWAITING_RISK_ANALYSIS' => 'pending',
            'OVERDUE' => 'overdue',
            'REFUNDED', 'REFUND_REQUESTED', 'CHARGEBACK_REQUESTED' => 'refunded',
            'CANCELED', 'DELETED' => 'cancelled',
            default => 'pending',
        };
    }
}