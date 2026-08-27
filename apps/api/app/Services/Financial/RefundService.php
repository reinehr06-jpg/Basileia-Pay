<?php

namespace App\Services\Financial;

use App\Models\Payment;
use App\Models\Refund;
use App\Models\FinancialAuditLog;
use Illuminate\Support\Facades\DB;
use Exception;

class RefundService
{
    public function __construct(private OrderStatusTransitionService $orderTransition) {}

    public function requestRefund(Payment $payment, int $amount, string $reason, int $actorId): Refund
    {
        $refund = DB::transaction(function () use ($payment, $amount, $reason, $actorId) {
            $payment = Payment::lockForUpdate()->find($payment->id);

            // Validar apenas paid. confirmed não é mais usado após a refatoração do PaymentService.
            if ($payment->status !== 'paid' && $payment->status !== 'underpaid') {
                throw new Exception('Apenas pagamentos processados (paid/underpaid) podem ser estornados.');
            }

            $refundedSoFar = $payment->refunds()->whereIn('status', ['completed', 'processing'])->sum('amount');
            if (($refundedSoFar + $amount) > $payment->amount) {
                throw new Exception('O valor de reembolso excede o valor disponível para estorno.');
            }

            $refund = Refund::create([
                'payment_id' => $payment->id,
                'amount' => $amount,
                'reason' => $reason,
                'status' => 'requested',
                'requested_by' => $actorId,
            ]);

            FinancialAuditLog::create([
                'entity_type' => 'refund',
                'entity_id' => $refund->id,
                'action' => 'refund_requested',
                'actor_id' => $actorId,
                'before_state' => null,
                'after_state' => $refund->toArray(),
            ]);
            
            return $refund;
        });

        // HTTP Call fora da transação de banco de dados
        $registry = app(\App\Services\Gateway\GatewayDriverRegistry::class);
        $gatewayAccount = clone $payment->gatewayAccount;
        $driver = $registry->resolve($gatewayAccount);
        $result = $driver->refund($payment->gateway_payment_id, $amount);

        DB::transaction(function () use ($refund, $result) {
            if ($result->success) {
                $this->completeRefund($refund);
            } else {
                $refund->update(['status' => 'failed', 'metadata' => ['error' => $result->errorMessage]]);
            }
        });

        return $refund->fresh();
    }

    public function completeRefund(Refund $refund): void
    {
        DB::transaction(function () use ($refund) {
            $refund = Refund::lockForUpdate()->find($refund->id);
            $beforeState = $refund->toArray();

            $refund->status = 'completed';
            $refund->save();

            FinancialAuditLog::create([
                'entity_type' => 'refund',
                'entity_id' => $refund->id,
                'action' => 'refund_completed',
                'before_state' => $beforeState,
                'after_state' => $refund->toArray(),
            ]);

            $payment = $refund->payment;
            $totalRefunded = $payment->refunds()->where('status', 'completed')->sum('amount');
            
            if ($totalRefunded >= $payment->amount) {
                $paymentBefore = $payment->toArray();
                $payment->status = 'refunded';
                $payment->save();

                FinancialAuditLog::create([
                    'entity_type' => 'payment',
                    'entity_id' => $payment->id,
                    'action' => 'payment_refunded',
                    'before_state' => $paymentBefore,
                    'after_state' => $payment->toArray(),
                ]);

                $this->orderTransition->transition($payment->order, 'refunded', $refund->requested_by);
            }
        });
    }
}
