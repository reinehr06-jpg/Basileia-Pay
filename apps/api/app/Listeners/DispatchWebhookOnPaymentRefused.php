<?php

namespace App\Listeners;

use App\Events\PaymentRefused;
use App\Jobs\SendWebhookJob;

class DispatchWebhookOnPaymentRefused
{
    public function handle(PaymentRefused $event): void
    {
        $payment = $event->payment;
        $transaction = $payment->transaction;

        if (!$transaction || !$transaction->company_id) {
            return;
        }

        $payload = [
            'event' => 'payment.refused',
            'transaction' => [
                'uuid' => $transaction->uuid,
                'external_id' => $transaction->external_id,
                'amount' => $transaction->amount,
                'status' => 'refused',
                'payment_method' => $transaction->payment_method,
            ],
            'payment' => [
                'uuid' => $payment->uuid,
                'gateway_payment_id' => $payment->gateway_payment_id,
                'amount' => $payment->amount,
                'refusal_reason' => $payment->refusal_reason,
            ],
        ];

        SendWebhookJob::dispatch('payment.refused', $payload, $transaction->company_id);
    }
}
