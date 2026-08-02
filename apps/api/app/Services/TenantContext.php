<?php

namespace App\Services;

use App\Models\Company;
use App\Models\ConnectedSystem;
use App\Models\ApiKey;

class TenantContext
{
    public static function set(Company $company, ?ConnectedSystem $system = null, ?ApiKey $key = null, ?string $env = null): void
    {
        app()->instance('tenant.company', $company);
        app()->instance('tenant.system', $system);
        app()->instance('tenant.apikey', $key);
        app()->instance('tenant.environment', $env ?? 'production');
    }

    public static function company(): ?Company
    {
        return app()->bound('tenant.company') ? app('tenant.company') : null;
    }

    public static function connectedSystem(): ?ConnectedSystem
    {
        return app()->bound('tenant.system') ? app('tenant.system') : null;
    }

    public static function apiKey(): ?ApiKey
    {
        return app()->bound('tenant.apikey') ? app('tenant.apikey') : null;
    }

    public static function environment(): string
    {
        return app()->bound('tenant.environment') ? app('tenant.environment') : 'production';
    }

    public static function companyId(): ?int
    {
        return static::company()?->id;
    }

    public static function connectedSystemId(): ?int
    {
        return static::connectedSystem()?->id;
    }
}
