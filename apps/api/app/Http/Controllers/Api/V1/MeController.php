<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\UserSession;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class MeController extends Controller
{
    public function updatePreferences(Request $request): JsonResponse
    {
        $user = Auth::user();
        $preferences = $user->preferences ?? [];
        
        $newPrefs = array_merge($preferences, $request->only(['theme', 'language', 'notifications']));
        
        $user->update(['preferences' => $newPrefs]);

        return response()->json(['status' => 'updated', 'preferences' => $newPrefs]);
    }

    public function sessions(): JsonResponse
    {
        $sessions = UserSession::where('user_id', Auth::id())
            ->where('expires_at', '>', now())
            ->latest()
            ->get();
            
        return response()->json($sessions);
    }

    public function revokeSession(string $id): JsonResponse
    {
        UserSession::where('user_id', Auth::id())
            ->where('id', $id)
            ->delete();
            
        return response()->json(['status' => 'revoked']);
    }
}
