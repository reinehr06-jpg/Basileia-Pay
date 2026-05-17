<?php

namespace App\Services\Monitoring;

use App\Models\GatewayAccount;
use App\Models\GatewayHealthSnapshot;
use App\Models\Payment;
use App\Models\PaymentAttempt;
use App\Services\Alerts\AlertService;
use Illuminate\Support\Facades\DB;

class GatewayHealthService
{
    protected $alerts;

    public function __construct(AlertService $alerts)
    {
        $this->alerts = $alerts;
    }

    /**
     * Monitora todos os gateways ativos.
     */
    public function monitor(): void
    {
        $accounts = GatewayAccount::where('status', 'active')->get();

        foreach ($accounts as $account) {
            $health = $this->calculateHealth($account);
            $this->saveSnapshot($account, $health);
            $this->evaluateAlerts($account, $health);
        }
    }

    /**
     * Calcula a saúde de um gateway específico.
     */
    public function calculateHealth(GatewayAccount $account): array
    {
        $recentPayments = Payment::where('gateway_account_id', $account->id)
            ->where('created_at', '>=', now()->subHours(6))
            ->orderBy('created_at', 'desc')
            ->limit(200)
            ->get();

        $total = $recentPayments->count();

        if ($total < 5) {
            return [
                'approval_rate'       => null,
                'failure_rate'        => null,
                'avg_latency_ms'      => null,
                'timeout_count'       => 0,
                'fallback_count'      => 0,
                'total_transactions'  => $total,
                'last_approved_at'    => null,
                'last_failed_at'      => null,
                'methods'             => [],
            ];
        }

        $approvedCount = $recentPayments->whereIn('status', ['approved', 'paid'])->count();
        $failedCount   = $recentPayments->where('status', 'failed')->count();

        // Calcular métricas por método
        $methods = $recentPayments->groupBy('method')->map(function ($group) {
            $total = $group->count();
            $approved = $group->whereIn('status', ['approved', 'paid'])->count();
            $failed   = $group->where('status', 'failed')->count();
            return [
                'total'         => $total,
                'approved'      => $approved,
                'failed'        => $failed,
                'approval_rate' => $total > 0 ? round(($approved / $total) * 100, 1) : null,
                'failure_rate'  => $total > 0 ? round(($failed / $total) * 100, 1) : null,
            ];
        })->toArray();

        // Último pagamento aprovado e último falhado
        $lastApproved = $recentPayments->whereIn('status', ['approved', 'paid'])->first();
        $lastFailed   = $recentPayments->where('status', 'failed')->first();

        // Contar timeouts (pagamentos que ficaram pending por muito tempo)
        $timeoutCount = $recentPayments
            ->where('status', 'pending')
            ->where('created_at', '<=', now()->subMinutes(30))
            ->count();

        return [
            'approval_rate'       => round(($approvedCount / $total) * 100, 1),
            'failure_rate'        => round(($failedCount / $total) * 100, 1),
            'avg_latency_ms'      => null, // Future: calcular com timestamps de attempt
            'timeout_count'       => $timeoutCount,
            'fallback_count'      => 0, // Future: contar routing_decisions com decision=fallback_activated
            'total_transactions'  => $total,
            'last_approved_at'    => $lastApproved?->paid_at ?? $lastApproved?->created_at,
            'last_failed_at'      => $lastFailed?->created_at,
            'methods'             => $methods,
        ];
    }

    /**
     * Retorna a saúde de todos os gateways de uma empresa.
     */
    public function getCompanyHealth(int $companyId): array
    {
        $accounts = GatewayAccount::where('company_id', $companyId)->get();
        $results = [];

        foreach ($accounts as $account) {
            $health = $this->calculateHealth($account);
            $results[] = [
                'gateway_id'  => $account->id,
                'provider'    => $account->provider ?? $account->gateway_type,
                'name'        => $account->name,
                'environment' => $account->environment,
                'status'      => $account->status,
                'priority'    => $account->priority,
                'health'      => $health,
            ];
        }

        return $results;
    }

    /**
     * Salva snapshot de saúde.
     */
    protected function saveSnapshot(GatewayAccount $account, array $health): void
    {
        GatewayHealthSnapshot::create([
            'company_id'          => $account->company_id,
            'gateway_account_id'  => $account->id,
            'approval_rate'       => $health['approval_rate'],
            'failure_rate'        => $health['failure_rate'],
            'avg_latency_ms'      => $health['avg_latency_ms'],
            'timeout_count'       => $health['timeout_count'],
            'fallback_count'      => $health['fallback_count'],
            'total_transactions'  => $health['total_transactions'],
            'last_approved_at'    => $health['last_approved_at'],
            'last_failed_at'      => $health['last_failed_at'],
            'period'              => 'hourly',
        ]);
    }

    /**
     * Avalia regras e gera alertas.
     */
    protected function evaluateAlerts(GatewayAccount $account, array $health): void
    {
        $provider = $account->provider ?? $account->gateway_type ?? $account->name;

        // Regra 1: Taxa de aprovação baixa (cartão)
        if ($health['approval_rate'] !== null && $health['approval_rate'] < 60) {
            $this->alerts->trigger([
                'company_id'  => $account->company_id,
                'severity'    => $health['approval_rate'] < 40 ? 'critical' : 'medium',
                'category'    => 'financial',
                'type'        => 'gateway_low_approval_rate',
                'title'       => 'Queda na taxa de aprovação',
                'message'     => "A conta [{$provider}] apresenta apenas {$health['approval_rate']}% de aprovação nas últimas {$health['total_transactions']} tentativas.",
                'entity_type' => 'gateway_account',
                'entity_id'   => $account->uuid ?? (string) $account->id,
                'source'      => 'gateway_health_monitor',
                'recommended_action' => 'Verifique se há muitas recusas por antifraude ou problemas técnicos com o processador.',
                'metadata'    => [
                    'approval_rate'  => $health['approval_rate'],
                    'methods'        => $health['methods'],
                ],
            ]);
        }

        // Regra 2: Muitos timeouts
        if ($health['timeout_count'] >= 5) {
            $this->alerts->trigger([
                'company_id'  => $account->company_id,
                'severity'    => $health['timeout_count'] >= 15 ? 'critical' : 'high',
                'category'    => 'technical',
                'type'        => 'gateway_timeout',
                'title'       => 'Gateway com pagamentos travados',
                'message'     => "A conta [{$provider}] possui {$health['timeout_count']} pagamentos pendentes há mais de 30 minutos.",
                'entity_type' => 'gateway_account',
                'entity_id'   => $account->uuid ?? (string) $account->id,
                'source'      => 'gateway_health_monitor',
                'recommended_action' => 'Verifique a disponibilidade do gateway e confirme o status dos pagamentos diretamente no provedor.',
            ]);
        }

        // Regra 3: Alta taxa de falha geral
        if ($health['failure_rate'] !== null && $health['failure_rate'] > 40) {
            $this->alerts->trigger([
                'company_id'  => $account->company_id,
                'severity'    => $health['failure_rate'] > 60 ? 'critical' : 'high',
                'category'    => 'financial',
                'type'        => 'gateway_high_failure_rate',
                'title'       => 'Alta taxa de falha no gateway',
                'message'     => "A conta [{$provider}] está com {$health['failure_rate']}% de falha nas últimas 6 horas.",
                'entity_type' => 'gateway_account',
                'entity_id'   => $account->uuid ?? (string) $account->id,
                'source'      => 'gateway_health_monitor',
                'recommended_action' => 'Considere ativar o gateway de fallback e investigar a causa das falhas.',
            ]);
        }
    }
}
