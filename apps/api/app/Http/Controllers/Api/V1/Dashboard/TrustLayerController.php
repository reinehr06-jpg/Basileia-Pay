<?php

namespace App\Http\Controllers\Api\V1\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\TrustDecision;
use App\Services\Trust\TrustScoreService;
use App\Services\Trust\TrustLayerService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TrustLayerController extends Controller
{
    protected $trustScore;
    protected $trustLayer;

    public function __construct(TrustScoreService $trustScore, TrustLayerService $trustLayer)
    {
        $this->trustScore = $trustScore;
        $this->trustLayer = $trustLayer;
    }

    public function index(Request $request): JsonResponse
    {
        $companyId = $request->user()->company_id;
        $result = $this->trustScore->calculateGlobalScore($companyId);

        $openAlerts = \App\Models\Alert::where('company_id', $companyId)
            ->whereIn('status', ['open', 'acknowledged'])
            ->orderByRaw("FIELD(severity, 'critical', 'high', 'medium', 'low', 'info')")
            ->limit(10)->get()
            ->map(fn($a) => [
                'id' => $a->id, 'severity' => $a->severity, 'title' => $a->title,
                'message' => $a->message, 'recommended_action' => $a->recommended_action,
                'category' => $a->category, 'first_seen_at' => $a->first_seen_at,
            ]);

        // Recent decisions
        $recentDecisions = TrustDecision::where('company_id', $companyId)
            ->orderBy('created_at', 'desc')->limit(10)->get();

        return response()->json([
            'success' => true,
            'data'    => [
                'score'              => $result['score'],
                'status'             => $result['status'],
                'decision'           => $result['decision'],
                'signals'            => $result['signals'],
                'recommended_action' => $result['recommended_action'],
                'alerts'             => $openAlerts,
                'recent_decisions'   => $recentDecisions,
                'explanation'        => $result['recommended_action'],
            ],
        ]);
    }

    /**
     * Avaliar uma entidade específica.
     */
    public function evaluate(Request $request): JsonResponse
    {
        $data = $request->validate([
            'entity_type' => 'required|in:checkout_experience,gateway_account,payment',
            'entity_id'   => 'required|string',
        ]);

        $companyId = $request->user()->company_id;

        if ($data['entity_type'] === 'checkout_experience') {
            $decision = $this->trustLayer->evaluateCheckoutPublish($companyId, $data['entity_id']);
        } elseif ($data['entity_type'] === 'gateway_account') {
            $decision = $this->trustLayer->evaluateGateway($companyId, $data['entity_id']);
        } else {
            $decision = $this->trustLayer->evaluatePayment($companyId, ['payment_id' => $data['entity_id']]);
        }

        return response()->json([
            'success' => true,
            'data'    => [
                'decision'           => $decision->decision,
                'score'              => $decision->score,
                'reason'             => $decision->reason,
                'recommended_action' => $decision->recommended_action,
                'signals'            => $decision->signals,
            ],
        ]);
    }
}
