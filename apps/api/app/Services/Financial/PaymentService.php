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
        return DB::transaction(function () use ($order, $method, $idempotencyKey, $gatewayAccount) {
            $existing = Payment::where('idempotency_key', $idempotencyKey)->lockForUpdate()->first();
            if ($existing) {
                return $existing;
            }

            // Se o gatewayAccount não for fornecido, resolve o padrão da company
            if (!$gatewayAccount) {
                $gatewayAccount = GatewayAccount::where('company_id', $order->company_id)->firstOrFail();
            }

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

            FinancialAuditLog::create([
                'entity_type' => 'payment',
                'entity_id' => $payment->id,
                'action' => 'payment_created',
                'before_state' => null,
                'after_state' => $payment->toArray(),
            ]);

            // Avança pedido para pending/processing
            if ($order->status === 'created') {
                $this->orderTransition->transition($order, 'pending');
            }

            // Resolver e invocar o driver real do Gateway
            $registry = app(\App\Services\Gateway\GatewayDriverRegistry::class);
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

            return $payment;
        });
    }

    public function handleGatewayConfirmation(string $gatewayTransactionId, array $rawPayload): void
    {
        DB::transaction(function () use ($gatewayTransactionId, $rawPayload) {
            // Encontra pagamento pelo tx id externo e aplica lock (idempotência via DB lock)
            $payment = Payment::where('gateway_payment_id', $gatewayTransactionId)
                ->lockForUpdate()
                ->first();

            if (!$payment) {
                return; // Pagamento não encontrado
            }

            if ($payment->status === 'paid' || $payment->status === 'confirmed') {
                return; // Já processado
            }

            $beforeState = $payment->toArray();

            $payment->status = 'confirmed';
            $payment->paid_at = now();
            // Apenas adiciona ao array, sem sobrescrever
            $payment->gateway_response = array_merge($payment->gateway_response ?? [], ['confirmation_payload' => $rawPayload]);
            $payment->save();

            FinancialAuditLog::create([
                'entity_type' => 'payment',
                'entity_id' => $payment->id,
                'action' => 'payment_confirmed_via_webhook',
                'before_state' => $beforeState,
                'after_state' => $payment->toArray(),
            ]);

            // Avançar a Order
            $this->orderTransition->transition($payment->order, 'paid');
        });
    }
}
