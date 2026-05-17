<?php

namespace App\Http\Controllers\Api\V1\Dashboard;

use App\Http\Controllers\Controller;
use App\Services\Monitoring\WebhookHealthService;
use App\Services\Monitoring\GatewayHealthService;
use App\Services\Monitoring\CheckoutHealthService;
use App\Services\Alerts\AlertRuleEngine;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MonitoringController extends Controller
{
    protected $webhookHealth;
    protected $gatewayHealth;
    protected $checkoutHealth;

    public function __construct(
        WebhookHealthService $webhookHealth,
        GatewayHealthService $gatewayHealth,
        CheckoutHealthService $checkoutHealth
    ) {
        $this->webhookHealth  = $webhookHealth;
        $this->gatewayHealth  = $gatewayHealth;
        $this->checkoutHealth = $checkoutHealth;
    }

    /**
     * Visão geral do monitoramento.
     */
    public function index(Request $request): JsonResponse
    {
        $companyId = $request->user()->company_id;

        return response()->json([
            'success' => true,
            'data'    => [
                'webhooks'  => $this->webhookHealth->getCompanyHealth($companyId),
                'gateways'  => $this->gatewayHealth->getCompanyHealth($companyId),
                'checkouts' => $this->checkoutHealth->getCompanyHealth($companyId),
            ],
        ]);
    }

    /**
     * Health de webhooks.
     */
    public function webhooks(Request $request): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data'    => $this->webhookHealth->getCompanyHealth($request->user()->company_id),
        ]);
    }

    /**
     * Health de gateways.
     */
    public function gateways(Request $request): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data'    => $this->gatewayHealth->getCompanyHealth($request->user()->company_id),
        ]);
    }

    /**
     * Health de checkouts.
     */
    public function checkouts(Request $request): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data'    => $this->checkoutHealth->getCompanyHealth($request->user()->company_id),
        ]);
    }

    /**
     * Executar avaliação de regras manualmente.
     */
    public function evaluate(Request $request): JsonResponse
    {
        $engine = app(AlertRuleEngine::class);
        $results = $engine->evaluate();

        return response()->json([
            'success' => true,
            'data'    => ['checks' => $results],
        ]);
    }
}
