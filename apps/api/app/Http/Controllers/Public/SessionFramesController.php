<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\CheckoutSession;
use App\Models\SessionForensicsFrame;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SessionFramesController extends Controller
{
    public function store(Request $request, string $token): JsonResponse
    {
        $session = CheckoutSession::where('session_token', $token)->firstOrFail();

        $frames = $request->input('frames', []);

        if (count($frames) > 50) {
            return response()->json(['error' => 'too_many_frames'], 422);
        }

        $ALLOWED_TYPES = ['scroll', 'focus', 'blur', 'click', 'pause', 'method_change', 'error', 'abandon'];
        $BLOCKED_FIELDS = ['card_number', 'cvv', 'expiry', 'document', 'password', 'token'];

        $safe = collect($frames)
            ->filter(fn($f) => in_array($f['type'] ?? '', $ALLOWED_TYPES))
            ->filter(fn($f) => !in_array($f['element_id'] ?? '', $BLOCKED_FIELDS))
            ->map(fn($f) => [
                'session_id'    => $session->id,
                'company_id'    => $session->company_id,
                'frame_type'    => $f['type'],
                'element_id'    => $f['element_id'] ?? null,
                'scroll_position' => $f['scrollY'] ?? null,
                'time_in_session_ms' => (int)($f['timeMs'] ?? 0),
                'method_context' => $f['method'] ?? null,
                'error_code'    => $f['errorCode'] ?? null,
                'occurred_at'   => now(),
            ])
            ->values();

        SessionForensicsFrame::insert($safe->toArray());

        return response()->json(['accepted' => $safe->count()]);
    }

    public function abandon(Request $request, string $token): JsonResponse
    {
        $session = CheckoutSession::where('session_token', $token)->firstOrFail();
        
        $session->update([
            'status' => 'abandoned',
            // In a real scenario we'd update analytics table too
        ]);

        return response()->json(['status' => 'abandoned']);
    }
}
