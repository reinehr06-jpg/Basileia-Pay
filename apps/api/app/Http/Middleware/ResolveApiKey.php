<?php

namespace App\Http\Middleware;

use App\Models\ApiKey;
use App\Services\TenantContext;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ResolveApiKey
{
    public function handle(Request $request, Closure $next): Response
    {
        $keyString = $request->header('X-API-Key');

        if (!$keyString) {
            return response()->json([
                'success' => false,
                'error' => [
                    'code' => 'missing_api_key',
                    'message' => 'Header X-API-Key é obrigatório.',
                    'request_id' => $request->attributes->get('request_id'),
                ]
            ], 401);
        }

        // Resolve using hash for security
        $keyHash = hash('sha256', $keyString);
        $apiKey = ApiKey::where('key_hash', $keyHash)->with(['company', 'connectedSystem'])->first();

        if (!$apiKey || $apiKey->revoked_at) {
            return response()->json([
                'success' => false,
                'error' => [
                    'code' => 'invalid_api_key',
                    'message' => 'Chave de API inválida ou revogada.',
                    'request_id' => $request->attributes->get('request_id'),
                ]
            ], 401);
        }

        // Set Context
        TenantContext::set(
            $apiKey->company,
            $apiKey->connectedSystem,
            $apiKey,
            $apiKey->environment
        );

        return $next($request);
    }
}
