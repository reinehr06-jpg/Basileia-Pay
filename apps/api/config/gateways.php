<?php

/**
 * Configuração de gateways.
 *
 * IMPORTANTE: Credenciais de gateway (api_key, webhook_token, etc.)
 * agora são gerenciadas via banco de dados (tabela gateway_configs)
 * e criptografadas com Crypt::encryptString().
 *
 * Este arquivo mantém apenas configurações ESTÁTICAS (URLs base, etc.)
 * que não mudam entre tenants.
 *
 * Para credenciais de tenant, use:
 *   $gateway->getConfig('api_key')
 *   $gateway->getConfig('webhook_token')
 */

return [
    'asaas' => [
        'base_url_production' => 'https://api.asaas.com/v3',
        'base_url_sandbox'    => 'https://sandbox.asaas.com/api/v3',

        // Webhook IP whitelist (IPs fixos do Asaas para validação)
        'webhook_ip_whitelist' => env('ASAAS_WEBHOOK_IP_WHITELIST', ''),
    ],

    'pagbank' => [
        'base_url_production' => 'https://api.pagseguro.com',
        'base_url_sandbox'    => 'https://sandbox.api.pagseguro.com',
    ],
];
