<?php

namespace App\Services\Studio;

use App\Models\CheckoutExperience;
use App\Models\GatewayAccount;
use App\Models\WebhookEndpoint;
use App\Models\AuditLog;
use Illuminate\Support\Str;

class CheckoutPublicationValidator
{
    public function validate(CheckoutExperience $experience): array
    {
        $checks = [
            'security'   => $this->checkSecurity($experience),
            'conversion' => $this->checkConversion($experience),
            'trust'      => $this->checkTrust($experience),
            'operation'  => $this->checkOperation($experience),
            'mobile'     => $this->checkMobile($experience),
        ];

        $scores = array_column($checks, 'score');
        $totalScore = (int) (array_sum($scores) / count($scores));

        $errors = $warnings = [];
        foreach ($checks as $result) {
            $errors = array_merge($errors, $result['errors']);
            $warnings = array_merge($warnings, $result['warnings']);
        }

        $status = !empty($errors) ? 'blocked' : ($totalScore >= 90 ? 'ready_to_publish' : 'publishable_with_warnings');

        $result = [
            'status'      => $status,
            'score'       => $totalScore,
            'can_publish' => empty($errors),
            'checks'      => array_map(fn($c) => ['score' => $c['score'], 'errors' => count($c['errors']), 'warnings' => count($c['warnings'])], $checks),
            'errors'      => $errors,
            'warnings'    => $warnings,
        ];

        // Audit log
        AuditLog::create([
            'uuid' => (string) Str::uuid(),
            'company_id' => $experience->company_id,
            'event' => 'checkout_publication_validated',
            'entity_type' => 'checkout_experience',
            'entity_id' => $experience->id,
            'new_values' => ['status' => $status, 'score' => $totalScore, 'can_publish' => empty($errors)],
        ]);

        return $result;
    }

    protected function checkSecurity(CheckoutExperience $experience): array
    {
        $errors = $warnings = [];
        $score = 100;

        $gateways = GatewayAccount::where('company_id', $experience->company_id)->active()->count();
        if ($gateways === 0) {
            $errors[] = ['code' => 'no_active_gateway', 'category' => 'security', 'message' => 'Nenhum gateway de pagamento ativo.', 'recommendation' => 'Configure pelo menos um gateway antes de publicar.'];
            $score = 0;
        }

        $config = $experience->config ?? [];
        $methods = $config['payment_methods'] ?? $config['payments'] ?? [];
        if (empty($methods)) {
            $errors[] = ['code' => 'no_payment_method', 'category' => 'security', 'message' => 'Nenhum método de pagamento habilitado.', 'recommendation' => 'Habilite PIX, cartão ou boleto.'];
            $score = 0;
        }

        if (empty($experience->company_id)) {
            $errors[] = ['code' => 'no_company', 'category' => 'security', 'message' => 'Checkout sem empresa vinculada.', 'recommendation' => 'Vincule a uma empresa válida.'];
            $score = 0;
        }

        return ['score' => $score, 'errors' => $errors, 'warnings' => $warnings];
    }

    protected function checkConversion(CheckoutExperience $experience): array
    {
        $warnings = [];
        $score = 100;
        $config = $experience->config ?? [];

        $pixEnabled = $config['payments']['pix']['enabled'] ?? $config['payment_methods'] ?? null;
        if (is_array($pixEnabled) && !in_array('pix', $pixEnabled)) {
            $warnings[] = ['code' => 'pix_disabled', 'category' => 'conversion', 'message' => 'PIX desativado pode reduzir conversão em até 40%.', 'recommendation' => 'Considere habilitar PIX como método de pagamento.'];
            $score -= 30;
        }

        if (empty($config['headline'])) {
            $warnings[] = ['code' => 'missing_headline', 'category' => 'conversion', 'message' => 'Texto principal (headline) não configurado.', 'recommendation' => 'Adicione um título claro e atrativo.'];
            $score -= 15;
        }

        if (empty($config['recommended_payment_method'])) {
            $warnings[] = ['code' => 'no_recommended_method', 'category' => 'conversion', 'message' => 'Nenhum método de pagamento recomendado.', 'recommendation' => 'Defina um método recomendado para orientar o comprador.'];
            $score -= 10;
        }

        return ['score' => max(0, $score), 'errors' => [], 'warnings' => $warnings];
    }

    protected function checkTrust(CheckoutExperience $experience): array
    {
        $warnings = [];
        $score = 100;
        $config = $experience->config ?? [];
        $trust = $config['trust'] ?? [];

        if (!($trust['social_proof']['enabled'] ?? false)) {
            $warnings[] = ['code' => 'missing_social_proof', 'category' => 'trust', 'message' => 'Nenhuma prova social configurada.', 'recommendation' => 'Adicione depoimentos reais ou mantenha desativado.'];
            $score -= 15;
        }

        if (!($trust['guarantee']['enabled'] ?? false)) {
            $warnings[] = ['code' => 'missing_guarantee', 'category' => 'trust', 'message' => 'Selo de garantia não configurado.', 'recommendation' => 'Adicione um selo de garantia para aumentar a confiança.'];
            $score -= 10;
        }

        $company = $experience->company ?? \App\Models\Company::find($experience->company_id);
        if ($company && empty($company->logo_url)) {
            $warnings[] = ['code' => 'missing_company_logo', 'category' => 'trust', 'message' => 'Logo da empresa não configurado.', 'recommendation' => 'Adicione o logo em Configurações > Empresa.'];
            $score -= 10;
        }

        return ['score' => max(0, $score), 'errors' => [], 'warnings' => $warnings];
    }

    protected function checkOperation(CheckoutExperience $experience): array
    {
        $errors = $warnings = [];
        $score = 100;

        $hasWebhook = WebhookEndpoint::where('company_id', $experience->company_id)->where('status', 'active')->exists();
        if (!$hasWebhook) {
            $warnings[] = ['code' => 'no_webhook', 'category' => 'operation', 'message' => 'Nenhum webhook configurado.', 'recommendation' => 'Configure webhooks para receber notificações de pagamento.'];
            $score -= 20;
        }

        // Verificar se há alertas críticos abertos
        $criticalAlerts = \App\Models\Alert::where('company_id', $experience->company_id)
            ->where('severity', 'critical')->whereIn('status', ['open', 'acknowledged'])->count();
        if ($criticalAlerts > 0) {
            $warnings[] = ['code' => 'critical_alerts_open', 'category' => 'operation', 'message' => "{$criticalAlerts} alerta(s) crítico(s) aberto(s).", 'recommendation' => 'Resolva os alertas críticos antes de publicar.'];
            $score -= 25;
        }

        return ['score' => max(0, $score), 'errors' => $errors, 'warnings' => $warnings];
    }

    protected function checkMobile(CheckoutExperience $experience): array
    {
        $warnings = [];
        $score = 85; // Default assume mobile needs review
        $config = $experience->config ?? [];

        if (empty($config['sections'])) {
            $warnings[] = ['code' => 'no_sections', 'category' => 'mobile', 'message' => 'Nenhuma seção configurada no checkout.', 'recommendation' => 'Adicione seções para estruturar a experiência de compra.'];
            $score -= 20;
        }

        return ['score' => max(0, $score), 'errors' => [], 'warnings' => $warnings];
    }
}
