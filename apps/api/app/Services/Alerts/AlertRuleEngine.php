<?php

namespace App\Services\Alerts;

use App\Services\Monitoring\WebhookHealthService;
use App\Services\Monitoring\GatewayHealthService;
use App\Services\Monitoring\CheckoutHealthService;
use App\Models\AuditLog;
use App\Models\LoginAttempt;
use Illuminate\Support\Facades\DB;

class AlertRuleEngine
{
    protected $webhookHealth;
    protected $gatewayHealth;
    protected $checkoutHealth;
    protected $alertService;

    public function __construct(
        WebhookHealthService $webhookHealth,
        GatewayHealthService $gatewayHealth,
        CheckoutHealthService $checkoutHealth,
        AlertService $alertService
    ) {
        $this->webhookHealth  = $webhookHealth;
        $this->gatewayHealth  = $gatewayHealth;
        $this->checkoutHealth = $checkoutHealth;
        $this->alertService   = $alertService;
    }

    /**
     * Executa todas as regras de monitoramento e retorna resultado.
     */
    public function evaluate(): array
    {
        $results = [];

        // 1. Monitorar Webhooks (técnico)
        $this->webhookHealth->monitor();
        $results[] = 'webhook_health_checked';

        // 2. Monitorar Gateways (financeiro)
        $this->gatewayHealth->monitor();
        $results[] = 'gateway_health_checked';

        // 3. Monitorar Checkouts (financeiro)
        $this->checkoutHealth->monitor();
        $results[] = 'checkout_health_checked';

        // 4. Alertas de segurança — Login brute force
        $this->checkBruteForceLogins();
        $results[] = 'brute_force_checked';

        // 5. Alertas de segurança — 2FA falhas
        $this->check2FAFailures();
        $results[] = '2fa_failures_checked';

        // 6. Alertas de segurança — API keys inválidas
        $this->checkInvalidApiKeys();
        $results[] = 'invalid_api_keys_checked';

        // 7. Alertas de segurança — Tentativa de acesso cross-tenant
        $this->checkCrossTenantAttempts();
        $results[] = 'cross_tenant_checked';

        // 8. Alertas financeiros — Pagamentos presos
        $this->checkStuckPayments();
        $results[] = 'stuck_payments_checked';

        // 9. Alertas financeiros — PIX expirado acima do normal
        $this->checkPixExpiration();
        $results[] = 'pix_expiration_checked';

        return $results;
    }

    /**
     * Verifica tentativas de login brute force.
     */
    protected function checkBruteForceLogins(): void
    {
        $suspiciousLogins = AuditLog::where('event', 'login_failed')
            ->where('created_at', '>=', now()->subHours(2))
            ->select('ip_address', DB::raw('count(*) as attempts'))
            ->groupBy('ip_address')
            ->having('attempts', '>=', 10)
            ->get();

        foreach ($suspiciousLogins as $record) {
            $this->alertService->trigger([
                'company_id'  => 0,
                'severity'    => $record->attempts >= 30 ? 'critical' : 'high',
                'category'    => 'security',
                'type'        => 'brute_force_attempt',
                'title'       => 'Tentativas de login suspeitas',
                'message'     => "O IP [{$record->ip_address}] fez {$record->attempts} tentativas de login sem sucesso nas últimas 2 horas.",
                'entity_type' => 'ip_address',
                'entity_id'   => $record->ip_address,
                'source'      => 'alert_rule_engine',
                'recommended_action' => 'Considere bloquear este IP temporariamente e verifique se há padrão de ataque.',
                'metadata'    => ['attempts' => $record->attempts],
            ]);
        }
    }

    /**
     * Verifica falhas repetidas de 2FA.
     */
    protected function check2FAFailures(): void
    {
        $twoFactorFailures = AuditLog::where('event', '2fa_failed')
            ->where('created_at', '>=', now()->subHours(1))
            ->select('user_id', DB::raw('count(*) as attempts'))
            ->groupBy('user_id')
            ->having('attempts', '>=', 5)
            ->get();

        foreach ($twoFactorFailures as $record) {
            $user = \App\Models\User::find($record->user_id);
            $companyId = $user?->company_id ?? 0;

            $this->alertService->trigger([
                'company_id'  => $companyId,
                'severity'    => 'high',
                'category'    => 'security',
                'type'        => '2fa_repeated_failure',
                'title'       => 'Muitas falhas de verificação 2FA',
                'message'     => "O usuário [{$user?->email}] falhou {$record->attempts} vezes na verificação 2FA na última hora.",
                'entity_type' => 'user',
                'entity_id'   => (string) $record->user_id,
                'source'      => 'alert_rule_engine',
                'recommended_action' => 'Verifique se o dispositivo do usuário está sincronizado ou se há tentativa de acesso não autorizado.',
            ]);
        }
    }

    /**
     * Verifica uso de API keys inválidas/revogadas.
     */
    protected function checkInvalidApiKeys(): void
    {
        $invalidKeys = AuditLog::where('event', 'api_key_invalid')
            ->where('created_at', '>=', now()->subHours(1))
            ->select('ip_address', DB::raw('count(*) as attempts'))
            ->groupBy('ip_address')
            ->having('attempts', '>=', 10)
            ->get();

        foreach ($invalidKeys as $record) {
            $this->alertService->trigger([
                'company_id'  => 0,
                'severity'    => 'high',
                'category'    => 'security',
                'type'        => 'api_key_abuse',
                'title'       => 'Uso excessivo de API keys inválidas',
                'message'     => "IP [{$record->ip_address}] realizou {$record->attempts} chamadas com API key inválida na última hora.",
                'entity_type' => 'ip_address',
                'entity_id'   => $record->ip_address,
                'source'      => 'alert_rule_engine',
                'recommended_action' => 'Verifique se há tentativa de acesso não autorizado ou se o sistema do cliente está desatualizado.',
            ]);
        }
    }

    /**
     * Verifica tentativas de acesso cross-tenant.
     */
    protected function checkCrossTenantAttempts(): void
    {
        $crossTenant = AuditLog::where('event', 'cross_tenant_access_attempt')
            ->where('created_at', '>=', now()->subHours(6))
            ->select('user_id', DB::raw('count(*) as attempts'))
            ->groupBy('user_id')
            ->having('attempts', '>=', 3)
            ->get();

        foreach ($crossTenant as $record) {
            $user = \App\Models\User::find($record->user_id);
            $this->alertService->trigger([
                'company_id'  => $user?->company_id ?? 0,
                'severity'    => 'critical',
                'category'    => 'security',
                'type'        => 'cross_tenant_access',
                'title'       => 'Tentativa de acesso cross-tenant',
                'message'     => "O usuário [{$user?->email}] tentou acessar dados de outra empresa {$record->attempts} vezes.",
                'entity_type' => 'user',
                'entity_id'   => (string) $record->user_id,
                'source'      => 'alert_rule_engine',
                'recommended_action' => 'Revise permissões do usuário e verifique se há comprometimento de conta.',
            ]);
        }
    }

    /**
     * Verifica pagamentos presos em pending/processing.
     */
    protected function checkStuckPayments(): void
    {
        $stuckPayments = \App\Models\Payment::whereIn('status', ['pending', 'processing'])
            ->where('created_at', '<=', now()->subHours(2))
            ->select('company_id', DB::raw('count(*) as total'))
            ->groupBy('company_id')
            ->having('total', '>=', 5)
            ->get();

        foreach ($stuckPayments as $record) {
            $this->alertService->trigger([
                'company_id'  => $record->company_id,
                'severity'    => 'medium',
                'category'    => 'financial',
                'type'        => 'stuck_payments',
                'title'       => 'Pagamentos travados',
                'message'     => "{$record->total} pagamentos estão em processamento há mais de 2 horas.",
                'entity_type' => 'payment_batch',
                'entity_id'   => 'batch_' . now()->format('Ymd_H'),
                'source'      => 'alert_rule_engine',
                'recommended_action' => 'Verifique o status desses pagamentos no gateway e confirme se há falha na comunicação.',
            ]);
        }
    }

    /**
     * Verifica taxa de expiração de PIX acima do normal.
     */
    protected function checkPixExpiration(): void
    {
        $companies = \App\Models\Payment::where('method', 'pix')
            ->where('created_at', '>=', now()->subHours(6))
            ->select('company_id', DB::raw('count(*) as total'),
                DB::raw("SUM(CASE WHEN status = 'expired' THEN 1 ELSE 0 END) as expired_count"))
            ->groupBy('company_id')
            ->having('total', '>=', 10)
            ->get();

        foreach ($companies as $record) {
            $expirationRate = ($record->expired_count / $record->total) * 100;
            if ($expirationRate > 40) {
                $this->alertService->trigger([
                    'company_id'  => $record->company_id,
                    'severity'    => 'medium',
                    'category'    => 'financial',
                    'type'        => 'pix_high_expiration',
                    'title'       => 'Alta taxa de expiração de PIX',
                    'message'     => round($expirationRate) . "% dos pagamentos PIX expiraram nas últimas 6 horas ({$record->expired_count}/{$record->total}).",
                    'entity_type' => 'payment_method',
                    'entity_id'   => 'pix',
                    'source'      => 'alert_rule_engine',
                    'recommended_action' => 'Considere aumentar o tempo de expiração do QR Code PIX ou enviar lembrete ao comprador.',
                ]);
            }
        }
    }
}
