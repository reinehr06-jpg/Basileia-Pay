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
        // Check idempotency
        $existing = Payment::where('idempotency_key', $idempotencyKey)->first();
        if ($existing) {
            return $existing;
        }

        return DB::transaction(function () use ($order, $method, $idempotencyKey, $gatewayAccount) {
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

            // TODO: Aqui integraríamos com o GatewayDriver::createCharge()
            // Simulando retorno do gateway:
            $payment->update([
                'status' => 'pending',
                'gateway_payment_id' => 'gw_txn_' . Str::random(10),
                'gateway_response' => ['simulated' => true, 'id' => 'gw_txn_' . Str::random(10)]
            ]);

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
