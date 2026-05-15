<?php

namespace App\Domain\Gateway\Services;

use App\Models\GatewayAccount;
use App\Models\Company;
use RuntimeException;

class GatewayResolver
{
    public function resolve(Company $company, string $method): GatewayAccount
    {
        // Simple logic for now: return first active gateway that supports the method (we don't filter by method here for simplicity, but could be added).
        $gateway = GatewayAccount::where('company_id', $company->id)
            ->where('status', 'active')
            ->orderBy('priority', 'asc')
            ->first();

        if (!$gateway) {
            throw new RuntimeException("Nenhum gateway configurado para o método {$method}.");
        }

        return $gateway;
    }

    public function resolveOrFail(Company $company, string $method): GatewayAccount
    {
        return $this->resolve($company, $method);
    }
}
