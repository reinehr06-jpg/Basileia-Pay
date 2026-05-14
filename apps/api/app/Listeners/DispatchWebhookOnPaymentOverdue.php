<?php

namespace App\Listeners;

use App\Events\PaymentOverdue;
use App\Jobs\SendWebhookJob;

class DispatchWebhookOnPaymentOverdue
{
    public function handle(PaymentOverdue $event): void
    {
        $payment = $event->payment;
        $transaction = $payment->transaction;

        if (!$transaction || !$transaction->company_id) {
            return;
        }

        $payload = [
            'event' => 'payment.overdue',
            'transaction' => [
                'uuid' => $transaction->uuid,
                'external_id' => $transaction->external_id,
                'amount' => $transaction->amount,
                'status' => 'overdue',
                'payment_method' => $transaction->payment_method,
            ],
            'payment' => [
                'uuid' => $payment->uuid,
                'gateway_payment_id' => $payment->gateway_payment_id,
                'amount' => $payment->amount,
                'due_date' => $payment->due_date?->toIso8601String(),
            ],
        ];

        SendWebhookJob::dispatch('payment.overdue', $payload, $transaction->company_id);
    }
}
