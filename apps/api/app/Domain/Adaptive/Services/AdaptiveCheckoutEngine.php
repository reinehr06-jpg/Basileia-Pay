<?php

namespace App\Domain\Adaptive\Services;

use App\Models\AdaptiveCheckoutRule;
use App\Models\CheckoutSession;

class AdaptiveCheckoutEngine
{
    public function resolve(CheckoutSession $session, array $context): array
    {
        $rules = AdaptiveCheckoutRule::where('company_id', $session->company_id)
            ->where(fn($q) => $q->whereNull('system_id')->orWhere('system_id', $session->system_id))
            ->where('status', 'active')
            ->orderByDesc('priority')
            ->get();

        $decision = [
            'selectedMethod'    => $context['preferredMethod'] ?? 'pix',
            'prefillCustomer'   => $context['canPrefill'] ?? false,
            'collapseSummary'   => false,
            'showNarrative'     => false,
            'skipMethodSelector'=> false,
            'frictionLevel'     => 'normal',
            'prefillData'       => $context['prefillData'] ?? null,
        ];

        foreach ($rules as $rule) {
            if ($this->evaluateConditions($rule->conditions, $context, $session)) {
                $decision = array_merge($decision, $rule->actions);
            }
        }

        if ($session->amount >= 50000) {
            $decision['showNarrative'] = true;
        }

        return $decision;
    }

    private function evaluateConditions(array $conditions, array $ctx, CheckoutSession $session): bool
    {
        foreach ($conditions as $key => $value) {
            $passes = match($key) {
                'customer_purchases_gte' => ($ctx['profile']->total_purchases ?? 0) >= $value,
                'device_trusted'         => ($ctx['isTrustedDevice'] ?? false) === $value,
                'preferred_method'       => ($ctx['preferredMethod'] ?? 'pix') === $value,
                'risk_level'             => ($ctx['riskLevel'] ?? 'low') === $value,
                'amount_gte'             => $session->amount >= $value,
                default                  => true,
            };

            if (!$passes) return false;
        }
        return true;
    }
}
