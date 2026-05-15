<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\CheckoutExperience;
use App\Models\CheckoutScore;
use App\Models\CheckoutSessionAnalytics;
use App\Models\SessionForensicsFrame;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AnalyticsController extends Controller
{
    public function overview(Request $request): JsonResponse
    {
        // Mocking overview metrics
        return response()->json([
            'conversion_rate_30d' => 32.5,
            'conversion_rate_trend' => 12.4,
            'abandonment_rate_30d' => 45.2,
            'abandonment_trend' => -5.2,
            'avg_time_to_pay' => 124,
            'pix_completion_rate' => 88.4,
            'funnel_by_method' => [
                'pix' => ['opened' => 1000, 'form' => 800, 'paid' => 700],
                'card' => ['opened' => 500, 'form' => 400, 'paid' => 200],
            ],
            'conversion_by_device' => [
                'desktop' => 45,
                'mobile' => 55,
            ],
        ]);
    }

    public function score(string $checkoutUuid): JsonResponse
    {
        $checkout = CheckoutExperience::where('uuid', $checkoutUuid)->firstOrFail();
        $score = CheckoutScore::where('checkout_experience_id', $checkout->id)->latest()->first();
        
        return response()->json($score);
    }

    public function abandonment(Request $request): JsonResponse
    {
        // Mocking abandonment autopsy
        return response()->json([
            'total_opened' => 1000,
            'started_form' => 750,
            'pix_generated' => 500,
            'paid' => 325,
            'abandoned_before_form' => 250,
            'abandoned_during_form' => 250,
            'abandoned_pix_waiting' => 150,
            'abandoned_after_error' => 25,
            'dominant_device' => 'iPhone',
            'dominant_hour' => 19,
            'dominant_method' => 'PIX',
            'dominant_state' => 'SP',
            'avg_amount' => 19700,
        ]);
    }

    public function riskMap(Request $request): JsonResponse
    {
        // Mocking risk map signals
        return response()->json([
            'by_state' => [
                ['state' => 'SP', 'risk_level' => 'low', 'total_sessions' => 5000, 'conversion_rate' => 35, 'refusal_rate' => 5],
                ['state' => 'RJ', 'risk_level' => 'medium', 'total_sessions' => 3000, 'conversion_rate' => 25, 'refusal_rate' => 12],
                ['state' => 'MG', 'risk_level' => 'low', 'total_sessions' => 2500, 'conversion_rate' => 30, 'refusal_rate' => 8],
                ['state' => 'PR', 'risk_level' => 'high', 'total_sessions' => 1500, 'conversion_rate' => 15, 'refusal_rate' => 28],
            ],
            'alerts' => [
                ['id' => 1, 'level' => 'critical', 'title' => 'Anomalia em SP', 'description' => 'Alta taxa de abandono no fluxo PIX nas últimas 2 horas.', 'occurred_at' => now()],
            ],
        ]);
    }

    public function sessions(Request $request): JsonResponse
    {
        $sessions = CheckoutSessionAnalytics::where('company_id', Auth::user()->company_id)
            ->latest()
            ->paginate(20);
            
        return response()->json($sessions);
    }

    public function frames(string $sessionId): JsonResponse
    {
        $frames = SessionForensicsFrame::where('session_id', $sessionId)
            ->orderBy('time_in_session_ms')
            ->get();
            
        return response()->json($frames);
    }
}
