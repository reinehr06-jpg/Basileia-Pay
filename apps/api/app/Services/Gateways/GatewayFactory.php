<?php

namespace App\Services\Gateways;

use App\Services\Gateways\Contracts\GatewayProvider;
use App\Services\Gateways\Providers\AsaasProvider;
use App\Services\Gateways\Providers\StripeProvider;
use App\Services\Gateways\Providers\PagSeguroProvider;
use App\Models\GatewayAccount;

class GatewayFactory
{
    /**
     * Cria uma instância do provedor baseado na conta.
     */
    public function make(GatewayAccount $account): GatewayProvider
    {
        return match (strtolower($account->gateway_type)) {
            'asaas'     => new AsaasProvider(),
            'stripe'    => new StripeProvider(),
            'pagseguro' => new PagSeguroProvider(),
            default     => throw new \Exception("Provedor [{$account->gateway_type}] não suportado."),
        };
    }
}
