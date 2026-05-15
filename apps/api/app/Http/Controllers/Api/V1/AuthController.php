<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\Audit\AuditService;
use App\Services\TwoFactorAuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function __construct(
        private AuditService $audit,
        private TwoFactorAuthService $twoFactor,
    ) {}

    /**
     * POST /api/v1/auth/login
     * Email + password login. Returns Sanctum token.
     */
    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        $user = User::withoutGlobalScope('company')
            ->where('email', $request->email)
            ->first();

        if (!$user) {
            $this->audit->log('auth.login_failed', null, null, null, null, [
                'email' => $request->email,
                'reason' => 'user_not_found',
            ]);
            return response()->json(['error' => 'invalid_credentials', 'message' => 'Credenciais inválidas.'], 401);
        }

        // Check if account is locked
        if ($user->isLocked()) {
            $lockedMinutesAgo = $user->locked_at ? now()->diffInMinutes($user->locked_at) : 0;
            $lockoutMinutes = config('security.password.lockout_minutes', 30);

            if ($lockedMinutesAgo < $lockoutMinutes) {
                $remaining = $lockoutMinutes - $lockedMinutesAgo;
                $this->audit->log('auth.login_blocked', null, $user->id, 'User', $user->id, [
                    'reason' => 'account_locked',
                ]);
                return response()->json([
                    'error' => 'account_locked',
                    'message' => "Conta bloqueada. Tente novamente em {$remaining} minutos.",
                    'retry_after_minutes' => $remaining,
                ], 429);
            }

            // Lock period expired — reset
            $user->update([
                'status' => 'active',
                'locked_at' => null,
                'failed_attempts' => 0,
            ]);
        }

        // Verify password
        if (!Hash::check($request->password, $user->password)) {
            $user->incrementFailedAttempts();

            $this->audit->log('auth.login_failed', $user->company_id, $user->id, 'User', $user->id, [
                'reason' => 'invalid_password',
                'failed_attempts' => $user->fresh()->failed_attempts,
            ]);

            $remaining = config('security.password.max_failed_attempts', 5) - $user->fresh()->failed_attempts;
            $remaining = max($remaining, 0);

            return response()->json([
                'error' => 'invalid_credentials',
                'message' => 'Credenciais inválidas.',
                'remaining_attempts' => $remaining,
            ], 401);
        }

        // Check status
        if ($user->status !== 'active') {
            return response()->json([
                'error' => 'account_inactive',
                'message' => 'Conta inativa. Entre em contato com o administrador.',
            ], 403);
        }

        // Reset failed attempts
        $user->resetFailedAttempts();

        // Check if 2FA is required
        if ($user->two_factor_enabled) {
            $tempToken = $user->createToken('2fa-pending', ['2fa:verify'], now()->addMinutes(5));

            $this->audit->log('auth.2fa_required', $user->company_id, $user->id);

            return response()->json([
                'requires_2fa' => true,
                'temp_token' => $tempToken->plainTextToken,
                'message' => 'Autenticação de dois fatores necessária.',
            ]);
        }

        // Create full session token
        $token = $user->createToken('session', ['*'], now()->addHours(8));

        $this->audit->log('auth.login_success', $user->company_id, $user->id);

        return response()->json([
            'token' => $token->plainTextToken,
            'user' => [
                'id' => $user->id,
                'uuid' => $user->uuid,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'company_id' => $user->company_id,
                'two_factor_enabled' => $user->two_factor_enabled,
                'needs_password_change' => $user->needsPasswordChange(),
            ],
        ]);
    }

    /**
     * POST /api/v1/auth/logout
     */
    public function logout(Request $request): JsonResponse
    {
        $user = $request->user();
        $request->user()->currentAccessToken()->delete();

        $this->audit->log('auth.logout', $user->company_id, $user->id);

        return response()->json(['message' => 'Sessão encerrada.']);
    }

    /**
     * GET /api/v1/auth/me
     */
    public function me(Request $request): JsonResponse
    {
        $user = $request->user();

        return response()->json([
            'id' => $user->id,
            'uuid' => $user->uuid,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role,
            'company_id' => $user->company_id,
            'two_factor_enabled' => $user->two_factor_enabled,
            'needs_password_change' => $user->needsPasswordChange(),
            'last_login_at' => $user->last_login_at?->toIso8601String(),
        ]);
    }

    /**
     * POST /api/v1/auth/2fa/enable
     */
    public function enable2fa(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user->two_factor_enabled) {
            return response()->json(['error' => 'already_enabled', 'message' => '2FA já está ativado.'], 409);
        }

        $secret = $this->twoFactor->generateSecret();
        $user->update(['two_factor_secret' => $secret]);

        $qrUrl = $this->twoFactor->generateQRCodeUrl($user);

        return response()->json([
            'secret' => $secret,
            'qr_url' => $qrUrl,
            'message' => 'Escaneie o QR code no seu app autenticador e confirme com o código.',
        ]);
    }

    /**
     * POST /api/v1/auth/2fa/confirm
     */
    public function confirm2fa(Request $request): JsonResponse
    {
        $request->validate(['code' => 'required|string|size:6']);

        $user = $request->user();

        if ($user->two_factor_enabled) {
            return response()->json(['error' => 'already_confirmed'], 409);
        }

        if (!$user->two_factor_secret) {
            return response()->json(['error' => 'not_initialized', 'message' => 'Primeiro habilite o 2FA.'], 422);
        }

        $enabled = $this->twoFactor->enable($user, $request->code);

        if (!$enabled) {
            return response()->json(['error' => 'invalid_code', 'message' => 'Código inválido.'], 422);
        }

        $user->update(['two_factor_confirmed_at' => now()]);

        $this->audit->log('auth.2fa_enabled', $user->company_id, $user->id);

        return response()->json(['message' => '2FA ativado com sucesso.']);
    }

    /**
     * POST /api/v1/auth/2fa/disable
     */
    public function disable2fa(Request $request): JsonResponse
    {
        $request->validate(['password' => 'required|string']);

        $user = $request->user();

        if (!$user->two_factor_enabled) {
            return response()->json(['error' => 'not_enabled'], 409);
        }

        $disabled = $this->twoFactor->disable($user, $request->password);

        if (!$disabled) {
            return response()->json(['error' => 'invalid_password', 'message' => 'Senha incorreta.'], 422);
        }

        $this->audit->log('auth.2fa_disabled', $user->company_id, $user->id);

        return response()->json(['message' => '2FA desativado.']);
    }

    /**
     * POST /api/v1/auth/2fa/verify
     * Verifies 2FA code during login flow. Requires temp_token from login.
     */
    public function verify2fa(Request $request): JsonResponse
    {
        $request->validate(['code' => 'required|string|size:6']);

        $user = $request->user();

        $valid = $this->twoFactor->verifyCode($user, $request->code);

        if (!$valid) {
            $valid = $this->twoFactor->verifyBackupCode($user, $request->code);
        }

        if (!$valid) {
            $this->audit->log('auth.2fa_failed', $user->company_id, $user->id);
            return response()->json(['error' => 'invalid_code', 'message' => 'Código 2FA inválido.'], 422);
        }

        // Delete temp token and issue full session
        $request->user()->currentAccessToken()->delete();
        $token = $user->createToken('session', ['*'], now()->addHours(8));

        $this->audit->log('auth.2fa_verified', $user->company_id, $user->id);

        return response()->json([
            'token' => $token->plainTextToken,
            'user' => [
                'id' => $user->id,
                'uuid' => $user->uuid,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'company_id' => $user->company_id,
            ],
        ]);
    }

    /**
     * POST /api/v1/auth/reauth
     * Reconfirm identity for critical actions.
     */
    public function reauth(Request $request): JsonResponse
    {
        $request->validate(['password' => 'required|string']);

        $user = $request->user();

        if (!Hash::check($request->password, $user->password)) {
            $this->audit->log('auth.reauth_failed', $user->company_id, $user->id);
            return response()->json(['error' => 'invalid_password', 'message' => 'Senha incorreta.'], 422);
        }

        session(['reauth_confirmed_at' => now()]);

        $this->audit->log('auth.reauth_success', $user->company_id, $user->id);

        return response()->json([
            'message' => 'Identidade confirmada.',
            'valid_for_minutes' => config('security.reauth_window_minutes', 10),
        ]);
    }
}
