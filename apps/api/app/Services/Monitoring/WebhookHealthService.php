<?php

namespace App\Services\Monitoring;

use App\Models\WebhookDelivery;
use App\Models\WebhookEndpoint;
use App\Models\WebhookHealthSnapshot;
use App\Services\Alerts\AlertService;
use Illuminate\Support\Facades\DB;

class WebhookHealthService
{
    protected $alerts;

    public function __construct(AlertService $alerts)
    {
        $this->alerts = $alerts;
    }

    /**
     * Analisa a saúde dos endpoints de webhook e gera alertas se necessário.
     */
    public function monitor(): void
    {
        $endpoints = WebhookEndpoint::where('status', 'active')->get();

        foreach ($endpoints as $endpoint) {
            $health = $this->calculateHealth($endpoint);
            $this->saveSnapshot($endpoint, $health);
            $this->evaluateAlerts($endpoint, $health);
        }
    }

    /**
     * Calcula métricas de saúde para um endpoint.
     */
    public function calculateHealth(WebhookEndpoint $endpoint): array
    {
        $recentDeliveries = WebhookDelivery::where('webhook_endpoint_id', $endpoint->id)
            ->where('created_at', '>=', now()->subHours(1))
            ->orderBy('created_at', 'desc')
            ->limit(100)
            ->get();

        if ($recentDeliveries->isEmpty()) {
            return [
                'success_rate'         => null,
                'failure_rate'         => null,
                'avg_response_time_ms' => null,
                'retry_count'          => 0,
                'failure_streak'       => 0,
                'last_success_at'      => null,
                'last_failure_at'      => null,
                'total_deliveries'     => 0,
            ];
        }

        $total = $recentDeliveries->count();
        $successCount = $recentDeliveries->where('status', 'delivered')->count();
        $failureCount = $recentDeliveries->where('status', 'failed')->count();
        $retryCount   = $recentDeliveries->sum('attempt_count');

        // Calcular failure streak (consecutivas falhas mais recentes)
        $failureStreak = 0;
        foreach ($recentDeliveries as $delivery) {
            if ($delivery->status === 'failed') {
                $failureStreak++;
            } else {
                break;
            }
        }

        // Calcular tempo médio de resposta (simular com status_code check)
        $avgResponseTime = null; // Future: armazenar response_time_ms no WebhookDelivery

        $lastSuccess = $recentDeliveries->where('status', 'delivered')->first();
        $lastFailure = $recentDeliveries->where('status', 'failed')->first();

        return [
            'success_rate'         => $total > 0 ? round(($successCount / $total) * 100, 1) : null,
            'failure_rate'         => $total > 0 ? round(($failureCount / $total) * 100, 1) : null,
            'avg_response_time_ms' => $avgResponseTime,
            'retry_count'          => (int) $retryCount,
            'failure_streak'       => $failureStreak,
            'last_success_at'      => $lastSuccess?->created_at,
            'last_failure_at'      => $lastFailure?->created_at,
            'total_deliveries'     => $total,
        ];
    }

    /**
     * Retorna a saúde de todos os endpoints de uma empresa.
     */
    public function getCompanyHealth(int $companyId): array
    {
        $endpoints = WebhookEndpoint::where('company_id', $companyId)->get();
        $results = [];

        foreach ($endpoints as $endpoint) {
            $health = $this->calculateHealth($endpoint);
            $results[] = [
                'endpoint_id' => $endpoint->id,
                'url'         => $endpoint->url,
                'status'      => $endpoint->status,
                'health'      => $health,
            ];
        }

        return $results;
    }

    /**
     * Salva snapshot de saúde.
     */
    protected function saveSnapshot(WebhookEndpoint $endpoint, array $health): void
    {
        WebhookHealthSnapshot::create([
            'company_id'           => $endpoint->company_id,
            'webhook_endpoint_id'  => $endpoint->id,
            'success_rate'         => $health['success_rate'],
            'failure_rate'         => $health['failure_rate'],
            'avg_response_time_ms' => $health['avg_response_time_ms'],
            'retry_count'          => $health['retry_count'],
            'failure_streak'       => $health['failure_streak'],
            'last_success_at'      => $health['last_success_at'],
            'last_failure_at'      => $health['last_failure_at'],
            'period'               => 'hourly',
        ]);
    }

    /**
     * Avalia regras e gera alertas baseado na saúde.
     */
    protected function evaluateAlerts(WebhookEndpoint $endpoint, array $health): void
    {
        // Regra 1: Taxa de falha > 20%
        if ($health['failure_rate'] !== null && $health['failure_rate'] > 20) {
            $this->alerts->trigger([
                'company_id'  => $endpoint->company_id,
                'severity'    => $health['failure_rate'] > 50 ? 'critical' : 'high',
                'category'    => 'technical',
                'type'        => 'webhook_delivery_failure_rate',
                'title'       => 'Alta taxa de falha em webhooks',
                'message'     => "O endpoint [{$endpoint->url}] apresenta {$health['failure_rate']}% de falha nas últimas entregas.",
                'entity_type' => 'webhook_endpoint',
                'entity_id'   => $endpoint->uuid ?? (string) $endpoint->id,
                'source'      => 'webhook_health_monitor',
                'recommended_action' => 'Verifique se o seu servidor está respondendo corretamente ou se há problemas de rede/firewall.',
                'metadata'    => [
                    'failure_rate'    => $health['failure_rate'],
                    'success_rate'    => $health['success_rate'],
                    'failure_streak'  => $health['failure_streak'],
                ],
            ]);
        }

        // Regra 2: Failure streak >= 3 (3 falhas consecutivas)
        if ($health['failure_streak'] >= 3) {
            $this->alerts->trigger([
                'company_id'  => $endpoint->company_id,
                'severity'    => $health['failure_streak'] >= 10 ? 'critical' : 'high',
                'category'    => 'technical',
                'type'        => 'webhook_consecutive_failures',
                'title'       => 'Webhooks falhando consecutivamente',
                'message'     => "O endpoint [{$endpoint->url}] falhou {$health['failure_streak']} vezes consecutivas.",
                'entity_type' => 'webhook_endpoint',
                'entity_id'   => $endpoint->uuid ?? (string) $endpoint->id,
                'source'      => 'webhook_health_monitor',
                'recommended_action' => 'Verifique a disponibilidade do endpoint e considere reenviar as deliveries pendentes.',
            ]);
        }
    }
}
