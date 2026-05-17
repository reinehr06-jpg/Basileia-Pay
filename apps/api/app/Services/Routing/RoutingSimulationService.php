<?php

namespace App\Services\Routing;

class RoutingSimulationService
{
    protected $routingService;

    public function __construct(PaymentRoutingService $routingService)
    {
        $this->routingService = $routingService;
    }

    public function simulate(int $companyId, array $params): array
    {
        $method      = $params['method'] ?? 'pix';
        $amount      = $params['amount'] ?? 0;
        $environment = $params['environment'] ?? 'production';
        $checkoutId  = $params['checkout_id'] ?? null;

        $routingResult = $this->routingService->resolve($companyId, $method, $environment, [
            'amount'      => $amount,
            'checkout_id' => $checkoutId,
        ]);

        $trustScore = app(\App\Services\Trust\TrustScoreService::class)->calculateGlobalScore($companyId);
        $recommended = $this->routingService->getRecommendedMethod($companyId, $environment);

        return [
            'simulation' => [
                'method'      => strtoupper($method),
                'amount'      => $amount,
                'amount_formatted' => 'R$ ' . number_format($amount / 100, 2, ',', '.'),
                'environment' => $environment,
                'checkout_id' => $checkoutId,
            ],
            'routing' => [
                'chosen_gateway' => $routingResult['chosen_gateway']?->name ?? $routingResult['chosen_gateway']?->provider ?? null,
                'chosen_provider' => $routingResult['chosen_gateway']?->provider ?? $routingResult['chosen_gateway']?->gateway_type ?? null,
                'fallback'       => $routingResult['fallback']?->name ?? $routingResult['fallback']?->provider ?? null,
                'reason'         => $routingResult['reason'],
                'decision'       => $routingResult['decision'],
                'approval_rate'  => $routingResult['approval_rate'] ?? null,
                'strategy'       => $routingResult['strategy'] ?? 'auto',
            ],
            'trust' => [
                'score'              => $trustScore['score'],
                'status'             => $trustScore['status'],
                'decision'           => $trustScore['decision'],
                'recommended_action' => $trustScore['recommended_action'],
            ],
            'recommendation' => $recommended,
            'alerts' => $trustScore['signals'],
        ];
    }
}
