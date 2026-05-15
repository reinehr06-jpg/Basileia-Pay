<?php

namespace App\Services;

use App\Models\Company;
use App\Models\ConnectedSystem;
use App\Models\ApiKey;

class TenantContext
{
    protected static ?Company $company = null;
    protected static ?ConnectedSystem $connectedSystem = null;
    protected static ?ApiKey $apiKey = null;
    protected static ?string $environment = null;

    public static function set(Company $company, ?ConnectedSystem $connectedSystem = null, ?ApiKey $apiKey = null, ?string $environment = null): void
    {
        self::$company = $company;
        self::$connectedSystem = $connectedSystem;
        self::$apiKey = $apiKey;
        self::$environment = $environment;
    }

    public static function company(): ?Company
    {
        return self::$company;
    }

    public static function connectedSystem(): ?ConnectedSystem
    {
        return self::$connectedSystem;
    }

    public static function apiKey(): ?ApiKey
    {
        return self::$apiKey;
    }

    public static function environment(): string
    {
        return self::$environment ?? 'production';
    }

    public static function companyId(): ?int
    {
        return self::$company?->id;
    }

    public static function connectedSystemId(): ?int
    {
        return self::$connectedSystem?->id;
    }
}
