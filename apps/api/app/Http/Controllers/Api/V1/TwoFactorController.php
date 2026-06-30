<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\TwoFactorAuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Laravel\Sanctum\PersonalAccessToken;

class TwoFactorController extends Controller
{
    public function verify(Request $request, TwoFactorAuthService $twoFactorService): JsonResponse
    {
        $user = null;

        $bearerToken = $request->bearerToken();
        if ($bearerToken) {
            $accessToken = PersonalAccessToken::findToken($bearerToken);
            if ($accessToken && (!$accessToken->expires_at || $accessToken->expires_at->isFuture())) {
                $user = $accessToken->tokenable;
            }
        }

        if (!$user) {
            $user = $request->user();
        }

        if (!$user) {
            return response()->json([
                'success' => false,
                'error' => [
                    'code' => 'unauthenticated',
                    'message' => 'Sessão expirada. Faça login novamente.',
                ],
            ], 401);
        }

        $validator = Validator::make($request->all(), [
            'code' => 'required|string|size:6',
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Código inválido.', 'errors' => $validator->errors()], 422);
        }

        if ($twoFactorService->verifyCode($user, $request->input('code'))) {
            $user->update(['last_auth_at' => now()]);
            
            if ($request->hasSession()) {
                $request->session()->put('2fa_verified_at', now()->timestamp);
            }

            $token = $user->currentAccessToken();
            if (!$token && $bearerToken) {
                $token = PersonalAccessToken::findToken($bearerToken);
            }
            if ($token) {
                $abilities = $token->abilities ?? [];
                if (!in_array('2fa:verified', $abilities)) {
                    $abilities[] = '2fa:verified';
                    $token->forceFill(['abilities' => $abilities])->save();
                }
            }
            
            app(\App\Services\Audit\AuditService::class)->log('auth.2fa.verify', $user, [
                'success' => true,
            ]);
            
            return response()->json([
                'success' => true,
                'message' => '2FA verificado com sucesso.',
            ]);
        }

        return response()->json([
            'message' => 'Código inválido ou expirado.',
        ], 422);
    }
}
