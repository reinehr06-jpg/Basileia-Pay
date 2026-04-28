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
        try {
            // Se for um slug de evento, delega para o EventCheckoutController
            $event = \App\Models\Event::where('slug', $asaasPaymentId)->first();
            if ($event) {
                return app(\App\Http\Controllers\Public\EventCheckoutController::class)->show($asaasPaymentId);
            }

            Log::info('BasileiaCheckout: Iniciando link vendor', [
                'asaas_payment_id' => $asaasPaymentId,
            ]);

            $transaction = Transaction::where('asaas_payment_id', $asaasPaymentId)->first();

            if (!$transaction) {
                // Se não existe a transação, buscamos os dados no Asaas para criar o registro seguro
                $apiKey = config('services.asaas.api_key');
                if (empty($apiKey)) {
                    $defaultGateway = \App\Models\Gateway::where('status', 'active')
                        ->where('is_default', true)
                        ->first() ?? \App\Models\Gateway::where('status', 'active')->first();
                    if ($defaultGateway) {
                        config(['services.asaas.api_key' => $defaultGateway->getConfig('api_key')]);
                    }
                }

                $asaasPayment = $this->asaasService->getPayment($asaasPaymentId);
                if (!$asaasPayment) {
                    return "Pagamento não encontrado no Asaas.";
                }

                $customer = $asaasPayment['customer'] ?? [];
                $isCustomerArray = is_array($customer);

                $transaction = Transaction::create([
                    'uuid' => (string) Str::uuid(),
                    'company_id' => \App\Models\Company::first()?->id ?? 1,
                    'asaas_payment_id' => $asaasPaymentId,
                    'source' => 'basileia_vendas',
                    'amount' => $asaasPayment['value'] ?? 0,
                    'description' => $asaasPayment['description'] ?? 'Pagamento Basiléia',
                    'payment_method' => $this->mapPaymentMethod($asaasPayment['billingType'] ?? 'CREDIT_CARD'),
                    'status' => 'pending',
                    'customer_name' => ($isCustomerArray ? ($customer['name'] ?? '') : '') ?: $request->get('cliente', ''),
                    'customer_email' => ($isCustomerArray ? ($customer['email'] ?? '') : '') ?: $request->get('email', ''),
                    'customer_document' => ($isCustomerArray ? ($customer['cpfCnpj'] ?? '') : '') ?: $request->get('documento', ''),
                    'customer_phone' => ($isCustomerArray ? ($customer['phone'] ?? '') : '') ?: $request->get('whatsapp', ''),
                ]);
            }

            // REDIRECIONA PARA O LINK SEGURO (Ocultando os dados da URL)
            return redirect()->route('checkout.show', $transaction->uuid);

        } catch (\Exception $e) {
            Log::error('BasileiaCheckout: Handle Error', ['msg' => $e->getMessage()]);
            return "Erro ao processar checkout seguro.";
        }
    }

    public function show(string $uuid, Request $request)
    {
        try {
            $transaction = Transaction::where('uuid', $uuid)->firstOrFail();

            // Se já foi pago, redireciona para sucesso diretamente
            if ($transaction->status === 'approved') {
                return view('checkout.premium', [
                    'step' => 3,
                    'transaction' => $transaction,
                    'plano' => $transaction->description,
                    'ciclo' => 'mensal',
                ]);
            }

            $asaasPaymentId = $transaction->asaas_payment_id;
            
            // Re-configura API Key
            $apiKey = config('services.asaas.api_key');
            if (empty($apiKey)) {
                $defaultGateway = \App\Models\Gateway::where('status', 'active')
                    ->where('is_default', true)
                    ->first() ?? \App\Models\Gateway::where('status', 'active')->first();
                if ($defaultGateway) {
                    config(['services.asaas.api_key' => $defaultGateway->getConfig('api_key')]);
                }
            }

            $asaasPayment = $this->asaasService->getPayment($asaasPaymentId);
            
            $pixData = [];
            if (($asaasPayment['billingType'] ?? '') === 'PIX') {
                $pixData = $this->asaasService->getPixQrCode($asaasPaymentId) ?? [];
            }

            return view('checkouts.basileia-vendor.index', [
                'step' => $request->get('success') ? 3 : 1,
                'transaction' => $transaction,
                'paymentMethod' => strtolower($asaasPayment['billingType'] ?? 'pix'),
                'asaasPayment' => $asaasPayment,
                'customerData' => [
                    'name' => $transaction->customer_name,
                    'email' => $transaction->customer_email,
                    'phone' => $transaction->customer_phone,
                    'document' => $transaction->customer_document,
                ],
                'plano' => $transaction->description,
                'ciclo' => 'mensal',
                'pixData' => $pixData ?? ['payload' => '', 'encodedImage' => ''],
            ]);

        } catch (\Exception $e) {
            Log::error('BasileiaCheckout: Show Error', ['msg' => $e->getMessage()]);
            return view('checkout.error', ['message' => 'Link de checkout inválido ou expirado.']);
        }
    }

    public function process(string $uuid, Request $request)
    {
        $transaction = Transaction::where('uuid', $uuid)->firstOrFail();

        $request->validate([
            'card_number' => 'required|string',
            'card_name' => 'required|string',
            'card_expiry' => 'required|string',
            'card_cvv' => 'required|string',
            'customer_name' => 'nullable|string',
            'customer_email' => 'nullable|email',
            'customer_document' => 'nullable|string',
        ]);

        try {
            // Re-configura API Key para o processamento
            $apiKey = config('services.asaas.api_key');
            if (empty($apiKey)) {
                $defaultGateway = \App\Models\Gateway::where('status', 'active')
                    ->where('is_default', true)
                    ->first() ?? \App\Models\Gateway::where('status', 'active')->first();
                if ($defaultGateway) {
                    config(['services.asaas.api_key' => $defaultGateway->getConfig('api_key')]);
                }
            }

            $asaasResponse = $this->asaasService->processCardPayment($transaction->asaas_payment_id, [
                'card_number' => $request->input('card_number'),
                'card_name' => $request->input('card_name'),
                'card_expiry' => $request->input('card_expiry'),
                'card_cvv' => $request->input('card_cvv'),
                'card_document' => $request->input('customer_document', $transaction->customer_document),
                'card_email' => $request->input('customer_email', $transaction->customer_email),
                'card_phone' => $transaction->customer_phone,
            ]);

            $status = $this->mapStatus($asaasResponse['status'] ?? '');
            $paidAt = in_array($asaasResponse['status'] ?? '', ['CONFIRMED', 'RECEIVED']) ? now() : null;

            $transaction->update([
                'status' => $status,
                'paid_at' => $paidAt,
                'customer_name' => $request->input('customer_name', $transaction->customer_name),
                'customer_email' => $request->input('customer_email', $transaction->customer_email),
                'customer_document' => $request->input('customer_document', $transaction->customer_document),
                'gateway_response' => json_encode($asaasResponse),
            ]);

            $this->webhookNotifier->notify($transaction);

            return redirect()->to(route('checkout.show', $uuid) . '?success=1');

        } catch (\Exception $e) {
            Log::error('BasileiaCheckout: Payment processing failed', ['error' => $e->getMessage()]);
            return back()->withErrors(['payment' => $e->getMessage()])->withInput();
        }
    }

    public function success(string $uuid)
    {
        return redirect()->route('checkout.show', $uuid);
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