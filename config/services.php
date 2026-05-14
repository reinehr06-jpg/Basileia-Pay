<?php

/**
 * Serviços Externos.
 *
 * NOTA: Credenciais de gateways de pagamento (Asaas, PagBank, etc.)
 * são gerenciadas via banco de dados (tabela gateway_configs),
 * criptografadas com Crypt::encryptString().
 *
 * Este arquivo mantém apenas configurações estáticas e
 * chaves de serviços que NÃO são multi-tenant (ex: OpenAI).
 *
 * As seções de gateway abaixo são mantidas apenas como
 * fallback para webhooks que validam IP whitelist.
 * NÃO armazene api_key de gateways aqui.
 */

return [
    'asaas' => [
        // URLs base — usadas como referência estática
        'base_url_production'  => 'https://api.asaas.com/v3',
        'base_url_sandbox'     => 'https://sandbox.asaas.com/api/v3',
        'environment'          => env('APP_ENV', 'sandbox'),

        // IP whitelist do Asaas para validação de webhooks
        'webhook_ip_whitelist' => env('ASAAS_WEBHOOK_IP_WHITELIST', ''),
    ],

    'stripe' => [
        'key'         => env('STRIPE_KEY'),
        'secret'      => env('STRIPE_SECRET'),
        'environment' => env('APP_ENV', 'sandbox'),
    ],

    'square' => [
        'access_token' => env('SQUARE_ACCESS_TOKEN'),
        'location_id'  => env('SQUARE_LOCATION_ID'),
        'environment'  => env('APP_ENV', 'sandbox'),
    ],

    'mercado_pago' => [
        'access_token' => env('MERCADOPAGO_ACCESS_TOKEN'),
        'environment'  => env('APP_ENV', 'sandbox'),
    ],

    'openai' => [
        'key' => env('OPENAI_API_KEY'),
    ],
];
