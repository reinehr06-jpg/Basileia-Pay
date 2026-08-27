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

        // F15: Forçar configuração de 2FA
        // Se o usuário não tem 2FA habilitado, ele deve ser bloqueado com o código `needs_2fa_setup`,
        // a não ser que ele esteja justamente acessando a rota de setup.
        if (!$user->two_factor_enabled) {
            // A exceção de rota (ex: /2fa/setup) é idealmente gerida agrupando rotas
            // fora deste middleware, ou permitindo explicitamente aqui se for a intenção:
            if ($request->is('api/v1/auth/2fa/setup*')) {
                return $next($request);
            }
            return response()->json([
                'success' => false,
                'error' => [
                    'code' => 'needs_2fa_setup',
                    'message' => 'Você precisa configurar o 2FA para acessar esta rota.',
                ]
            ], 403);
        }

        // 100% STATELESS E INFALÍVEL: Verifica se a "ability" de 2fa:verified está no token!
        // Como o token está no banco de dados, isso funciona em Vercel, Serverless, Load Balancers, etc.
        $isVerified = false;

        $token = $user->currentAccessToken();
        if ($token && is_array($token->abilities)) {
            $isVerified = in_array('2fa:verified', $token->abilities);
        }

        if (!$isVerified) {
            $isVerified = $request->session()->get('2fa_verified_at') 
                || $request->attributes->get('2fa_verified_at');
        }

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
