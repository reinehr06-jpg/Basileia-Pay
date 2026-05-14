<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use App\Models\Integration;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

/**
 * [BUG-03] Gateway config em request->attributes — nunca em config() global
 *          config() global causa race condition em PHP-FPM multi-process
 * [QA-02]  Log::emergency para "API key errada" → Log::warning (nível correto)
 */
class AuthenticateApi
{
    public function handle(Request $request, Closure $next): mixed
    {
        $apiKey = $request->bearerToken()
            ?? $request->header('X-API-Key')
            ?? $request->input('api_key');

        if (!$apiKey) {
            // [QA-02] Era Log::emergency — corrigido para Log::warning
            Log::warning('AuthenticateApi: requisição sem API key', [
                'url' => $request->fullUrl(),
                'ip' => $request->ip(),
            ]);
            return response()->json(['error' => 'API key obrigatória'], 401);
        }

        $prefix = substr($apiKey, 0, 16);
        $integration = Integration::where('api_key_prefix', $prefix)
            ->where('status', 'active')
            ->first();

        // Timing-safe comparison
        if (!$integration || !hash_equals(hash('sha256', $apiKey), $integration->api_key_hash)) {
            // [QA-02] Era Log::emergency — corrigido para Log::warning
            Log::warning('AuthenticateApi: API key inválida', [
                'prefix' => $prefix,
                'ip' => $request->ip(),
            ]);
            return response()->json(['error' => 'API key inválida'], 401);
        }

        // [BUG-03] Salva config do gateway em request->attributes (isolado por request)
        // NUNCA em config() global — causaria race condition entre requests concorrentes
        $this->loadGatewayConfig($request, $integration->company);

        $integration->update(['last_used_at' => now()]);

        $request->attributes->set('integration', $integration);
        $request->attributes->set('company', $integration->company);

        return $next($request);
    }

    private function loadGatewayConfig(Request $request, $company): void
    {
        $gateway = $company?->defaultGateway();
        if (!$gateway)
            return;

        $type = strtolower($gateway->type);
        $configs = $gateway->configs->pluck('value', 'key')->toArray();

        $gatewayConfig = match ($type) {
            'asaas' => [
                'driver' => 'asaas',
                'api_key' => $configs['api_key'] ?? '',
                'environment' => $configs['environment'] ?? 'production',
                'webhook_token' => $configs['webhook_token'] ?? '',
            ],
            default => [],
        };

        // [BUG-03] request->attributes é isolado por request — sem race condition
        $request->attributes->set('gateway_config', $gatewayConfig);
        $request->attributes->set('gateway_type', $type);
    }
}
