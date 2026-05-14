<?php

return [
    'default_gateway' => env('DEFAULT_GATEWAY', 'asaas'),
    'supported_currencies' => ['BRL', 'USD', 'EUR'],
    'default_currency' => 'BRL',
    'webhook_retry_max_attempts' => 5,
    'webhook_retry_backoff_seconds' => [30, 60, 300, 1800, 7200],
    'fraud_score_threshold_review' => 40,
    'fraud_score_threshold_reject' => 70,
    'max_transaction_amount' => 100000,
    'api_rate_limit_per_minute' => 60,
];
