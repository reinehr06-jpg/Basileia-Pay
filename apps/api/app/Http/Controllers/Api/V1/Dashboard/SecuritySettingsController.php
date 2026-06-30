<?php

namespace App\Http\Controllers\Api\V1\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\AuthSession;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SecuritySettingsController extends Controller
{
    /**
     * Listar sessões ativas do usuário.
     */
    public function sessions(Request $request): JsonResponse
    {
        $sessions = AuthSession::where('user_id', $request->user()->id)
            ->orderBy('last_activity', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data'    => $sessions
        ]);
    }

    /**
     * Encerrar uma sessão específica.
     */
    public function revokeSession(string $tokenId, Request $request): JsonResponse
    {
        $session = AuthSession::where('user_id', $request->user()->id)
            ->where('token_id', $tokenId)
            ->first();

        if ($session) {
            // Revogar token do Sanctum
            $request->user()->tokens()->where('id', $tokenId)->delete();
            // Remover registro de sessão
            $session->delete();
        }

        return response()->json(['success' => true]);
    }

    /**
     * Obter status de segurança (2FA).
     */
    public function status(Request $request): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data'    => [
                'two_factor_enabled' => (bool) $request->user()->two_factor_enabled,
                'last_password_change' => $request->user()->updated_at,
            ]
        ]);
    }
}
