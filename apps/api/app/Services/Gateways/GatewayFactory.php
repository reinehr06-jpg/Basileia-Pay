<?php

namespace App\Services\Gateways;

use App\Services\Gateways\Contracts\GatewayProvider;
use App\Services\Gateways\Providers\AsaasProvider;
use App\Models\GatewayAccount;

class GatewayFactory
{
    /**
     * Cria uma instância do provedor baseado na conta.
     */
    public function make(GatewayAccount $account): GatewayProvider
    {
        switch ($account->gateway_type) {
            case 'asaas':
                return new AsaasProvider();
            
            default:
                throw new \Exception("Provedor [{$account->gateway_type}] não suportado.");
        }
    }
}
