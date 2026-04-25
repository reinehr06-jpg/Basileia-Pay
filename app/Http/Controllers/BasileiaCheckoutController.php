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

        $asaasPayment = $this->asaasService->getPayment($asaasPaymentId);
        
        if (!$asaasPayment) {
            Log::warning('BasileiaCheckout: Payment not found', [
                'asaas_payment_id' => $asaasPaymentId,
            ]);
            return view('checkout.error', ['message' => 'Pagamento não encontrado']);
        }

        $pixData = [];
        if (isset($asaasPayment['billingType']) && $asaasPayment['billingType'] === 'PIX') {
            $pixData = $this->asaasService->getPixQrCode($asaasPaymentId);
        }

        $customer = $asaasPayment['customer'] ?? [];
        $billingType = $asaasPayment['billingType'] ?? 'CREDIT_CARD';
        
        $customerData = [
            'name' => $customer['name'] ?? $request->get('cliente', ''),
            'email' => $customer['email'] ?? '',
            'phone' => $customer['phone'] ?? '',
            'document' => $customer['cpfCnpj'] ?? '',
            'address' => [
                'street' => $customer['address'] ?? '',
                'number' => $customer['addressNumber'] ?? '',
                'neighborhood' => $customer['neighborhood'] ?? '',
                'city' => $customer['city'] ?? '',
                'state' => $customer['state'] ?? '',
                'postalCode' => $customer['postalCode'] ?? '',
            ],
        ];

        $transaction = Transaction::where('asaas_payment_id', $asaasPaymentId)->first();

        $plano = $request->get('plano', $asaasPayment['description'] ?? 'Plano');
        $ciclo = $request->get('ciclo', 'mensal');

        if (!$transaction) {
            $transaction = Transaction::create([
                'uuid' => Str::uuid(),
                'asaas_payment_id' => $asaasPaymentId,
                'source' => 'basileia_vendas',
                'product_type' => 'saas',
                'external_id' => $request->get('venda_id', ''),
                'callback_url' => config('basileia.callback_url', $request->get('callback_url', '')),
                'amount' => $asaasPayment['value'] ?? 0,
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
        }

        return view('checkout.basileia', [
            'transaction' => $transaction,
            'asaasPayment' => $asaasPayment,
            'customerData' => $customerData,
            'plano' => $plano,
            'ciclo' => $ciclo,
            'pixData' => $pixData,
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
            ]);

            $status = $this->mapStatus($asaasResponse['status'] ?? '');
            $paidAt = in_array($asaasResponse['status'] ?? '', ['CONFIRMED', 'RECEIVED']) ? now() : null;

            $transaction->update([
                'status' => $status,
                'paid_at' => $paidAt,
                'gateway_response' => json_encode($asaasResponse),
            ]);

            Log::info('BasileiaCheckout: Pagamento processado', [
                'transaction_id' => $transaction->id,
                'asaas_status' => $asaasResponse['status'] ?? 'unknown',
                'transaction_status' => $status,
            ]);

            $this->webhookNotifier->notify($transaction);

            return redirect()->route('basileia.checkout.success', $transaction->uuid);

        } catch (\Exception $e) {
            Log::error('BasileiaCheckout: Payment processing failed', [
                'asaas_payment_id' => $asaasPaymentId,
                'error' => $e->getMessage(),
            ]);

            return back()->withErrors([
                'payment' => 'Erro ao processar pagamento: ' . $e->getMessage(),
            ])->withInput();
        }
    }

    public function success(string $uuid)
    {
        $transaction = Transaction::where('uuid', $uuid)->firstOrFail();
        
        return view('checkout.asaas-success', [
            'transaction' => $transaction,
        ]);
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