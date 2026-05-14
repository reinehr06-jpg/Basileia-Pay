<?php

namespace App\Listeners;

use App\Events\PaymentApproved;
use App\Jobs\SendWebhookJob;

class DispatchWebhookOnPaymentApproved
{
    public function handle(PaymentApproved $event): void
    {
        $payment = $event->payment;
        $transaction = $payment->transaction;

        if (!$transaction || !$transaction->company_id) {
            return;
        }

        $payload = [
            'event' => 'payment.approved',
            'transaction' => [
                'uuid' => $transaction->uuid,
                'external_id' => $transaction->external_id,
                'amount' => $transaction->amount,
                'status' => 'approved',
                'payment_method' => $transaction->payment_method,
                'paid_at' => $payment->paid_at?->toIso8601String(),
            ],
            'payment' => [
                'uuid' => $payment->uuid,
                'gateway_payment_id' => $payment->gateway_payment_id,
                'amount' => $payment->amount,
            ],
        ];

        SendWebhookJob::dispatch('payment.approved', $payload, $transaction->company_id);
    }
}
