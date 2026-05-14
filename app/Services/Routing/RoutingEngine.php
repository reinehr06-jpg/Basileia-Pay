<?php

namespace App\Services\Routing;

use App\Models\RoutingRule;
use App\Models\Gateway;

class RoutingEngine
{
    public function __construct(
        protected RoutingContext $context
    ) {}

    public function resolveGatewayModel(): ?Gateway
    {
        // 1. Buscar regras ativas da empresa ordenadas
        $rules = RoutingRule::where('company_id', $this->context->companyId)
            ->where('active', true)
            ->orderBy('priority')
            ->get();

        foreach ($rules as $rule) {
            if ($this->matches($rule->conditions)) {
                $gatewayId = $rule->action['gateway_id'] ?? null;
                if ($gatewayId) {
                    $gateway = Gateway::where('company_id', $this->context->companyId)
                        ->where('id', $gatewayId)
                        ->where('status', 'active')
                        ->first();

                    if ($gateway) {
                        // Salvar na engine qual regra foi usada para caso quisermos logar
                        $gateway->resolved_by_rule_id = $rule->id;
                        $gateway->fallback_gateway_ids = $rule->action['fallback_gateway_ids'] ?? [];
                        return $gateway;
                    }
                }
            }
        }

        // 2. Se nenhuma regra casar, usar o comportamento padrão
        return $this->defaultGateway();
    }

    protected function matches(array $conditions): bool
    {
        $c = $this->context;

        // countries
        if (!empty($conditions['countries'])) {
            if ($c->country === null || !in_array($c->country, $conditions['countries'], true)) {
                return false;
            }
        }

        // methods
        if (!empty($conditions['methods'])) {
            if (!in_array($c->paymentMethod, $conditions['methods'], true)) {
                return false;
            }
        }

        // amount_min
        if (isset($conditions['amount_min']) && $c->amount < $conditions['amount_min']) {
            return false;
        }

        // amount_max
        if (isset($conditions['amount_max']) && $c->amount > $conditions['amount_max']) {
            return false;
        }

        // integration_ids
        if (!empty($conditions['integration_ids'])) {
            if ($c->integrationId === null || !in_array($c->integrationId, $conditions['integration_ids'], true)) {
                return false;
            }
        }

        // bin_prefixes
        if (!empty($conditions['bin_prefixes']) && $c->bin !== null) {
            $ok = false;
            foreach ($conditions['bin_prefixes'] as $prefix) {
                if (str_starts_with($c->bin, (string) $prefix)) {
                    $ok = true;
                    break;
                }
            }
            if (!$ok) return false;
        }

        return true;
    }

    protected function defaultGateway(): ?Gateway
    {
        // Prioridade: gateway default da empresa, senão qualquer ativo
        return Gateway::where('company_id', $this->context->companyId)
            ->where('is_default', true)
            ->where('status', 'active')
            ->first()
            ?? Gateway::where('company_id', $this->context->companyId)
                ->where('status', 'active')
                ->first();
    }
}
