<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\CheckoutSession;
use App\Domain\Memory\Services\CustomerMemoryService;
use App\Domain\Adaptive\Services\AdaptiveCheckoutEngine;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PublicAdaptiveController extends Controller
{
    public function resolve(
        Request $request, 
        string $token, 
        CustomerMemoryService $memory, 
        AdaptiveCheckoutEngine $engine
    ): JsonResponse {
        $session = CheckoutSession::where('session_token', $token)->firstOrFail();
        $email = $request->input('email') ?? $session->customer_email;
        $fingerprint = $request->input('device_fingerprint', 'unknown');

        $context = $email 
            ? $memory->resolve($email, $session->company_id, $fingerprint)
            : ['profile' => null, 'isReturning' => false, 'isTrustedDevice' => false, 'preferredMethod' => 'pix', 'riskLevel' => 'low', 'canPrefill' => false, 'prefillData' => null];

        $decision = $engine->resolve($session, $context);

        return response()->json($decision);
    }
}
