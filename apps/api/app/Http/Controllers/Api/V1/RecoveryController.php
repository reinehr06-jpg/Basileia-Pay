<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\RecoveryCampaign;
use App\Models\RecoveryAttempt;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class RecoveryController extends Controller
{
    public function campaigns(Request $request): JsonResponse
    {
        $campaigns = RecoveryCampaign::where('company_id', Auth::user()->company_id)->get();
        return response()->json($campaigns);
    }

    public function attempts(Request $request): JsonResponse
    {
        $attempts = RecoveryAttempt::where('company_id', Auth::user()->company_id)
            ->when($request->checkout_id, fn($q) => $q->where('checkout_session_id', $request->checkout_id))
            ->latest()
            ->paginate(20);
            
        return response()->json($attempts);
    }

    public function stats(Request $request): JsonResponse
    {
        // Mocking recovery stats
        return response()->json([
            'recovered_count' => 124,
            'recovered_revenue' => 3500000,
            'recovery_rate' => 18.5,
            'email_open_rate' => 42.1,
            'funnel' => [
                'sent' => 1000,
                'opened' => 421,
                'clicked' => 200,
                'recovered' => 124,
            ]
        ]);
    }

    public function storeCampaign(Request $request): JsonResponse
    {
        $campaign = RecoveryCampaign::create(array_merge($request->all(), [
            'company_id' => Auth::user()->company_id,
            'uuid' => \Illuminate\Support\Str::uuid(),
        ]));
        
        return response()->json($campaign, 201);
    }
}
