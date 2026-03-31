<?php

namespace App\Listeners;

use App\Events\PaymentRefunded;
use App\Jobs\SendWebhookJob;

class DispatchWebhookOnPaymentRefunded
{
    public function handle(PaymentRefunded $event): void
    {
        $payment = $event->payment;
        $transaction = $payment->transaction;

        if (!$transaction || !$transaction->company_id) {
            return;
        }

        $payload = [
            'event' => 'payment.refunded',
            'transaction' => [
                'uuid' => $transaction->uuid,
                'external_id' => $transaction->external_id,
                'amount' => $transaction->amount,
                'status' => 'refunded',
                'payment_method' => $transaction->payment_method,
            ],
            'payment' => [
                'uuid' => $payment->uuid,
                'gateway_payment_id' => $payment->gateway_payment_id,
                'amount' => $payment->amount,
                'refunded_amount' => $payment->refunded_amount,
            ],
        ];

        SendWebhookJob::dispatch('payment.refunded', $payload, $transaction->company_id);
    }
}
