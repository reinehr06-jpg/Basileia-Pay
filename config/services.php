<?php

return [
    'asaas' => [
        'api_key' => env('ASAAS_API_KEY'),
        'environment' => env('ASAAS_ENVIRONMENT', env('APP_ENV', 'sandbox')),
        'webhook_token' => env('ASAAS_WEBHOOK_TOKEN'),
        'base_url_production' => 'https://api.asaas.com/v3',
        'base_url_sandbox' => 'https://sandbox.asaas.com/api/v3',
    ],
    'stripe' => [
        'key' => env('STRIPE_KEY'),
        'secret' => env('STRIPE_SECRET'),
        'environment' => env('APP_ENV', 'sandbox'),
    ],
    'square' => [
        'access_token' => env('SQUARE_ACCESS_TOKEN'),
        'location_id' => env('SQUARE_LOCATION_ID'),
        'environment' => env('APP_ENV', 'sandbox'),
    ],
    'mercado_pago' => [
        'access_token' => env('MERCADOPAGO_ACCESS_TOKEN'),
        'environment' => env('APP_ENV', 'sandbox'),
    ],
    'openai' => [
        'key' => env('OPENAI_API_KEY'),
    ],
];
