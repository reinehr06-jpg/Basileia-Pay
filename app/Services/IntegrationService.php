<?php

namespace App\Services;

use App\Models\Company;
use App\Models\Integration;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use RuntimeException;

class IntegrationService
{
    public function register(array $data, Company $company): array
    {
        $plainApiKey = Str::random(64);
        $plainHash = Str::random(32);

        $integration = DB::transaction(function () use ($data, $company, $plainApiKey, $plainHash) {
            return Integration::create([
                'company_id' => $company->id,
                'gateway_id' => $data['gateway_id'],
                'name' => $data['name'],
                'environment' => $data['environment'] ?? 'sandbox',
                'api_key_hash' => Hash::make($plainApiKey),
                'hash' => $plainHash,
                'webhook_url' => $data['webhook_url'] ?? null,
                'webhook_secret' => !empty($data['webhook_url']) ? Str::random(32) : null,
                'is_active' => true,
                'settings' => $data['settings'] ?? null,
            ]);
        });

        return [
            'integration' => $integration,
            'api_key' => $plainApiKey,
            'hash' => $plainHash,
        ];
    }

    public function authenticate(string $apiKey): ?Integration
    {
        $integrations = Integration::where('is_active', true)->get();

        foreach ($integrations as $integration) {
            if (Hash::check($apiKey, $integration->api_key_hash)) {
                $integration->update(['last_used_at' => now()]);
                return $integration;
            }
        }

        return null;
    }

    public function list(Company $company): Collection
    {
        return Integration::where('company_id', $company->id)
            ->with('gateway')
            ->orderByDesc('created_at')
            ->get();
    }

    public function update(Integration $integration, array $data): Integration
    {
        $integration->update([
            'name' => $data['name'] ?? $integration->name,
            'webhook_url' => $data['webhook_url'] ?? $integration->webhook_url,
            'settings' => $data['settings'] ?? $integration->settings,
            'environment' => $data['environment'] ?? $integration->environment,
        ]);

        return $integration->fresh();
    }

    public function revoke(Integration $integration): void
    {
        $integration->update([
            'is_active' => false,
            'revoked_at' => now(),
        ]);
    }
}
