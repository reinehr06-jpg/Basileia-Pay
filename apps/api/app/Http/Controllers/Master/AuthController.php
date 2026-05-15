<?php

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Services\MasterAccess\MasterAccessService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class AuthController extends Controller
{
    /**
     * Redeem token and ephemeral secret to obtain master session.
     */
    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'token' => 'required|string',
            'ephemeral_secret' => 'required|string',
            'email' => 'required|email',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $service = new MasterAccessService();
        $result = $service->redeemToken($request->token, $request->ephemeral_secret, $request->email);

        if (!$result) {
            return response()->json(['error' => 'Invalid token or secret.'], 403);
        }

        $session = $result['session'];
        $rawToken = $result['token'];

        return response()->json([
            'session_token' => $rawToken,
            'expires_at' => $session->expires_at?->toIso8601String(),
        ]);
    }

    /**
     * Validate master session token.
     */
    public function validateSession(Request $request)
    {
        $token = $request->bearerToken() ?? $request->input('session_token');
        if (!$token) {
            return response()->json(['error' => 'session_token required'], 401);
        }

        $service = new MasterAccessService();
        $session = $service->validateSession($token);

        if (!$session) {
            return response()->json(['error' => 'Invalid or expired session'], 401);
        }

        return response()->json([
            'valid' => true,
            'session_id' => $session->uuid,
            'expires_at' => $session->expires_at?->toIso8601String(),
        ]);
    }

    /**
     * Revoke a master session.
     */
    public function logout(Request $request)
    {
        $token = $request->bearerToken();
        if (!$token) {
            return response()->json(['error' => 'session_token required'], 401);
        }

        $service = new MasterAccessService();
        $revoked = $service->revokeSession($token);

        if ($revoked) {
            return response()->json(['message' => 'Session revoked']);
        }

        return response()->json(['error' => 'Session not found or already revoked'], 404);
    }
}
