<?php

namespace App\Services;

use App\Enums\PaymentStatus;
use App\Events\PaymentApproved;
use App\Events\PaymentCancelled;
use App\Events\PaymentPending;
use App\Events\PaymentRefused;
use App\Events\PaymentRefunded;
use App\Models\Customer;
use App\Models\Gateway;
use App\Models\Payment;
use App\Models\Transaction;
use App\Models\Integration;
use App\Services\Gateway\GatewayFactory;
use App\Helpers\PaymentStatusMapper;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use RuntimeException;

class PaymentService
{
    public function __construct(
        private GatewayFactory $gatewayFactory,
        private CustomerService $customerService,
        private TransactionService $transactionService,
    ) {}

    /**
     * Alinhado com Api\V1\PaymentController@process
     */
    public function process(array $data, ?Integration $integration = null): array
    {
        return DB::transaction(function () use ($data, $integration) {
            $transaction = Transaction::where('uuid', $data['transaction_uuid'])->firstOrFail();
            
            // Resolve gateway (se não passado, pega o da integração da transação)
            $integration = $integration ?? $transaction->integration;
            $gateway = $this->gatewayFactory->make($integration->gateway->type);
            
            // Mapeia credit_card para o que o gateway/asaas espera (CREDITCARD)
            $billingTypeMap = [
                'credit_card' => 'CREDIT_CARD',
                'pix' => 'PIX',
                'boleto' => 'BOLETO'
            ];
            $billingType = $billingTypeMap[$data['payment_method']] ?? 'CREDIT_CARD';

            // Prepara dados para o gateway
            $gatewayInput = [
                'amountBRL' => (float) $transaction->amount,
                'description' => $transaction->description ?? "Pagamento #{$transaction->uuid}",
                'installments' => (int) ($data['card']['installments'] ?? 1),
                'cardToken' => $data['card']['number'] ?? null,
                'cardHolderName' => $data['card']['holder_name'] ?? null,
                'cardExpiry' => isset($data['card']['expiry_month']) ? "{$data['card']['expiry_month']}/{$data['card']['expiry_year']}" : null,
                'cardCvv' => $data['card']['cvv'] ?? null,
                'remoteIp' => request()->ip(),
                
                // Holder info real (BUG-02)
                'holder_email' => $data['card']['email'] ?? $transaction->customer_email,
                'card_document' => $data['card']['document'] ?? $transaction->customer_document,
            ];

            // Executa a cobrança no gateway
            $customerId = $this->resolveGatewayCustomerId($transaction, $gateway);
            
            $gatewayResponse = match($billingType) {
                'PIX' => $gateway->chargeViaPix($gatewayInput, $customerId),
                'BOLETO' => $gateway->chargeViaBoleto($gatewayInput, $customerId),
                default => $gateway->charge($gatewayInput, $customerId),
            };

            // Cria o registro de pagamento alinhado com o schema real
            $payment = Payment::create([
                'uuid' => Str::uuid(),
                'transaction_id' => $transaction->id,
                'gateway_id' => $integration->gateway_id,
                'gateway_transaction_id' => $gatewayResponse['gatewayId'],
                'amount' => $transaction->amount,
                'payment_method' => $data['payment_method'],
                'status' => PaymentStatusMapper::mapStatus($gatewayResponse['status']),
                'pix_qrcode' => $gatewayResponse['qrCodeBase64'] ?? null,
                'pix_expires_at' => $gatewayResponse['expiresAt'] ?? null,
                'boleto_url' => $gatewayResponse['bankSlipUrl'] ?? null,
                'boleto_barcode' => $gatewayResponse['barcode'] ?? null,
                'gateway_response' => $gatewayResponse['raw'] ?? [],
                'paid_at' => PaymentStatusMapper::isPaid($gatewayResponse['status']) ? now() : null,
            ]);

            // Atualiza a transação
            $transaction->update([
                'status' => $payment->status,
                'payment_method' => $payment->payment_method,
                'asaas_payment_id' => $payment->gateway_transaction_id
            ]);

            return $payment->toArray();
        });
    }

    public function findByUuid(string $uuid, ?Integration $integration = null): ?Payment
    {
        $query = Payment::where('uuid', $uuid);
        if ($integration) {
            $query->where('gateway_id', $integration->gateway_id);
        }
        return $query->first();
    }

    public function getPixData(string $uuid, ?Integration $integration = null): ?array
    {
        $payment = $this->findByUuid($uuid, $integration);
        if (!$payment || $payment->payment_method !== 'pix') return null;

        return [
            'qrcode' => $payment->pix_qrcode,
            'expires_at' => $payment->pix_expires_at,
            'status' => $payment->status
        ];
    }

    public function getBoletoData(string $uuid, ?Integration $integration = null): ?array
    {
        $payment = $this->findByUuid($uuid, $integration);
        if (!$payment || $payment->payment_method !== 'boleto') return null;

        return [
            'url' => $payment->boleto_url,
            'barcode' => $payment->boleto_barcode,
            'status' => $payment->status
        ];
    }

    private function resolveGatewayCustomerId(Transaction $transaction, $gateway): string
    {
        // Se a transação já tem cliente no gateway, usa ele
        if ($transaction->customer_gateway_id) {
            return $transaction->customer_gateway_id;
        }

        // Caso contrário, cria um novo no gateway
        return $gateway->createCustomer([
            'name' => $transaction->customer_name,
            'email' => $transaction->customer_email,
            'document' => $transaction->customer_document,
            'phone' => $transaction->customer_phone,
        ]);
    }
}
