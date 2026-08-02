<?php

namespace App\Http\Middleware;

use App\Services\Auth\SessionBinder;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\Response;

class ZeroTrustMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        if (!$user) {
            return $next($request);
        }

        $token = $user->currentAccessToken();
        if (!$token) {
            return $next($request);
        }

        // 1. Token expired check
        if ($token->expires_at && now()->greaterThan($token->expires_at)) {
            $token->delete();
            return response()->json([
                'success' => false,
                'error' => ['code' => 'token_expired', 'message' => 'Token expirado. Faça login novamente.'],
            ], 401);
        }

        // 2. Session binding (IP + UA fingerprint)
        $session = $request->attributes->get('zero_trust_session');

        if (!$session) {
            $session = DB::table('user_sessions')
                ->where('user_id', $user->id)
                ->where('token_id', $token->id)
                ->first();
                
            if ($session) {
                $request->attributes->set('zero_trust_session', $session);
            }
        }

        if (!$session) {
            DB::table('user_sessions')->insert([
                'user_id' => $user->id,
                'token_id' => $token->id,
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'device_fingerprint' => $this->fingerprint($request),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
            return $next($request);
        }

        if ($session->ip_address !== $request->ip() || $session->user_agent !== $request->userAgent()) {
            $token->delete();
            DB::table('user_sessions')->where('id', $session->id)->delete();
            logger()->warning('ZeroTrust: session context changed', [
                'user_id' => $user->id,
                'old_ip' => $session->ip_address,
                'new_ip' => $request->ip(),
            ]);
            return response()->json([
                'success' => false,
                'error' => ['code' => 'session_context_changed', 'message' => 'Sessão encerrada: IP ou device alterado.'],
            ], 401);
        }

        // 3. User status checks
        if ($user->status !== 'active') {
            $token->delete();
            return response()->json([
                'success' => false,
                'error' => ['code' => 'account_inactive', 'message' => 'Conta inativa.'],
            ], 403);
        }

        if ($user->isLocked()) {
            $token->delete();
            return response()->json([
                'success' => false,
                'error' => ['code' => 'account_locked', 'message' => 'Conta bloqueada.'],
            ], 423);
        }

        // 4. Password expiry
        if ($user->isPasswordExpired()) {
            return response()->json([
                'success' => false,
                'error' => ['code' => 'password_expired', 'message' => 'Senha expirada. Redefina para continuar.'],
            ], 403);
        }

        // Update activity
        DB::table('user_sessions')
            ->where('id', $session->id)
            ->update(['last_active_at' => now(), 'updated_at' => now()]);

        $request->attributes->set('zero_trust_verified', true);
        $request->attributes->set('zero_trust_session', $session);

        return $next($request);
    }

    private function fingerprint(Request $request): string
    {
        return hash('sha256', $request->ip() . '|' . $request->userAgent());
    }
}
