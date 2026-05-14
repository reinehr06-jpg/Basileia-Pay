<?php

namespace App\Observers;

use App\Models\Payment;
use Illuminate\Support\Facades\Log;

class PaymentObserver
{
    public function created(Payment $payment): void
    {
        Log::debug('Payment created', [
            'payment_id' => $payment->id,
            'transaction_id' => $payment->transaction_id,
            'amount' => $payment->amount,
            'status' => $payment->status,
        ]);
    }

    public function updated(Payment $payment): void
    {
        $dirty = $payment->getDirty();

        if (isset($dirty['status'])) {
            Log::info('Payment status changed', [
                'payment_id' => $payment->id,
                'transaction_id' => $payment->transaction_id,
                'old_status' => $payment->getOriginal('status'),
                'new_status' => $dirty['status'],
            ]);
        }
    }
}