<?php

namespace App\Services\Financial;

use App\Models\Order;
use App\Models\Payment;
use App\Models\GatewayAccount;
use App\Models\FinancialAuditLog;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

class PaymentService
{
    public function __construct(private OrderStatusTransitionService $orderTransition) {}

    public function createPayment(Order $order, string $method, string $idempotencyKey, ?GatewayAccount $gatewayAccount = null): Payment
    {
        // 1. Fase de persistência no DB (curta, segura, trata concorrência via unique key)
        $payment = DB::transaction(function () use ($order, $method, $idempotencyKey, $gatewayAccount) {
            if (!$gatewayAccount) {
                $gatewayAccount = GatewayAccount::where('company_id', $order->company_id)->firstOrFail();
            }

            try {
                $payment = Payment::create([
                    'uuid' => Str::uuid(),
                    'company_id' => $order->company_id,
                    'order_id' => $order->id,
                    'gateway_account_id' => $gatewayAccount->id,
                    'gateway_id' => $gatewayAccount->gateway_id,
                    'method' => $method,
                    'status' => 'created',
                    'amount' => $order->amount,
                    'currency' => $order->currency,
                    'idempotency_key' => $idempotencyKey,
                ]);
            } catch (\Illuminate\Database\QueryException $e) {
                // Violação de constraint unique (Postgres 23505, MySQL 1062)
                if (in_array($e->errorInfo[0] ?? '', ['23505', '1062']) || in_array($e->errorInfo[1] ?? '', [1062])) {
                    return Payment::where('company_id', $order->company_id)
                        ->where('idempotency_key', $idempotencyKey)
                        ->firstOrFail();
                }
                throw $e;
            }

            FinancialAuditLog::create([
                'entity_type' => 'payment',
                'entity_id' => $payment->id,
                'action' => 'payment_created',
                'before_state' => null,
                'after_state' => $payment->toArray(),
            ]);

            if ($order->status === 'created') {
                $this->orderTransition->transition($order, 'pending');
            }

            return $payment;
        });

        // Se o pagamento já existir (veio do catch constraint unique), retorna imediatamente 
        // e não chama o HTTP de novo se não estiver como 'created'
        if (!$payment->wasRecentlyCreated && $payment->status !== 'created') {
            return $payment;
        }

        // 2. Chamada HTTP ao Gateway FORA da transação de banco de dados (F4)
        $registry = app(\App\Services\Gateway\GatewayDriverRegistry::class);
        $gatewayAccount = $gatewayAccount ?? GatewayAccount::find($payment->gateway_account_id);
        $driver = $registry->resolve($gatewayAccount);

        $chargeRequest = new \App\Services\Gateway\DTO\ChargeRequest(
            amount: $order->amount,
            paymentMethod: $method,
            customer: [
                'name' => $order->customer_name,
                'email' => $order->customer_email,
                'document' => $order->customer_document,
                'asaas_customer_id' => $order->metadata['asaas_customer_id'] ?? null,
            ],
            reference: (string)$order->uuid
        );

        $response = $driver->createCharge($chargeRequest);

        // 3. Atualiza estado de acordo com o retorno HTTP
        DB::transaction(function () use ($payment, $response, $order) {
            if ($response->success) {
                $payment->update([
                    'status' => 'pending',
                    'gateway_payment_id' => $response->gatewayPaymentId,
                    'gateway_response' => array_merge($response->rawResponse ?? [], [
                        'pix_qr_code' => $response->pixQrCodeUrl
                    ])
                ]);
            } else {
                $payment->update([
                    'status' => 'failed',
                    'gateway_response' => [
                        'error_message' => $response->errorMessage,
                        'raw_response' => $response->rawResponse ?? []
                    ]
                ]);
                $this->orderTransition->transition($order, 'failed');
            }
        });

        return $payment;
    }

    public function handleGatewayConfirmation(string $gatewayTransactionId, array $rawPayload, ?int $paidAmount = null): void
    {
        DB::transaction(function () use ($gatewayTransactionId, $rawPayload, $paidAmount) {
            $payment = Payment::where('gateway_payment_id', $gatewayTransactionId)
                ->lockForUpdate()
                ->first();

            if (!$payment || in_array($payment->status, ['paid', 'underpaid', 'refunded'])) {
                return;
            }

            $beforeState = $payment->toArray();

            // F8 - Validação de valor reportado
            $status = 'paid';
            if ($paidAmount !== null && $paidAmount < $payment->amount) {
                $status = 'underpaid';
            }

            $payment->status = $status;
            $payment->paid_at = now();
            $payment->gateway_response = array_merge($payment->gateway_response ?? [], ['confirmation_payload' => $rawPayload]);
            $payment->save();

            FinancialAuditLog::create([
                'entity_type' => 'payment',
                'entity_id' => $payment->id,
                'action' => 'payment_confirmed_via_webhook',
                'before_state' => $beforeState,
                'after_state' => $payment->toArray(),
            ]);

            $this->orderTransition->transition($payment->order, $status === 'underpaid' ? 'review' : 'paid');
        });
    }
}
