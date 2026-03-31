<?php

return [
    'asaas' => [
        'name' => 'Asaas',
        'class' => App\Services\Gateway\AsaasGateway::class,
        'api_key' => env('ASAAS_API_KEY'),
        'environment' => env('ASAAS_ENVIRONMENT', 'production'),
        'webhook_token' => env('ASAAS_WEBHOOK_TOKEN'),
        'base_url_production' => 'https://api.asaas.com/v3',
        'base_url_sandbox' => 'https://sandbox.asaas.com/api/v3',
    ],
];
