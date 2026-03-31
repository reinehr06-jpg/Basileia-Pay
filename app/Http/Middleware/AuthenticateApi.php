<?php

namespace App\Http\Middleware;

use App\Models\Integration;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthenticateApi
{
    public function handle(Request $request, Closure $next)
    {
        $apiKey = $request->bearerToken();

        if (!$apiKey) {
            return response()->json(['error' => 'API key required'], 401);
        }

        $prefix = substr($apiKey, 0, 8);
        $integration = Integration::where('api_key_prefix', $prefix)
            ->where('status', 'active')
            ->first();

        if (!$integration || !Hash::check($apiKey, $integration->api_key_hash)) {
            return response()->json(['error' => 'Invalid API key'], 401);
        }

        $request->merge(['integration' => $integration]);
        $request->merge(['company' => $integration->company]);

        $integration->update(['last_used_at' => now()]);

        return $next($request);
    }
}
