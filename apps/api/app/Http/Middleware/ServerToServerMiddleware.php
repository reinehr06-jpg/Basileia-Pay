<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ServerToServerMiddleware
{
    /**
     * Handle an incoming request.
     * Ensures that the request comes from an authorized internal service,
     * usually via a shared secret or a specific service token header.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $internalToken = config('security.internal_service_token');

        if (!$internalToken) {
            return response()->json(['error' => 'Serviço interno não configurado corretamente'], 500);
        }

        $headerToken = $request->header('X-Internal-Service-Token');

        if (!$headerToken || !hash_equals($internalToken, $headerToken)) {
            return response()->json(['error' => 'Acesso negado: Rota restrita a serviços internos.'], 403);
        }

        return $next($request);
    }
}
