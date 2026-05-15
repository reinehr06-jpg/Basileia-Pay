<?php

namespace App\Http\Middleware;

use App\Models\Company;
use App\Models\ApiKey;
use App\Security\ApiKey\ApiKeyGenerator;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Symfony\Component\HttpFoundation\Response;

class ResolveCompany
{
    /**
     * Routes that skip company resolution (public endpoints).
     */
    private const EXCLUDED_PREFIXES = [
        'api/v1/auth/',
        'api/v2/auth/',
        'api/v1/public/',
        'api/v2/checkout/',
        'api/v2/events/',
        'api/v1/webhooks/',
        'api/vault/',
        'api/local/',
        'api/master/',
        'health',
    ];

    public function handle(Request $request, Closure $next): Response
    {
        // Skip for excluded routes (public endpoints)
        $path = $request->path();
        foreach (self::EXCLUDED_PREFIXES as $prefix) {
            if (str_starts_with($path, $prefix)) {
                return $next($request);
            }
        }

        $company = null;

        // 1. From authenticated user (Sanctum)
        if ($request->user()?->company_id) {
            $company = Company::find($request->user()->company_id);
        }
        // 2. From request attribute (set by upstream middleware)
        elseif ($request->attributes->has('company')) {
            $company = $request->attributes->get('company');
        }
        // 3. From X-API-Key header
        elseif ($request->hasHeader('X-API-Key')) {
            $company = $this->resolveFromApiKey($request);
        }

        if (!$company) {
            return response()->json([
                'error' => 'company_not_resolved',
                'message' => 'Company context not resolved.',
            ], 401);
        }

        if ($company->status !== 'active') {
            return response()->json([
                'error' => 'company_inactive',
                'message' => 'Company suspended or inactive.',
            ], 403);
        }

        App::instance('current_company', $company);
        $request->attributes->set('company', $company);

        return $next($request);
    }

    /**
     * Resolve company from X-API-Key header.
     * Uses key_prefix for lookup, then verifies full key hash.
     */
    private function resolveFromApiKey(Request $request): ?Company
    {
        $fullKey = $request->header('X-API-Key');

        // Extract prefix (e.g., bp_live_K7M2)
        $parts = explode('_', $fullKey);
        if (count($parts) < 3) {
            return null;
        }

        $keyPrefix = $parts[0] . '_' . $parts[1] . '_' . substr($parts[2], 0, 4) . '...';

        $apiKey = ApiKey::where('key_prefix', $keyPrefix)
            ->whereNull('revoked_at')
            ->where(function ($q) {
                $q->whereNull('expires_at')->orWhere('expires_at', '>', now());
            })
            ->first();

        if (!$apiKey) {
            return null;
        }

        // Verify full key against stored hash
        $generator = new ApiKeyGenerator();
        if (!$generator->verify($fullKey, $apiKey->key_hash)) {
            return null;
        }

        // Update last_used_at
        $apiKey->update(['last_used_at' => now()]);

        return Company::find($apiKey->company_id);
    }
}
