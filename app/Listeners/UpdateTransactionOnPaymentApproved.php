<?php

namespace App\Listeners;

use App\Events\PaymentApproved;

class UpdateTransactionOnPaymentApproved
{
    public function handle(PaymentApproved $event): void
    {
        $payment = $event->payment;
        $transaction = $payment->transaction;

        if (!$transaction) {
            return;
        }

        $transaction->update([
            'status' => 'approved',
            'paid_at' => $payment->paid_at ?? now(),
        ]);
    }
}
