<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\DB;

class ValidateSessionContext
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        if (!$user) return $next($request);

        // Somente para requisições autenticadas via Sanctum
        $token = $user->currentAccessToken();
        if (!$token) return $next($request);

        $session = DB::table('user_sessions')
            ->where('user_id', $user->id)
            ->where('token_id', $token->id)
            ->first();

        if (!$session) {
            // Se não existe registro da sessão, criamos um (fallback para tokens antigos)
            DB::table('user_sessions')->insert([
                'user_id' => $user->id,
                'token_id' => $token->id,
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
            return $next($request);
        }

        // Validação Forte: Mudança de IP ou User Agent
        if ($session->ip_address !== $request->ip() || $session->user_agent !== $request->userAgent()) {
            
            // Se mudou o contexto drasticamente, invalidamos a sessão
            $token->delete();
            DB::table('user_sessions')->where('id', $session->id)->delete();

            return response()->json([
                'success' => false,
                'error' => [
                    'code' => 'session_context_changed',
                    'message' => 'Sessão encerrada por segurança devido a mudança de contexto (IP/Device). Por favor, faça login novamente.',
                    'request_id' => $request->header('X-Request-Id')
                ]
            ], 401);
        }

        // Atualizar atividade
        DB::table('user_sessions')
            ->where('id', $session->id)
            ->update(['last_active_at' => now(), 'updated_at' => now()]);

        return $next($request);
    }
}
