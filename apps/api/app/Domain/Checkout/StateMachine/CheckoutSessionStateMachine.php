<?php

namespace App\Domain\Checkout\StateMachine;

use App\Models\CheckoutSession;
use App\Domain\Payment\StateMachine\InvalidStateTransitionException;

class CheckoutSessionStateMachine
{
    const TRANSITIONS = [
        'created'    => ['open', 'expired'],
        'open'       => ['processing', 'expired'],
        'processing' => ['paid', 'failed'],
    ];

    public function transition(CheckoutSession $session, string $to): void
    {
        $from    = $session->status;
        $allowed = self::TRANSITIONS[$from] ?? [];

        if (!in_array($to, $allowed)) {
            throw new InvalidStateTransitionException(
                "Transição de checkout session inválida: {$from} → {$to}"
            );
        }

        $session->status = $to;
        $session->save();
    }
}
