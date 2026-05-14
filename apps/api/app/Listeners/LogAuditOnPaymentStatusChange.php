<?php

namespace App\Listeners;

use App\Events\PaymentApproved;
use App\Events\PaymentRefused;
use App\Events\PaymentPending;
use App\Events\PaymentOverdue;
use App\Events\PaymentRefunded;
use App\Events\PaymentChargeback;
use App\Models\AuditLog;

class LogAuditOnPaymentStatusChange
{
    public function handle($event): void
    {
        $payment = $event->payment;
        $transaction = $payment->transaction;

        if (!$transaction) {
            return;
        }

        $eventType = match (true) {
            $event instanceof PaymentApproved => 'payment.approved',
            $event instanceof PaymentRefused => 'payment.refused',
            $event instanceof PaymentPending => 'payment.pending',
            $event instanceof PaymentOverdue => 'payment.overdue',
            $event instanceof PaymentRefunded => 'payment.refunded',
            $event instanceof PaymentChargeback => 'payment.chargeback',
            default => 'payment.unknown',
        };

        AuditLog::create([
            'company_id' => $transaction->company_id,
            'event_type' => $eventType,
            'auditable_type' => 'App\Models\Payment',
            'auditable_id' => $payment->id,
            'transaction_uuid' => $transaction->uuid,
            'data' => [
                'payment_uuid' => $payment->uuid,
                'gateway_payment_id' => $payment->gateway_payment_id,
                'amount' => $payment->amount,
                'status' => $payment->status,
            ],
        ]);
    }
}
