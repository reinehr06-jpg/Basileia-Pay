<?php

namespace App\Services\Monitoring;

use App\Models\CheckoutExperience;
use App\Models\CheckoutSession;
use App\Models\Payment;
use App\Services\Alerts\AlertService;
use Illuminate\Support\Facades\DB;

class CheckoutHealthService
{
    protected $alerts;

    public function __construct(AlertService $alerts)
    {
        $this->alerts = $alerts;
    }

    /**
     * Monitora todos os checkouts publicados.
     */
    public function monitor(): void
    {
        $experiences = CheckoutExperience::where('status', 'published')->get();

        foreach ($experiences as $experience) {
            $health = $this->calculateHealth($experience);
            $this->evaluateAlerts($experience, $health);
        }
    }

    /**
     * Calcula métricas de saúde de um checkout.
     */
    public function calculateHealth(CheckoutExperience $experience): array
    {
        $recentSessions = CheckoutSession::where('checkout_experience_id', $experience->id)
            ->where('created_at', '>=', now()->subHours(24))
            ->orderBy('created_at', 'desc')
            ->limit(500)
            ->get();

        $total = $recentSessions->count();

        if ($total < 5) {
            return [
                'total_sessions'    => $total,
                'sessions_paid'     => 0,
                'sessions_failed'   => 0,
                'sessions_open'     => 0,
                'sessions_expired'  => 0,
                'conversion_rate'   => null,
                'abandonment_rate'  => null,
                'payment_started'   => 0,
                'payment_approved'  => 0,
                'payment_failed'    => 0,
                'avg_time_to_pay'   => null,
                'errors_by_step'    => [],
                'method_breakdown'  => [],
            ];
        }

        $paidCount    = $recentSessions->whereIn('status', ['paid', 'completed'])->count();
        $failedCount  = $recentSessions->where('status', 'failed')->count();
        $openCount    = $recentSessions->where('status', 'open')->count();
        $expiredCount = $recentSessions->where('status', 'expired')->count();

        // Calcular conversão
        $conversionRate = round(($paidCount / $total) * 100, 1);

        // Calcular abandono (sessões que ficaram open + expired)
        $abandonedCount = $openCount + $expiredCount;
        $abandonmentRate = round(($abandonedCount / $total) * 100, 1);

        // Dados de pagamento por método
        $sessionIds = $recentSessions->pluck('id')->toArray();
        $payments = Payment::whereIn('checkout_session_id', $sessionIds)->get();

        $methodBreakdown = $payments->groupBy('method')->map(function ($group) {
            $total = $group->count();
            $approved = $group->whereIn('status', ['approved', 'paid'])->count();
            $failed   = $group->where('status', 'failed')->count();
            return [
                'total'         => $total,
                'approved'      => $approved,
                'failed'        => $failed,
                'conversion'    => $total > 0 ? round(($approved / $total) * 100, 1) : 0,
            ];
        })->toArray();

        return [
            'total_sessions'    => $total,
            'sessions_paid'     => $paidCount,
            'sessions_failed'   => $failedCount,
            'sessions_open'     => $openCount,
            'sessions_expired'  => $expiredCount,
            'conversion_rate'   => $conversionRate,
            'abandonment_rate'  => $abandonmentRate,
            'payment_started'   => $payments->count(),
            'payment_approved'  => $payments->whereIn('status', ['approved', 'paid'])->count(),
            'payment_failed'    => $payments->where('status', 'failed')->count(),
            'avg_time_to_pay'   => null, // Future: calcular com timestamps
            'errors_by_step'    => [], // Future: track step-level errors
            'method_breakdown'  => $methodBreakdown,
        ];
    }

    /**
     * Retorna a saúde de todos os checkouts de uma empresa.
     */
    public function getCompanyHealth(int $companyId): array
    {
        $experiences = CheckoutExperience::where('company_id', $companyId)->get();
        $results = [];

        foreach ($experiences as $experience) {
            $health = $this->calculateHealth($experience);
            $results[] = [
                'checkout_id' => $experience->id,
                'uuid'        => $experience->uuid,
                'name'        => $experience->name,
                'status'      => $experience->status,
                'health'      => $health,
            ];
        }

        return $results;
    }

    /**
     * Avalia regras e gera alertas.
     */
    protected function evaluateAlerts(CheckoutExperience $experience, array $health): void
    {
        // Regra 1: Conversão muito baixa (< 2%)
        if ($health['conversion_rate'] !== null && $health['conversion_rate'] < 2 && $health['total_sessions'] >= 20) {
            $this->alerts->trigger([
                'company_id'  => $experience->company_id,
                'severity'    => 'medium',
                'category'    => 'financial',
                'type'        => 'checkout_low_conversion',
                'title'       => 'Alerta de baixa conversão',
                'message'     => "O checkout [{$experience->name}] está com conversão de apenas {$health['conversion_rate']}% hoje ({$health['sessions_paid']}/{$health['total_sessions']} sessões).",
                'entity_type' => 'checkout_experience',
                'entity_id'   => $experience->uuid ?? (string) $experience->id,
                'source'      => 'checkout_health_monitor',
                'recommended_action' => 'Revise a copy, o tempo de carregamento, métodos de pagamento ou adicione mais provas sociais.',
                'metadata'    => [
                    'conversion_rate'  => $health['conversion_rate'],
                    'total_sessions'   => $health['total_sessions'],
                    'method_breakdown' => $health['method_breakdown'],
                ],
            ]);
        }

        // Regra 2: Alto abandono (> 80%)
        if ($health['abandonment_rate'] !== null && $health['abandonment_rate'] > 80 && $health['total_sessions'] >= 20) {
            $this->alerts->trigger([
                'company_id'  => $experience->company_id,
                'severity'    => 'high',
                'category'    => 'financial',
                'type'        => 'checkout_high_abandonment',
                'title'       => 'Alto índice de abandono no checkout',
                'message'     => "O checkout [{$experience->name}] tem {$health['abandonment_rate']}% de abandono nas últimas 24 horas.",
                'entity_type' => 'checkout_experience',
                'entity_id'   => $experience->uuid ?? (string) $experience->id,
                'source'      => 'checkout_health_monitor',
                'recommended_action' => 'Revise a experiência do checkout: formulários longos, falta de métodos de pagamento ou UX confusa podem causar abandono.',
            ]);
        }

        // Regra 3: Muitas falhas de pagamento no checkout
        if ($health['payment_failed'] > 10 && $health['payment_started'] > 0) {
            $failureRate = round(($health['payment_failed'] / $health['payment_started']) * 100, 1);
            if ($failureRate > 30) {
                $this->alerts->trigger([
                    'company_id'  => $experience->company_id,
                    'severity'    => 'high',
                    'category'    => 'financial',
                    'type'        => 'checkout_payment_failure',
                    'title'       => 'Alta taxa de falha de pagamento no checkout',
                    'message'     => "O checkout [{$experience->name}] tem {$failureRate}% de falha nos pagamentos iniciados.",
                    'entity_type' => 'checkout_experience',
                    'entity_id'   => $experience->uuid ?? (string) $experience->id,
                    'source'      => 'checkout_health_monitor',
                    'recommended_action' => 'Verifique se o gateway está funcionando corretamente e se os métodos de pagamento estão configurados.',
                ]);
            }
        }
    }
}
