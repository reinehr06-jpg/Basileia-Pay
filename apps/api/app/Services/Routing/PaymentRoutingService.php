<?php

namespace App\Services\Routing;

use App\Models\GatewayAccount;
use App\Models\Payment;
use App\Models\RoutingDecision;
use App\Models\RoutingRule;
use Illuminate\Support\Facades\DB;

class PaymentRoutingService
{
    public function resolve(int $companyId, string $method, string $environment = 'production', array $extra = []): array
    {
        // 1. Check routing rules first
        $rule = RoutingRule::where('company_id', $companyId)
            ->where('method', $method)
            ->where('environment', $environment)
            ->where('active', true)
            ->orderBy('priority', 'asc')
            ->first();

        if ($rule && $rule->primary_gateway_id) {
            $primary = GatewayAccount::where('id', $rule->primary_gateway_id)->active()->first();
            $fallback = $rule->fallback_gateway_id ? GatewayAccount::where('id', $rule->fallback_gateway_id)->active()->first() : null;

            if ($primary) {
                $approvalRate = $this->getApprovalRate($primary->id, $method);

                // Auto-fallback if approval rate is too low
                if ($approvalRate !== null && $approvalRate < 50 && $fallback) {
                    $result = [
                        'chosen_gateway' => $fallback,
                        'fallback' => $primary,
                        'reason' => "Gateway [{$primary->name}] com taxa {$approvalRate}% para {$method}. Fallback [{$fallback->name}] acionado.",
                        'decision' => 'fallback_activated',
                        'approval_rate' => $approvalRate,
                        'strategy' => $rule->strategy,
                        'rule_id' => $rule->id,
                    ];
                    $this->logDecision($companyId, $method, $environment, $result, $extra);
                    return $result;
                }

                $result = [
                    'chosen_gateway' => $primary,
                    'fallback' => $fallback,
                    'reason' => "Gateway [{$primary->name}] configurado como principal para {$method} via regra de roteamento.",
                    'decision' => 'primary',
                    'approval_rate' => $approvalRate,
                    'strategy' => $rule->strategy,
                    'rule_id' => $rule->id,
                ];
                $this->logDecision($companyId, $method, $environment, $result, $extra);
                return $result;
            }
        }

        // 2. Fallback to priority-based routing
        $gateways = GatewayAccount::where('company_id', $companyId)
            ->where('status', 'active')
            ->where('environment', $environment)
            ->orderBy('priority', 'asc')
            ->get();

        $primary = $gateways->first();
        $fallback = $gateways->skip(1)->first();

        if (!$primary) {
            return [
                'chosen_gateway' => null,
                'fallback' => null,
                'reason' => 'Nenhum gateway ativo encontrado para ' . $environment,
                'decision' => 'blocked',
                'approval_rate' => null,
                'strategy' => 'none',
                'rule_id' => null,
            ];
        }

        $approvalRate = $this->getApprovalRate($primary->id, $method);

        if ($approvalRate !== null && $approvalRate < 50 && $fallback) {
            $result = [
                'chosen_gateway' => $fallback,
                'fallback' => $primary,
                'reason' => "Gateway [{$primary->name}] com taxa {$approvalRate}%. Fallback [{$fallback->name}] acionado automaticamente.",
                'decision' => 'fallback_activated',
                'approval_rate' => $approvalRate,
                'strategy' => 'auto_priority',
                'rule_id' => null,
            ];
            $this->logDecision($companyId, $method, $environment, $result, $extra);
            return $result;
        }

        $result = [
            'chosen_gateway' => $primary,
            'fallback' => $fallback,
            'reason' => "Gateway [{$primary->name}] ativo com maior prioridade para {$method}.",
            'decision' => 'primary',
            'approval_rate' => $approvalRate,
            'strategy' => 'auto_priority',
            'rule_id' => null,
        ];
        $this->logDecision($companyId, $method, $environment, $result, $extra);
        return $result;
    }

    public function getRecommendedMethod(int $companyId, string $environment = 'production'): array
    {
        $rule = RoutingRule::where('company_id', $companyId)
            ->where('environment', $environment)
            ->where('recommended', true)
            ->where('active', true)
            ->first();

        if ($rule) {
            return [
                'recommended_payment_method' => $rule->method,
                'reason' => "Configurado manualmente como método recomendado.",
                'source' => 'routing_rules',
                'override' => true,
            ];
        }

        // Auto-detect best method
        $methods = ['pix', 'card', 'boleto'];
        $best = null;
        $bestRate = -1;

        foreach ($methods as $method) {
            $rate = $this->getMethodApprovalRate($companyId, $method, $environment);
            if ($rate !== null && $rate > $bestRate) {
                $bestRate = $rate;
                $best = $method;
            }
        }

        return [
            'recommended_payment_method' => $best ?? 'pix',
            'reason' => $best ? "Maior taxa de aprovação ({$bestRate}%) nas últimas 24h." : 'PIX selecionado como padrão (sem dados suficientes).',
            'source' => $best ? 'data_driven' : 'default',
            'override' => false,
        ];
    }

    protected function getApprovalRate(int $gatewayAccountId, string $method): ?float
    {
        $payments = Payment::where('gateway_account_id', $gatewayAccountId)
            ->where('method', $method)
            ->where('created_at', '>=', now()->subDay())
            ->select('status', DB::raw('count(*) as total'))
            ->groupBy('status')
            ->get();

        $total = $payments->sum('total');
        if ($total < 5) return null;

        $approved = $payments->whereIn('status', ['approved', 'paid'])->sum('total');
        return round(($approved / $total) * 100, 1);
    }

    protected function getMethodApprovalRate(int $companyId, string $method, string $environment): ?float
    {
        $payments = Payment::where('company_id', $companyId)
            ->where('method', $method)
            ->where('created_at', '>=', now()->subDay())
            ->select('status', DB::raw('count(*) as total'))
            ->groupBy('status')
            ->get();

        $total = $payments->sum('total');
        if ($total < 5) return null;

        $approved = $payments->whereIn('status', ['approved', 'paid'])->sum('total');
        return round(($approved / $total) * 100, 1);
    }

    protected function logDecision(int $companyId, string $method, string $env, array $result, array $extra): void
    {
        RoutingDecision::create([
            'company_id' => $companyId,
            'method' => $method,
            'environment' => $env,
            'chosen_gateway_id' => $result['chosen_gateway']?->id,
            'fallback_gateway_id' => $result['fallback']?->id,
            'decision' => $result['decision'],
            'reason' => $result['reason'],
            'approval_rate' => $result['approval_rate'],
            'trust_score' => $extra['trust_score'] ?? null,
            'amount' => $extra['amount'] ?? null,
            'checkout_id' => $extra['checkout_id'] ?? null,
        ]);
    }
}
