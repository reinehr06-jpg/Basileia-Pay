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

        // Dynamically load gateway configurations from database for this company
        $this->loadGatewayConfig($integration->company);

        $integration->update(['last_used_at' => now()]);

        return $next($request);
    }

    /**
     * Load the company's default gateway configuration into Laravel config.
     */
    private function loadGatewayConfig($company): void
    {
        $gateway = $company->defaultGateway();
        if (!$gateway) {
            return;
        }

        $type = strtolower($gateway->type);
        
        // Map common keys from DB to Laravel config
        $configs = $gateway->configs->pluck('value', 'key')->toArray();

        if ($type === 'asaas') {
            config([
                'services.asaas.api_key' => $configs['api_key'] ?? config('services.asaas.api_key'),
                'services.asaas.environment' => $configs['environment'] ?? config('services.asaas.environment'),
                'services.asaas.webhook_token' => $configs['webhook_token'] ?? config('services.asaas.webhook_token'),
            ]);
        } elseif ($type === 'stripe') {
            config([
                'services.stripe.key' => $configs['public_key'] ?? config('services.stripe.key'),
                'services.stripe.secret' => $configs['secret_key'] ?? config('services.stripe.secret'),
            ]);
        } elseif ($type === 'mercadopago') {
            config([
                'services.mercado_pago.access_token' => $configs['access_token'] ?? config('services.mercado_pago.access_token'),
            ]);
        }

        // Set the active gateway for this request
        config(['checkout.default_gateway' => $type]);
    }
}
