<?php

return [
    'retry_max_attempts' => env('WEBHOOK_RETRY_MAX', 5),
    'retry_backoff' => [30, 60, 300, 1800, 7200],
    'timeout_seconds' => 30,
    'signature_header' => 'X-Checkout-Signature',
    'event_types' => [
        'payment.approved',
        'payment.refused',
        'payment.pending',
        'payment.overdue',
        'payment.refunded',
        'payment.chargeback',
        'boleto.generated',
        'pix.generated',
        'subscription.created',
        'subscription.cancelled',
        'subscription.renewed',
    ],
];
