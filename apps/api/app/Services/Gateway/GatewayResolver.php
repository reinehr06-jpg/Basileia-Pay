<?php

declare(strict_types=1);

namespace App\Services\Gateway;

use App\Models\Company;
use App\Models\Checkout;
use App\Models\GatewayAccount;
use App\Models\RoutingRule;

class GatewayResolver
{
    /**
     * Resolve the best GatewayAccount to use for this transaction.
     */
    public function resolve(Company $company, ?Checkout $checkout = null, array $context = []): ?GatewayAccount
    {
        // 1. Check checkout preference (if config has preferred gateway)
        if ($checkout && isset($checkout->config['preferred_gateway_id'])) {
            $prefId = $checkout->config['preferred_gateway_id'];
            $pref = GatewayAccount::where('company_id', $company->id)
                ->where('id', $prefId)
                ->active()
                ->first();
            if ($pref) {
                return $pref;
            }
        }

        // 2. Check Routing Rules based on context (e.g., payment method)
        $method = $context['payment_method'] ?? null;
        if ($method) {
            $rule = RoutingRule::where('company_id', $company->id)
                ->where('active', true)
                ->forMethod($method)
                ->orderBy('priority', 'desc')
                ->first();

            if ($rule) {
                if ($rule->primaryGateway && $rule->primaryGateway->status === 'active') {
                    return $rule->primaryGateway;
                }
                if ($rule->fallbackGateway && $rule->fallbackGateway->status === 'active') {
                    return $rule->fallbackGateway;
                }
            }
        }

        // 3. Fallback to default gateway of the company (highest priority)
        return GatewayAccount::where('company_id', $company->id)
            ->active()
            ->orderBy('priority', 'desc')
            ->first();
    }
}