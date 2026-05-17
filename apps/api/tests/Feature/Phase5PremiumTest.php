<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Services\Alerts\AlertService;
use App\Services\Alerts\AlertRuleEngine;
use App\Services\AI\AiCheckoutPromptService;
use App\Services\Trust\TrustScoreService;
use App\Services\Trust\TrustLayerService;
use App\Services\Routing\PaymentRoutingService;
use App\Services\Routing\RoutingSimulationService;
use App\Services\Studio\CheckoutPublicationValidator;
use App\Services\Studio\CheckoutVersionService;
use App\Services\Studio\CheckoutPreviewService;
use App\Services\Monitoring\WebhookHealthService;
use App\Services\Monitoring\GatewayHealthService;
use App\Services\Monitoring\CheckoutHealthService;
use App\Models\Alert;
use App\Models\CheckoutExperience;

class Phase5PremiumTest extends TestCase
{
    // ═══════════════════════════════════════════════════════════════════
    // ALERTAS
    // ═══════════════════════════════════════════════════════════════════

    public function test_alert_has_severity_and_recommended_action(): void
    {
        $service = app(AlertService::class);
        $alert = $service->trigger([
            'company_id'         => 1,
            'severity'           => 'high',
            'category'           => 'technical',
            'type'               => 'test_alert',
            'title'              => 'Teste de Alerta',
            'message'            => 'Este é um alerta de teste.',
            'recommended_action' => 'Verifique os logs do sistema.',
            'entity_type'        => 'test',
            'entity_id'          => 'test_1',
        ]);

        $this->assertNotNull($alert->id);
        $this->assertEquals('high', $alert->severity);
        $this->assertEquals('technical', $alert->category);
        $this->assertNotNull($alert->recommended_action);
        $this->assertEquals('open', $alert->status);
    }

    public function test_alert_can_be_resolved(): void
    {
        $service = app(AlertService::class);
        $alert = $service->trigger([
            'company_id' => 1, 'severity' => 'medium', 'category' => 'financial',
            'type' => 'test_resolve', 'title' => 'Teste', 'message' => 'msg',
            'entity_type' => 'test', 'entity_id' => 'r1',
        ]);

        $resolved = $service->resolve($alert->id);
        $this->assertEquals('resolved', $resolved->status);
        $this->assertNotNull($resolved->resolved_at);
    }

    public function test_duplicate_alert_updates_last_seen(): void
    {
        $service = app(AlertService::class);
        $data = [
            'company_id' => 1, 'severity' => 'low', 'category' => 'technical',
            'type' => 'dup_test', 'title' => 'Dup', 'message' => 'first',
            'entity_type' => 'test', 'entity_id' => 'd1',
        ];

        $first = $service->trigger($data);
        $data['message'] = 'updated';
        $second = $service->trigger($data);

        $this->assertEquals($first->id, $second->id);
        $this->assertEquals('updated', $second->message);
    }

    // ═══════════════════════════════════════════════════════════════════
    // IA POR PROMPT
    // ═══════════════════════════════════════════════════════════════════

    public function test_ai_generates_draft_not_published(): void
    {
        $service = app(AiCheckoutPromptService::class);
        $result = $service->generateFromPrompt(1, 'Crie um checkout premium para uma conferência cristã chamada CIES');

        $this->assertEquals('draft', $result['status']);
        $this->assertNotEquals('published', $result['status']);
        $this->assertArrayHasKey('checkout', $result);
        $this->assertArrayHasKey('warnings', $result);
    }

    public function test_ai_does_not_invent_social_proof(): void
    {
        $service = app(AiCheckoutPromptService::class);
        $result = $service->generateFromPrompt(1, 'Crie um checkout para um curso online');

        $checkout = $result['checkout'];
        $trust = $checkout['trust'] ?? [];
        $socialProof = $trust['social_proof'] ?? [];

        $this->assertFalse($socialProof['enabled'] ?? false);

        // Verify warnings mention missing social proof
        $hasWarning = collect($result['warnings'])->contains(fn($w) => ($w['code'] ?? '') === 'missing_social_proof');
        $this->assertTrue($hasWarning);
    }

    public function test_ai_rejects_sensitive_data_in_prompt(): void
    {
        $service = app(AiCheckoutPromptService::class);

        $this->expectException(\InvalidArgumentException::class);
        $service->generateFromPrompt(1, 'Use a chave sk_live_abc123 para configurar');
    }

    public function test_ai_respects_enabled_methods(): void
    {
        $service = app(AiCheckoutPromptService::class);
        $result = $service->generateFromPrompt(1, 'Checkout com PIX e cartão', [
            'enabled_methods' => ['pix'],
        ]);

        $methods = $result['checkout']['payment_methods'];
        $this->assertContains('pix', $methods);
        $this->assertNotContains('card', $methods);
    }

    // ═══════════════════════════════════════════════════════════════════
    // TRUST LAYER
    // ═══════════════════════════════════════════════════════════════════

    public function test_trust_score_is_calculated(): void
    {
        $service = app(TrustScoreService::class);
        $result = $service->calculateGlobalScore(1);

        $this->assertArrayHasKey('score', $result);
        $this->assertArrayHasKey('status', $result);
        $this->assertArrayHasKey('decision', $result);
        $this->assertArrayHasKey('signals', $result);
        $this->assertIsInt($result['score']);
        $this->assertGreaterThanOrEqual(0, $result['score']);
        $this->assertLessThanOrEqual(100, $result['score']);
    }

    public function test_trust_decision_has_reason(): void
    {
        $service = app(TrustLayerService::class);
        $decision = $service->evaluateCheckoutPublish(1, 'test_checkout_uuid');

        $this->assertNotNull($decision->decision);
        $this->assertNotNull($decision->reason);
        $this->assertNotNull($decision->score);
        $this->assertIsArray($decision->signals);
    }

    // ═══════════════════════════════════════════════════════════════════
    // PUBLICAÇÃO
    // ═══════════════════════════════════════════════════════════════════

    public function test_publication_score_is_calculated(): void
    {
        $validator = app(CheckoutPublicationValidator::class);

        $experience = new CheckoutExperience();
        $experience->company_id = 1;
        $experience->config = [
            'payment_methods' => ['pix', 'card'],
            'headline' => 'Test',
            'trust' => ['social_proof' => ['enabled' => false], 'guarantee' => ['enabled' => true]],
        ];

        $result = $validator->validate($experience);

        $this->assertArrayHasKey('score', $result);
        $this->assertArrayHasKey('status', $result);
        $this->assertArrayHasKey('can_publish', $result);
        $this->assertArrayHasKey('checks', $result);
        $this->assertIsInt($result['score']);
    }

    // ═══════════════════════════════════════════════════════════════════
    // PREVIEW
    // ═══════════════════════════════════════════════════════════════════

    public function test_preview_generates_for_all_devices(): void
    {
        $service = app(CheckoutPreviewService::class);
        $experience = new CheckoutExperience();
        $experience->id = 1;
        $experience->uuid = 'test-uuid';
        $experience->name = 'Test';
        $experience->status = 'draft';
        $experience->config = ['headline' => 'Test'];

        foreach (['mobile', 'tablet', 'desktop'] as $device) {
            $preview = $service->generatePreview($experience, $device);
            $this->assertEquals($device, $preview['device']);
            $this->assertArrayHasKey('viewport', $preview);
            $this->assertTrue($preview['is_draft']);
        }
    }

    // ═══════════════════════════════════════════════════════════════════
    // ROTEAMENTO
    // ═══════════════════════════════════════════════════════════════════

    public function test_routing_returns_decision_with_reason(): void
    {
        $service = app(PaymentRoutingService::class);
        $result = $service->resolve(1, 'pix');

        $this->assertArrayHasKey('decision', $result);
        $this->assertArrayHasKey('reason', $result);
        $this->assertNotNull($result['reason']);
    }

    public function test_simulation_returns_enriched_data(): void
    {
        $service = app(RoutingSimulationService::class);
        $result = $service->simulate(1, ['method' => 'pix', 'amount' => 5000, 'environment' => 'production']);

        $this->assertArrayHasKey('simulation', $result);
        $this->assertArrayHasKey('routing', $result);
        $this->assertArrayHasKey('trust', $result);
        $this->assertArrayHasKey('recommendation', $result);
    }

    public function test_recommended_method_has_reason(): void
    {
        $service = app(PaymentRoutingService::class);
        $result = $service->getRecommendedMethod(1);

        $this->assertArrayHasKey('recommended_payment_method', $result);
        $this->assertArrayHasKey('reason', $result);
        $this->assertArrayHasKey('source', $result);
    }
}
