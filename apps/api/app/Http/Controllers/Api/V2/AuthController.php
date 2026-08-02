<?php

namespace App\Http\Controllers\Api\V2;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\RegisterCompanyRequest;
use App\Models\RefreshToken;
use App\Models\User;
use App\Models\TokenAuditLog;
use App\Services\Audit\AuditService;
use App\Services\Auth\CompanyRegistrationService;
use App\Services\TwoFactorAuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class AuthController extends Controller
{
    private function audit(User $user, string $action, $tokenId = null, array $meta = [])
    {
        TokenAuditLog::create([
            'user_id'    => $user->id,
            'token_id'   => $tokenId,
            'action'     => $action,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'metadata'   => $meta,
        ]);
    }

    public function login(Request $request): JsonResponse
    {
        $data = $request->validate([
            'email'    => 'required|email',
            'password' => 'required',
        ]);

        $user = User::whereRaw('LOWER(email) = ?', [strtolower($data['email'])])->first();

        if (! $user || ! Hash::check($data['password'], $user->password)) {
            if ($user) {
                $user->incrementFailedAttempts();
            }
            return response()->json([
                'success' => false,
                'error' => ['code' => 'invalid_credentials', 'message' => 'Credenciais inválidas.'],
            ], 401);
        }

        if ($user->isLocked()) {
            return response()->json([
                'success' => false,
                'error' => ['code' => 'account_locked', 'message' => 'Conta bloqueada por excesso de tentativas.'],
            ], 403);
        }

        if ($user->isPasswordExpired()) {
            return response()->json([
                'success' => false,
                'error' => ['code' => 'password_expired', 'message' => 'Sua senha expirou (5 dias). Por favor, utilize a recuperação de senha.'],
            ], 403);
        }

        if ($user->status !== 'active') {
            return response()->json([
                'success' => false,
                'error' => ['code' => 'account_inactive', 'message' => 'Conta inativa.'],
            ], 403);
        }

        $user->resetFailedAttempts();

        // Access token — expira em 60 minutos
        $accessToken = $user->createToken(
            'access_token',
            ['access'],
            Carbon::now()->addMinutes(60)
        );

        // Refresh token — expira em 7 dias
        $refreshToken = $user->createToken(
            'refresh_token',
            ['refresh'],
            Carbon::now()->addDays(7)
        );

        $this->audit($user, 'login', $accessToken->accessToken->id, [
            '2fa_used'   => session('2fa_verified', false),
            'token_type' => 'access',
        ]);

        $responseData = [
            'success' => true,
            'data' => [
                'access_token'       => $accessToken->plainTextToken,
                'token'              => $accessToken->plainTextToken, // backward compatibility
                'refresh_token'      => $refreshToken->plainTextToken,
                'token_type'         => 'Bearer',
                'expires_in'         => 3600, // segundos
                'expires_at'         => Carbon::now()->addMinutes(60)->toIso8601String(),
                'user'  => [
                    'id'              => $user->uuid,
                    'name'            => $user->name,
                    'email'           => $user->email,
                    'role'            => $user->role,
                    'two_factor_enabled' => $user->two_factor_enabled,
                    'company_id'      => $user->company_id,
                ],
                'needs_2fa_setup' => !$user->two_factor_enabled,
            ],
        ];

        $response = response()->json($responseData);

        $response->headers->set('Set-Cookie', implode('; ', [
            "basileia_session={$accessToken->plainTextToken}",
            'HttpOnly',
            'Secure',
            'SameSite=Lax',
            'Path=/',
            'Max-Age=3600',
        ]));

        return $response;
    }

    public function refresh(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['message' => 'Não autenticado.'], 401);
        }

        // Verifica se o token atual tem a ability de refresh
        $currentToken = $user->currentAccessToken();
        if (!$currentToken || !$currentToken->can('refresh')) {
            return response()->json(['error' => 'Token inválido para refresh.'], 403);
        }

        // Revoga o refresh token atual
        $oldTokenId = $currentToken->id;
        $currentToken->delete();

        // Gera novo access token
        $newAccessToken = $user->createToken(
            'access_token',
            ['access'],
            Carbon::now()->addMinutes(60)
        );

        // Gera novo refresh token (rotação de refresh token)
        $newRefreshToken = $user->createToken(
            'refresh_token',
            ['refresh'],
            Carbon::now()->addDays(7)
        );

        $this->audit($user, 'refresh', $newAccessToken->accessToken->id, [
            'old_token_id' => $oldTokenId,
        ]);

        $response = response()->json([
            'access_token'  => $newAccessToken->plainTextToken,
            'token'         => $newAccessToken->plainTextToken, // backward compatibility
            'refresh_token' => $newRefreshToken->plainTextToken,
            'token_type'    => 'Bearer',
            'expires_in'    => 3600,
            'expires_at'    => Carbon::now()->addMinutes(60)->toIso8601String(),
        ]);

        $response->headers->set('Set-Cookie', implode('; ', [
            "basileia_session={$newAccessToken->plainTextToken}",
            'HttpOnly',
            'Secure',
            'SameSite=Lax',
            'Path=/',
            'Max-Age=3600',
        ]));

        return $response;
    }

    public function logout(Request $request): JsonResponse
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['message' => 'Não autenticado.'], 401);
        }

        $token = $user->currentAccessToken();

        if ($token) {
            $tokenId = $token->id;
            $token->delete();
            $this->audit($user, 'logout', $tokenId);
        }

        // Forget 2fa session if present
        $request->session()->forget('2fa_verified_at');

        return response()->json(['message' => 'Deslogado com sucesso.']);
    }

    public function me(Request $request): JsonResponse
    {
        $user = $request->user()->load('company');
        $token = $request->user()->currentAccessToken();

        return response()->json([
            'id'         => $user->uuid,
            'name'       => $user->name,
            'email'      => $user->email,
            'role'       => $user->role,
            'company_id' => $user->company_id,
            'company'    => $user->company?->only('id', 'name', 'logo_url'),
            'two_factor_enabled' => $user->two_factor_enabled,
            'expires_at' => $token && $token->expires_at ? $token->expires_at->toIso8601String() : null,
            'token_id'   => $token ? $token->id : null,
        ]);
    }

    public function register(RegisterCompanyRequest $request): JsonResponse
    {
        $service = app(CompanyRegistrationService::class);
        $result = $service->register($request->validated());

        $user = $result['user'];

        // Access token — expira em 60 minutos
        $accessToken = $user->createToken(
            'access_token',
            ['access'],
            Carbon::now()->addMinutes(60)
        );

        // Refresh token — expira em 7 dias
        $refreshToken = $user->createToken(
            'refresh_token',
            ['refresh'],
            Carbon::now()->addDays(7)
        );

        (new AuditService())->log('user.registered', $user, [
            'company_id' => $result['company']->id,
            'country' => $result['company']->country,
        ]);

        $this->audit($user, 'register', $accessToken->accessToken->id, [
            'token_type' => 'access',
        ]);

        $responseData = [
            'success' => true,
            'data' => [
                'access_token'       => $accessToken->plainTextToken,
                'token'              => $accessToken->plainTextToken, // backward compatibility
                'refresh_token'      => $refreshToken->plainTextToken,
                'token_type'         => 'Bearer',
                'expires_in'         => 3600,
                'expires_at'         => Carbon::now()->addMinutes(60)->toIso8601String(),
                'user' => [
                    'id' => $user->uuid,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                    'company_id' => $user->company_id,
                    'two_factor_enabled' => $user->two_factor_enabled,
                ],
                'needs_2fa_setup' => !$user->two_factor_enabled,
            ],
        ];

        $response = response()->json($responseData);

        $isSecure = $request->isSecure();

        $cookieParts = [
            "basileia_session={$accessToken->plainTextToken}",
            'HttpOnly',
            'SameSite=Lax',
            'Path=/',
            'Max-Age=3600',
        ];
        if ($isSecure) {
            $cookieParts[] = 'Secure';
        }

        $response->headers->set('Set-Cookie', implode('; ', $cookieParts));

        return $response;
    }

    public function verify2fa(Request $request): JsonResponse
    {
        // Autenticação manual via Bearer token (rota fora do auth:sanctum para evitar redirect 302)
        if ($request->isMethod('GET')) {
            return response()->json([
                'success' => false,
                'error' => [
                    'code' => 'method_not_allowed',
                    'message' => 'Use POST para verificar o código 2FA.',
                ],
            ], 405);
        }

        $user = null;

        // Tenta autenticar via Bearer token
        $bearerToken = $request->bearerToken();
        if ($bearerToken) {
            $accessToken = \Laravel\Sanctum\PersonalAccessToken::findToken($bearerToken);
            if ($accessToken && (!$accessToken->expires_at || $accessToken->expires_at->isFuture())) {
                $user = $accessToken->tokenable;
            }
        }

        // Fallback: tenta via sessão Sanctum (stateful)
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

        $validator = \Illuminate\Support\Facades\Validator::make($request->all(), [
            'code' => 'required|string|size:6',
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Código inválido.', 'errors' => $validator->errors()], 422);
        }

        $twoFactorService = app(\App\Services\TwoFactorAuthService::class);

        if ($twoFactorService->verifyCode($user, $request->input('code'))) {
            $user->update(['last_auth_at' => now()]);
            
            // Set session verification flag for two factor authentication
            if ($request->hasSession()) {
                $request->session()->put('2fa_verified_at', now()->timestamp);
            }

            // 100% STATELESS: Adiciona a ability de verificado direto no banco de dados do token!
            $token = $user->currentAccessToken();
            if (!$token && $bearerToken) {
                $token = \Laravel\Sanctum\PersonalAccessToken::findToken($bearerToken);
            }
            if ($token) {
                $abilities = $token->abilities ?? [];
                if (!in_array('2fa:verified', $abilities)) {
                    $abilities[] = '2fa:verified';
                    $token->forceFill(['abilities' => $abilities])->save();
                }
            }
            
            return response()->json([
                'success' => true,
                'message' => '2FA verificado com sucesso.',
            ]);
        }

        return response()->json([
            'message' => 'Código inválido ou expirado.',
        ], 422);
    }

    public function setup2fa(Request $request): JsonResponse
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['message' => 'Não autenticado.'], 401);
        }

        if ($user->two_factor_enabled) {
            return response()->json(['message' => '2FA já está habilitado.'], 409);
        }

        $service = app(TwoFactorAuthService::class);
        $secret = $service->generateSecret();
        
        $user->twoFactorSecretRel()->updateOrCreate(
            ['user_id' => $user->id],
            ['secret' => $secret]
        );
        
        $otpUrl = $service->generateQRCodeUrl($user);

        $svg = \SimpleSoftwareIO\QrCode\Facades\QrCode::size(200)
            ->color(30, 21, 56)
            ->generate($otpUrl);
        $qrCodeUrl = 'data:image/svg+xml;base64,' . base64_encode($svg);

        return response()->json([
            'success' => true,
            'data' => [
                'secret' => $secret,
                'qr_code_url' => $qrCodeUrl,
            ],
        ]);
    }

    public function enable2fa(Request $request): JsonResponse
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['message' => 'Não autenticado.'], 401);
        }

        $validator = \Illuminate\Support\Facades\Validator::make($request->all(), [
            'code' => 'required|string|size:6',
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Código inválido.', 'errors' => $validator->errors()], 422);
        }

        $service = app(TwoFactorAuthService::class);

        if ($service->enable($user, $request->input('code'))) {
            // Ensure two_factor_enabled is saved bypassing any mass-assignment issues
            $user->forceFill(['two_factor_enabled' => true])->save();
            \Illuminate\Support\Facades\DB::table('users')->where('id', $user->id)->update(['two_factor_enabled' => true]);
            
            // Set session verification flag so they don't have to verify immediately
            $request->session()->put('2fa_verified_at', now()->timestamp);

            // 100% STATELESS: Adiciona a ability de verificado direto no banco de dados do token!
            $token = $user->currentAccessToken();
            if ($token) {
                $abilities = $token->abilities ?? [];
                if (!in_array('2fa:verified', $abilities)) {
                    $abilities[] = '2fa:verified';
                    $token->forceFill(['abilities' => $abilities])->save();
                }
            }

            $secretModel = $user->twoFactorSecretRel()->first();
            $recoveryCodes = [];

            if ($secretModel && $secretModel->recovery_codes) {
                $vaultData = json_decode($secretModel->recovery_codes, true);
                
                if (is_array($vaultData) && isset($vaultData['encrypted_value'], $vaultData['key_version'])) {
                    $vault = app(\App\Services\Vault\VaultService::class);
                    $decrypted = $vault->decrypt($vaultData['encrypted_value'], $vaultData['key_version']);
                    $recoveryCodes = json_decode($decrypted, true);
                } else {
                    // Fallback para dados antigos
                    $decrypted = \Illuminate\Support\Facades\Crypt::decryptString($secretModel->recovery_codes);
                    $recoveryCodes = json_decode($decrypted, true);
                }
            }

            return response()->json([
                'success' => true,
                'message' => '2FA habilitado com sucesso.',
                'data' => [
                    'recovery_codes' => $recoveryCodes,
                ],
            ]);
        }

        return response()->json([
            'message' => 'Código inválido. Tente novamente.',
        ], 422);
    }


}
