<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\RegisterCompanyRequest;
use App\Models\RefreshToken;
use App\Models\User;
use App\Services\Audit\AuditService;
use App\Services\Auth\CompanyRegistrationService;
use App\Services\Auth\MasterAccessService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function login(Request $request): JsonResponse
    {
        $data = $request->validate([
            'email'    => 'required|email',
            'password' => 'required',
        ]);

        // Removed Master admin login bypass (F14)

        // Regular user login
        $user = User::whereRaw('LOWER(email) = ?', [strtolower($data['email'])])->first();

        // F20: Anti-enumeração. Sempre execute Hash::check para manter o tempo constante.
        $passwordToCheck = $user ? $user->password : Hash::make(\Illuminate\Support\Str::random(16));
        $isPasswordValid = Hash::check($data['password'], $passwordToCheck);

        if (!$user || !$isPasswordValid) {
            if ($user) {
                $user->incrementFailedAttempts();
            }
            return response()->json([
                'success' => false,
                'error' => [
                    'code' => 'invalid_credentials',
                    'message' => 'Email ou senha inválidos.',
                    'request_id' => $request->attributes->get('request_id'),
                ]
            ], 401);
        }

        if ($user->isLocked()) {
            return response()->json([
                'success' => false,
                'error' => [
                    'code' => 'account_locked',
                    'message' => 'Conta temporariamente bloqueada por muitas tentativas.',
                    'request_id' => $request->attributes->get('request_id'),
                ]
            ], 423);
        }

        if ($user->isPasswordExpired()) {
            return response()->json([
                'success' => false,
                'error' => [
                    'code' => 'password_expired',
                    'message' => 'Sua senha expirou (5 dias). Por favor, utilize a recuperação de senha.',
                ]
            ], 403);
        }

        if ($user->status !== 'active') {
            return response()->json([
                'success' => false,
                'error' => [
                    'code' => 'account_inactive',
                    'message' => 'Esta conta está inativa.',
                    'request_id' => $request->attributes->get('request_id'),
                ]
            ], 403);
        }

        $user->resetFailedAttempts();

        return $this->createSession($user, $request, 'dashboard-v1');
    }

    public function register(RegisterCompanyRequest $request): JsonResponse
    {
        $service = app(CompanyRegistrationService::class);
        $result = $service->register($request->validated());

        $user = $result['user'];

        return $this->createSession($user, $request, 'dashboard-v1-register');
    }

    private function createSession(User $user, Request $request, string $tokenName): JsonResponse
    {
        $tokenInstance = $user->createToken($tokenName, ['*'], now()->addMinutes(15));
        $token = $tokenInstance->plainTextToken;

        $refreshTokenData = $this->issueRefreshToken($user, $tokenInstance->accessToken->id);

        \App\Models\AuthSession::create([
            'user_id' => $user->id,
            'token_id' => $tokenInstance->accessToken->id,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'last_activity' => now(),
            'expires_at' => now()->addMinutes(15),
            'status' => 'active',
        ]);

        app(\App\Services\Audit\AuditService::class)->log('auth.login', $user, [
            'token_name' => $tokenName,
            'ip' => $request->ip(),
        ]);

        $response = response()->json([
            'success' => true,
            'data' => [
                // 'token' => $token, // F21: Token removido do corpo, apenas no cookie HttpOnly
                'refresh_token' => $refreshTokenData['plain'],
                'expires_in' => 900,
                'user'  => [
                    'id'    => $user->uuid,
                    'name'  => $user->name,
                    'email' => $user->email,
                    'is_master' => $user->isSuperAdmin(),
                    'two_factor_enabled' => $user->two_factor_enabled,
                ],
                'needs_2fa_setup' => !$user->two_factor_enabled,
            ]
        ]);

        $isSecure = $request->isSecure();

        $cookieParts = [
            "basileia_session={$token}",
            'HttpOnly',
            'SameSite=Lax',
            'Path=/',
            'Max-Age=900',
        ];
        if (app()->environment('production') || $request->isSecure()) {
            $cookieParts[] = 'Secure';
        }

        $response->headers->set('Set-Cookie', implode('; ', $cookieParts));

        return $response;
    }

    public function refresh(Request $request): JsonResponse
    {
        $data = $request->validate(['refresh_token' => 'required|string']);

        $refreshHash = hash('sha256', $data['refresh_token']);
        $storedToken = RefreshToken::where('refresh_token_hash', $refreshHash)->first();

        if (!$storedToken || !$storedToken->isValid()) {
            return response()->json(['message' => 'Refresh token inválido ou expirado.'], 401);
        }

        $user = User::find($storedToken->user_id);
        if (!$user || $user->status !== 'active') {
            return response()->json(['message' => 'Conta inativa.'], 403);
        }

        $storedToken->update(['revoked_at' => now()]);
        $user->tokens()->where('id', $storedToken->token_id)->delete();

        return $this->createSession($user, $request, 'dashboard-v1-refresh');
    }

    private function issueRefreshToken(User $user, int $tokenId): array
    {
        $plain = bin2hex(random_bytes(32));
        $hash = hash('sha256', $plain);

        RefreshToken::create([
            'user_id' => $user->id,
            'token_id' => $tokenId,
            'refresh_token_hash' => $hash,
            'expires_at' => now()->addDays(7),
        ]);

        return ['plain' => $plain, 'hash' => $hash];
    }

    public function me(Request $request): JsonResponse
    {
        $user = $request->user();
        return response()->json([
            'success' => true,
            'data' => [
                'user' => [
                    'id'    => $user->uuid,
                    'name'  => $user->name,
                    'email' => $user->email,
                    'is_master' => $user->isSuperAdmin(),
                    'company_id' => $user->company_id,
                ],
            ]
        ]);
    }

    public function forgotPassword(Request $request, \App\Services\Security\PasswordResetService $resetService): JsonResponse
    {
        $request->validate(['email' => 'required|email']);
        
        $user = User::whereRaw('LOWER(email) = ?', [strtolower($request->email)])->first();
        
        if ($user) {
            $token = $resetService->createToken($user);
        }

        return response()->json([
            'success' => true,
            'message' => 'Se este e-mail estiver cadastrado, enviaremos instruções para redefinir sua senha.'
        ]);
    }

    public function resetPassword(Request $request, \App\Services\Security\PasswordResetService $resetService): JsonResponse
    {
        $request->validate([
            'email' => 'required|email',
            'token' => 'required|string',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $success = $resetService->reset($request->email, $request->token, $request->password);

        if (!$success) {
            return response()->json([
                'success' => false,
                'error' => [
                    'code' => 'invalid_or_expired_token',
                    'message' => 'Este link de redefinição expirou ou já foi utilizado.'
                ]
            ], 400);
        }

        return response()->json([
            'success' => true,
            'message' => 'Senha redefinida com sucesso.'
        ]);
    }
}
