<?php

namespace App\Services\Trust;

use App\Models\Alert;
use App\Models\GatewayAccount;
use App\Models\Payment;
use App\Models\TrustDecision;
use App\Models\TrustScore;
use App\Models\WebhookEndpoint;
use Illuminate\Support\Str;

class TrustScoreService
{
    /**
     * Calcula o score de confiança global da operação.
     */
    public function calculateGlobalScore(int $companyId): array
    {
        $signals = [];
        $score = 100;

        // 1. Sinal: Gateway Health
        $activeGateways = GatewayAccount::where('company_id', $companyId)->active()->count();
        if ($activeGateways === 0) {
            $score -= 50;
            $signals[] = [
                'type'     => 'gateway_health',
                'severity' => 'critical',
                'message'  => 'Nenhum gateway ativo em produção.',
                'value'    => '0 gateways',
            ];
        }

        // 2. Sinal: Webhook Health
        $webhookFailures = Alert::where('company_id', $companyId)
            ->where('type', 'webhook_delivery_failure_rate')
            ->where('status', 'open')
            ->exists();
        if ($webhookFailures) {
            $score -= 20;
            $signals[] = [
                'type'     => 'webhook_health',
                'severity' => 'high',
                'message'  => 'Webhooks apresentando alta taxa de falha.',
                'value'    => 'Taxa acima do normal',
            ];
        }

        // 3. Sinal: Aprovação Recente
        $lowApproval = Alert::where('company_id', $companyId)
            ->where('type', 'gateway_low_approval_rate')
            ->where('status', 'open')
            ->exists();
        if ($lowApproval) {
            $score -= 30;
            $signals[] = [
                'type'     => 'approval_rate',
                'severity' => 'high',
                'message'  => 'Taxa de aprovação de cartões abaixo da média.',
                'value'    => 'Abaixo de 60%',
            ];
        }

        // 4. Sinal: Checkout Health
        $lowConversion = Alert::where('company_id', $companyId)
            ->where('type', 'checkout_low_conversion')
            ->where('status', 'open')
            ->exists();
        if ($lowConversion) {
            $score -= 10;
            $signals[] = [
                'type'     => 'checkout_conversion',
                'severity' => 'medium',
                'message'  => 'Checkout com baixa conversão detectada.',
                'value'    => 'Abaixo de 2%',
            ];
        }

        // 5. Sinal: Alertas de segurança
        $securityAlerts = Alert::where('company_id', $companyId)
            ->where('category', 'security')
            ->whereIn('status', ['open', 'acknowledged'])
            ->count();
        if ($securityAlerts > 0) {
            $score -= min($securityAlerts * 10, 30);
            $signals[] = [
                'type'     => 'security_alerts',
                'severity' => $securityAlerts >= 3 ? 'critical' : 'medium',
                'message'  => "{$securityAlerts} alerta(s) de segurança ativo(s).",
                'value'    => "{$securityAlerts} alertas",
            ];
        }

        // 6. Sinal: Webhook endpoints configurados
        $hasWebhook = WebhookEndpoint::where('company_id', $companyId)
            ->where('status', 'active')
            ->exists();
        if (!$hasWebhook) {
            $score -= 10;
            $signals[] = [
                'type'     => 'webhook_configuration',
                'severity' => 'low',
                'message'  => 'Nenhum webhook endpoint ativo configurado.',
                'value'    => '0 endpoints',
            ];
        }

        $score = max(0, $score);
        $status = $this->resolveStatus($score);
        $decision = $this->resolveDecision($score, $signals);

        $result = [
            'score'    => $score,
            'status'   => $status,
            'decision' => $decision,
            'signals'  => $signals,
            'recommended_action' => $this->getRecommendedAction($score, $signals),
        ];

        // Salvar score snapshot
        TrustScore::updateOrCreate(
            ['company_id' => $companyId, 'entity_type' => 'company', 'entity_id' => (string) $companyId],
            ['score' => $score, 'status' => $status, 'breakdown' => $signals]
        );

        return $result;
    }

    /**
     * Calcula score para uma entidade específica.
     */
    public function calculateEntityScore(int $companyId, string $entityType, string $entityId): array
    {
        // Buscar alertas relacionados a esta entidade
        $alerts = Alert::where('company_id', $companyId)
            ->where('entity_type', $entityType)
            ->where('entity_id', $entityId)
            ->whereIn('status', ['open', 'acknowledged'])
            ->get();

        $score = 100;
        $signals = [];

        foreach ($alerts as $alert) {
            $deduction = match ($alert->severity) {
                'critical' => 40,
                'high'     => 25,
                'medium'   => 15,
                'low'      => 5,
                default    => 0,
            };
            $score -= $deduction;
            $signals[] = [
                'type'     => $alert->type,
                'severity' => $alert->severity,
                'message'  => $alert->title,
                'value'    => $alert->message,
            ];
        }

        $score = max(0, $score);

        return [
            'score'    => $score,
            'status'   => $this->resolveStatus($score),
            'decision' => $this->resolveDecision($score, $signals),
            'signals'  => $signals,
        ];
    }

    protected function resolveStatus(int $score): string
    {
        if ($score >= 90) return 'excellent';
        if ($score >= 70) return 'healthy';
        if ($score >= 40) return 'at_risk';
        return 'critical';
    }

    protected function resolveDecision(int $score, array $signals): string
    {
        if ($score < 20) return 'block_payment';
        if ($score < 40) return 'block_publish';
        if ($score < 60) return 'require_review';
        if ($score < 70) return 'warn';
        if (count($signals) > 0 && $score < 90) return 'recommend_alternative_method';
        return 'allow';
    }

    protected function getRecommendedAction(int $score, array $signals): string
    {
        if ($score >= 90) {
            return 'A operação está saudável. Todos os indicadores estão dentro do esperado.';
        }
        if ($score >= 70) {
            return 'A operação está funcionando, mas alguns sinais merecem atenção. Verifique os alertas ativos.';
        }
        if ($score >= 40) {
            return 'Atenção: a operação apresenta riscos que podem impactar pagamentos. Resolva os alertas antes de publicar novos checkouts.';
        }
        return 'Crítico: a operação está comprometida. Ação imediata necessária para evitar perda financeira.';
    }
}
