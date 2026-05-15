<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\CheckoutSession;
use App\Models\SocialProofConfig;
use App\Domain\SocialProof\Services\SocialProofService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PublicExperienceController extends Controller
{
    public function socialProof(string $token, SocialProofService $service): JsonResponse
    {
        $session = CheckoutSession::where('session_token', $token)->firstOrFail();
        $data = $service->resolve($session->checkout_experience_id);
        
        return response()->json($data);
    }

    public function guarantee(string $token): JsonResponse
    {
        $session = CheckoutSession::where('session_token', $token)->firstOrFail();
        $config = \App\Models\GuaranteeConfig::where('checkout_experience_id', $session->checkout_experience_id)->first();
        
        return response()->json($config);
    }
}
