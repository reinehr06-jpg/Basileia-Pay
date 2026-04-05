<?php

namespace App\Http\Middleware;

use App\Models\Integration;
use Closure;
use Illuminate\Http\Request;

use Illuminate\Support\Facades\Log;

class AuthenticateApi
{
    public function handle(Request $request, Closure $next)
    {
        Log::emergency('AuthenticateApi: handle() hit', [
            'url' => $request->fullUrl(),
            'method' => $request->method(),
            'ip' => $request->ip(),
            'ua' => $request->userAgent()
        ]);

        $apiKey = $request->bearerToken() 
            ?? $request->header('X-API-Key') 
            ?? $request->input('api_key');

        if (!$apiKey) {
            Log::debug('AuthenticateApi: No token provided', [
                'url' => $request->fullUrl(),
                'method' => $request->method(),
                'ip' => $request->ip(),
                'headers' => $request->headers->all(),
            ]);
            return response()->json(['error' => 'API key required'], 401);
        }

        $prefix = substr($apiKey, 0, 16);
        Log::debug('AuthenticateApi: Checking prefix', ['prefix' => $prefix]);

        $integration = Integration::where('api_key_prefix', $prefix)
            ->where('status', 'active')
            ->first();

        // Use SHA256 comparison to match IntegrationController@store key generation
        if (!$integration || hash('sha256', $apiKey) !== $integration->api_key_hash) {
            Log::debug('AuthenticateApi: Invalid key', [
                'integration_found' => (bool)$integration,
                'prefix' => $prefix
            ]);
            return response()->json(['error' => 'Invalid API key'], 401);
        }

        $request->attributes->add(['integration' => $integration]);
        $request->attributes->add(['company' => $integration->company]);

        $request->merge(['integration' => $integration]);
        $request->merge(['company' => $integration->company]);

        $integration->update(['last_used_at' => now()]);

        return $next($request);
    }
}
