<?php

namespace App\Domain\Order\StateMachine;

use App\Models\Order;
use App\Domain\Payment\StateMachine\InvalidStateTransitionException;

class OrderStateMachine
{
    const TRANSITIONS = [
        'created'         => ['pending_payment', 'expired', 'cancelled'],
        'pending_payment' => ['paid', 'expired', 'failed', 'cancelled'],
        'paid'            => ['refunded'],
    ];

    public function transition(Order $order, string $to): void
    {
        $from    = $order->status;
        $allowed = self::TRANSITIONS[$from] ?? [];

        if (!in_array($to, $allowed)) {
            throw new InvalidStateTransitionException(
                "Transição de order inválida: {$from} → {$to}"
            );
        }

        $order->status = $to;
        $order->save();
    }
}
