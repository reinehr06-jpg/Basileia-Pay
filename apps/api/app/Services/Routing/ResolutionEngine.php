<?php

namespace App\Services\Routing;

use App\Models\ConnectedSystem;
use App\Models\CheckoutExperience;
use App\Models\GatewayAccount;

class ResolutionEngine
{
    /**
     * Resolve a configuração completa para uma nova sessão de checkout.
     */
    public function resolve(ConnectedSystem $system, array $payload = [])
    {
        // 1. Resolver Empresa
        $companyId = $system->company_id;

        // 2. Resolver Gateway Account
        // Padrão: Gateway padrão do sistema. 
        // V2: Regras de roteamento por valor, risco, etc.
        $gatewayAccount = $system->defaultGateway 
            ?? GatewayAccount::where('connected_system_id', $system->id)->where('is_default', true)->first();

        // 3. Resolver Checkout Experience
        // Padrão: Checkout padrão do sistema.
        $experience = $system->defaultCheckout 
            ?? CheckoutExperience::where('connected_system_id', $system->id)->where('active', true)->first();

        // 4. Resolver Versão Publicada
        $version = $experience ? $experience->publishedVersion : null;
        $config = $version ? $version->config_json : ($experience ? $experience->config : null);

        return [
            'company_id' => $companyId,
            'system_id' => $system->id,
            'gateway_account_id' => $gatewayAccount?->id,
            'checkout_experience_id' => $experience?->id,
            'checkout_experience_version_id' => $version?->id,
            'resolved_config' => $config,
        ];
    }
}
