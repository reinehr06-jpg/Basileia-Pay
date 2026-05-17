<?php

namespace App\Http\Controllers\Api\V1\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\RoutingRule;
use App\Models\RoutingDecision;
use App\Services\Routing\PaymentRoutingService;
use App\Services\Routing\RoutingSimulationService;
use App\Models\GatewayAccount;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RoutingController extends Controller
{
    protected $routing;
    protected $simulator;

    public function __construct(PaymentRoutingService $routing, RoutingSimulationService $simulator)
    {
        $this->routing   = $routing;
        $this->simulator = $simulator;
    }

    public function index(Request $request): JsonResponse
    {
        $companyId = $request->user()->company_id;

        $gateways = GatewayAccount::where('company_id', $companyId)
            ->where('status', 'active')->orderBy('priority', 'asc')->get();

        $methods = ['pix', 'card', 'boleto'];
        $routingMap = [];
        foreach ($methods as $method) {
            $result = $this->routing->resolve($companyId, $method);
            $routingMap[$method] = [
                'primary'       => $result['chosen_gateway']?->name ?? $result['chosen_gateway']?->provider ?? null,
                'fallback'      => $result['fallback']?->name ?? $result['fallback']?->provider ?? null,
                'approval_rate' => $result['approval_rate'] ?? null,
                'decision'      => $result['decision'],
                'strategy'      => $result['strategy'] ?? 'auto',
            ];
        }

        $rules = RoutingRule::where('company_id', $companyId)->orderBy('priority', 'asc')->get();
        $recommended = $this->routing->getRecommendedMethod($companyId);

        // Recent decisions
        $recentDecisions = RoutingDecision::where('company_id', $companyId)
            ->orderBy('created_at', 'desc')->limit(20)->get();

        return response()->json([
            'success' => true,
            'data'    => [
                'gateways'    => $gateways,
                'routing'     => $routingMap,
                'rules'       => $rules,
                'recommended' => $recommended,
                'recent_decisions' => $recentDecisions,
            ],
        ]);
    }

    public function simulate(Request $request): JsonResponse
    {
        $data = $request->validate([
            'method'      => 'required|in:pix,card,boleto',
            'amount'      => 'required|integer|min:100',
            'environment' => 'sometimes|in:sandbox,production',
            'checkout_id' => 'sometimes|string',
        ]);

        $result = $this->simulator->simulate($request->user()->company_id, $data);

        return response()->json(['success' => true, 'data' => $result]);
    }

    /**
     * Criar ou atualizar regra de roteamento.
     */
    public function storeRule(Request $request): JsonResponse
    {
        $data = $request->validate([
            'method'              => 'required|in:pix,card,boleto',
            'environment'         => 'required|in:sandbox,production',
            'primary_gateway_id'  => 'required|integer|exists:gateway_accounts,id',
            'fallback_gateway_id' => 'nullable|integer|exists:gateway_accounts,id',
            'strategy'            => 'sometimes|in:priority,manual,fallback,lowest_fee,highest_approval_rate',
            'recommended'         => 'sometimes|boolean',
        ]);

        $rule = RoutingRule::updateOrCreate(
            [
                'company_id'  => $request->user()->company_id,
                'method'      => $data['method'],
                'environment' => $data['environment'],
            ],
            [
                'name'                => "Regra {$data['method']} ({$data['environment']})",
                'primary_gateway_id'  => $data['primary_gateway_id'],
                'fallback_gateway_id' => $data['fallback_gateway_id'] ?? null,
                'strategy'            => $data['strategy'] ?? 'priority',
                'recommended'         => $data['recommended'] ?? false,
                'active'              => true,
                'priority'            => 1,
            ]
        );

        return response()->json(['success' => true, 'data' => $rule]);
    }

    /**
     * Histórico de decisões de roteamento.
     */
    public function decisions(Request $request): JsonResponse
    {
        $decisions = RoutingDecision::where('company_id', $request->user()->company_id)
            ->orderBy('created_at', 'desc')
            ->paginate($request->input('per_page', 30));

        return response()->json([
            'success' => true,
            'data'    => $decisions->items(),
            'meta'    => [
                'current_page' => $decisions->currentPage(),
                'last_page'    => $decisions->lastPage(),
                'total'        => $decisions->total(),
            ],
        ]);
    }
}
