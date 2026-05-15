<?php

namespace App\Domain\Payment\StateMachine;

use App\Models\Payment;
use App\Models\PaymentEvent;
use RuntimeException;

class InvalidStateTransitionException extends RuntimeException
{
}

class PaymentStateMachine
{
    const TRANSITIONS = [
        'pending'    => ['processing', 'expired', 'failed'],
        'processing' => ['approved', 'refused', 'failed'],
        'approved'   => ['refunded'],
        // refused, failed, expired, refunded → terminais
    ];

    public function transition(Payment $payment, string $to): void
    {
        $from    = $payment->status;
        $allowed = self::TRANSITIONS[$from] ?? [];

        if (!in_array($to, $allowed)) {
            // Auditar tentativa inválida
            PaymentEvent::create([
                'payment_id'  => $payment->id,
                'event_type'  => 'invalid_transition_attempt',
                'from_status' => $from,
                'to_status'   => $to,
                'occurred_at' => now(),
            ]);

            throw new InvalidStateTransitionException(
                "Transição inválida: {$from} → {$to}"
            );
        }

        $payment->status = $to;
        $payment->save();

        PaymentEvent::create([
            'payment_id'  => $payment->id,
            'event_type'  => "status.{$to}",
            'from_status' => $from,
            'to_status'   => $to,
            'occurred_at' => now(),
        ]);
    }
}
