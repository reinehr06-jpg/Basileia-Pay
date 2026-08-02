<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\WebAuthnCredential;
use App\Services\Auth\MasterAccessService;
use App\Services\Auth\MasterUrlService;
use App\Services\Auth\OneTimeMasterLink;
use App\Services\Auth\SessionBinder;
use App\Services\Auth\WebAuthnService;
use App\Services\Audit\AuditService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class MasterAccessController extends Controller
{
    private MasterAccessService $masterService;
    private WebAuthnService $webauthnService;
    private AuditService $audit;
    private SessionBinder $binder;

    public function __construct(
        MasterAccessService $masterService,
        WebAuthnService $webauthnService,
        AuditService $audit,
        SessionBinder $binder,
    ) {
        $this->masterService = $masterService;
        $this->webauthnService = $webauthnService;
        $this->audit = $audit;
        $this->binder = $binder;
    }

    /* ═══════════════════════════════════════
       Camada 1 — Página da URL Efêmera
       ═══════════════════════════════════════ */

    public function showPage(Request $request): \Illuminate\View\View|\Illuminate\Http\RedirectResponse
    {
        $check = $this->check2FASession($request);
        if ($check) {
            return $check;
        }

        return view('master.access', [
            'webauthnAvailable' => WebAuthnCredential::count() > 0,
            'frontendUrl' => config('app.frontend_url', 'http://localhost:3000'),
        ]);
    }

    /* ═══════════════════════════════════════
       Camada 2 — WebAuthn (YubiKey)
       ═══════════════════════════════════════ */

    public function webauthnRegisterBegin(Request $request): JsonResponse
    {
        $userId = $request->user()?->id ?? 'master-admin';
        $challenge = $this->webauthnService->generateChallenge();
        session()->put('webauthn_challenge', $challenge);

        $options = $this->webauthnService->buildCreationOptions($challenge, (string) $userId);

        return response()->json($options);
    }

    public function webauthnRegisterComplete(Request $request): JsonResponse
    {
        $challenge = session()->pull('webauthn_challenge');
        if (empty($challenge)) {
            return response()->json(['error' => 'No challenge in session'], 400);
        }

        $credential = $request->validate([
            'id' => 'required|string',
            'rawId' => 'nullable|string',
            'clientDataJSON' => 'required|string',
            'attestationObject' => 'required|string',
        ]);

        try {
            $result = $this->webauthnService->verifyRegistration($challenge, $credential);
        } catch (\RuntimeException $e) {
            $this->audit->log('master.webauthn.register.failed', null, [
                'ip' => $request->ip(),
                'error' => app()->environment('production') ? 'Erro interno do servidor.' : $e->getMessage(),
            ]);
            return response()->json(['error' => app()->environment('production') ? 'Erro interno do servidor.' : $e->getMessage()], 400);
        }

        WebAuthnCredential::create([
            'credential_id' => $result['credential_id'],
            'public_key' => $result['public_key'],
        ]);

        $this->audit->log('master.webauthn.register.success', null, [
            'ip' => $request->ip(),
            'credential_id' => substr($result['credential_id'], 0, 16) . '...',
        ]);

        return response()->json(['success' => true, 'credential_id' => $result['credential_id']]);
    }

    public function webauthnAuthenticateBegin(): JsonResponse
    {
        $credential = WebAuthnCredential::latest('id')->first();
        if (!$credential) {
            return response()->json(['error' => 'No WebAuthn credential registered'], 400);
        }

        $challenge = $this->webauthnService->generateChallenge();
        session()->put('webauthn_challenge', $challenge);

        $options = $this->webauthnService->buildRequestOptions($challenge, $credential->credential_id);

        return response()->json($options);
    }

    public function webauthnAuthenticateComplete(Request $request): JsonResponse
    {
        $challenge = session()->pull('webauthn_challenge');
        if (empty($challenge)) {
            return response()->json(['error' => 'No challenge in session'], 400);
        }

        $assertion = $request->input('assertion', $request->all());

        if (empty($assertion['id']) || empty($assertion['clientDataJSON']) ||
            empty($assertion['authenticatorData']) || empty($assertion['signature'])) {
            return response()->json(['error' => 'Invalid assertion data'], 400);
        }

        $storedCredential = WebAuthnCredential::where('credential_id', $assertion['id'])->first();
        if (!$storedCredential) {
            return response()->json(['error' => 'Credential not found'], 404);
        }

        $valid = $this->webauthnService->verifyAuthentication($challenge, $assertion, $storedCredential->public_key);

        if (!$valid) {
            $this->audit->log('master.webauthn.auth.failed', null, [
                'ip' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);
            return response()->json(['error' => 'Authentication failed'], 401);
        }

        $this->set2FAVerified($request);

        $this->audit->log('master.webauthn.auth.success', null, [
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json(['success' => true]);
    }

    /* ═══════════════════════════════════════
       Camada 2 — Fallback TOTP
       ═══════════════════════════════════════ */

    public function totpFallback(Request $request): JsonResponse
    {
        $data = $request->validate(['totp' => 'required|string|min:4']);

        $fallbackSeed = config('master.fallback_totp_seed');
        $valid = false;

        if (!empty($fallbackSeed)) {
            $fallbackService = new MasterAccessService($fallbackSeed);
            $valid = $fallbackService->validateCode($data['totp']);
        }

        if (!$valid && !$this->masterService->validateCode($data['totp'])) {
            $this->audit->log('master.2fa.totp.failed', null, [
                'ip' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);
            return response()->json(['error' => 'Invalid TOTP code'], 401);
        }

        $this->set2FAVerified($request);

        $this->audit->log('master.2fa.totp.success', null, [
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json(['success' => true]);
    }

    /* ═══════════════════════════════════════
       Camada 2 — 2FA Status
       ═══════════════════════════════════════ */

    public function webauthnStatus(): JsonResponse
    {
        $hasCredential = WebAuthnCredential::count() > 0;
        return response()->json([
            'registered' => $hasCredential,
            'verified' => session()->has('master_2fa_verified') && session('master_2fa_verified') === true,
        ]);
    }

    /* ═══════════════════════════════════════
       Camada 3 — Código TOTP (requer 2FA)
       ═══════════════════════════════════════ */

    public function code(): JsonResponse
    {
        $code = $this->masterService->generateCode();
        $expiresIn = 20 - (time() % 20);

        return response()->json([
            'success' => true,
            'data' => [
                'code' => $code,
                'expires_in' => $expiresIn,
                'email' => $this->masterService->getMasterEmail(),
            ],
        ]);
    }

    /* ═══════════════════════════════════════
       Camada 4 — Login com Session Binding
       ═══════════════════════════════════════ */

    public function validateMaster(Request $request): JsonResponse
    {
        $data = $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        $masterEmail = $this->masterService->getMasterEmail();

        if (strtolower($data['email']) !== strtolower($masterEmail)) {
            return response()->json(['message' => 'Credenciais inválidas.'], 401);
        }

        if (!$this->masterService->validateCode($data['password'])) {
            $this->audit->log('master.login.failed', null, [
                'ip' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);
            return response()->json(['message' => 'Credenciais inválidas.'], 401);
        }

        $user = User::where('email', $masterEmail)->first();
        if (!$user || $user->role !== 'super_admin') {
            return response()->json(['message' => 'Credenciais inválidas.'], 401);
        }

        $token = $user->createToken('master-access', ['*'], now()->addMinutes(20))->plainTextToken;
        $this->binder->bind($request);

        $this->audit->log('master.login.success', $user, [
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        $response = response()->json([
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'is_master' => true,
            ],
        ]);

        $response->headers->set('Set-Cookie', implode('; ', [
            "basileia_session={$token}",
            'HttpOnly',
            'Secure',
            'SameSite=Lax',
            'Path=/',
            'Max-Age=1200',
        ]));

        session()->forget('master_2fa_verified');
        session()->forget('master_2fa_expires');

        return $response;
    }

    public function companiesList(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user || !$user->isSuperAdmin()) {
            return response()->json(['message' => 'Não autorizado.'], 403);
        }

        // Only enforce binder check if the session has a master fingerprint (e.g. Master TOTP access page)
        if (session()->has('master_fingerprint')) {
            if (!$this->binder->check($request)) {
                $this->audit->log('master.session.fingerprint_mismatch', $user, [
                    'ip' => $request->ip(),
                    'user_agent' => $request->userAgent(),
                ]);
                $request->user()->currentAccessToken()->delete();
                return response()->json(['message' => 'Session fingerprint changed. Re-login required.'], 401);
            }

            if ($this->binder->isExpired()) {
                $request->user()->currentAccessToken()->delete();
                return response()->json(['message' => 'Master session expired (20 min). Re-login required.'], 401);
            }
        }

        $companies = \App\Models\Company::select('id', 'uuid', 'name', 'slug', 'status')
            ->orderBy('name')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $companies,
        ]);
    }

    /* ═══════════════════════════════════════
       Helpers
       ═══════════════════════════════════════ */

    private function set2FAVerified(Request $request): void
    {
        session()->put('master_2fa_verified', true);
        session()->put('master_2fa_expires', now()->addMinutes(5)->timestamp);
        $this->binder->bind($request);
    }

    private function check2FASession(Request $request): ?\Illuminate\Http\RedirectResponse
    {
        if (session()->has('master_2fa_verified') && session('master_2fa_verified') === true) {
            if (session()->get('master_2fa_expires', 0) >= now()->timestamp) {
                if ($this->binder->check($request)) {
                    return null;
                }
                session()->forget('master_2fa_verified');
            }
        }
        return null;
    }

    public function urlInfo(): JsonResponse
    {
        $service = app(MasterUrlService::class);
        return response()->json([
            'path' => $service->todayPath(),
            'date' => date('Y-m-d'),
        ]);
    }

    /* ═══════════════════════════════════════
       One-Time Signed Link (TTL 30s)
       ═══════════════════════════════════════ */

    public function generateLink(Request $request): JsonResponse
    {
        $user = $request->user();
        if (!$user || !$user->isSuperAdmin()) {
            return response()->json(['error' => 'Não autorizado.'], 403);
        }

        $linkService = app(OneTimeMasterLink::class);
        $urlService = app(MasterUrlService::class);

        $token = $linkService->generate($urlService);
        $frontendUrl = config('app.frontend_url', 'http://localhost:3000');

        return response()->json([
            'success' => true,
            'data' => [
                'url' => rtrim($frontendUrl, '/') . '/master/link/' . urlencode($token),
                'expires_in' => 30,
            ],
        ]);
    }

    public function consumeLink(string $token, Request $request): RedirectResponse|JsonResponse
    {
        $linkService = app(OneTimeMasterLink::class);
        $path = $linkService->verify($token);

        if (!$path) {
            if ($request->wantsJson()) {
                return response()->json(['error' => 'Link inválido ou expirado.'], 410);
            }
            return redirect('/');
        }

        $baseUrl = config('app.url', 'http://localhost:8000');
        return redirect()->away(rtrim($baseUrl, '/') . '/' . ltrim($path, '/'));
    }
}
