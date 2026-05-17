<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureTwoFactorVerified
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        // Se não estiver logado, o auth:sanctum já cuidou disso, mas por segurança:
        if (!$user) {
            return $next($request);
        }

        // Se o usuário não tem 2FA habilitado, segue fluxo
        if (!$user->two_factor_enabled) {
            return $next($request);
        }

        // Se 2FA está habilitado, verifica se a sessão atual foi validada
        // Usamos uma flag na sessão do Sanctum ou no Cache vinculado ao token
        $isVerified = $request->session()->get('2fa_verified_at') 
            || $request->attributes->get('2fa_verified_at');

        if (!$isVerified) {
            return response()->json([
                'success' => false,
                'error' => [
                    'code' => 'two_factor_required',
                    'message' => 'Confirme o código de segurança (2FA) para continuar.',
                    'request_id' => $request->header('X-Request-Id')
                ]
            ], 403);
        }

        return $next($request);
    }
}
