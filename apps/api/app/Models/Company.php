<?php

namespace App\Models; use App\Models\Concerns\HasUuid;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Str;

class Company extends Model
{
    use HasFactory;
    
    protected $fillable = [
        'name',
        'slug',
        'domain',
        'status',
        'settings',
        'uuid',
        'display_name',
        'document',
        'document_type',
        'email',
        'phone',
        'logo_url',
        'plan',
        'country',
        'address_line1',
        'address_line2',
        'city',
        'state',
        'zip_code',
        'timezone',
    ];

    protected $hidden = [];

    protected $casts = [
        'settings' => 'array',
    ];

    protected static function booted()
    {
        static::creating(function ($company) {
            if (empty($company->slug)) {
                $company->slug = Str::slug($company->name);
            }
            if (empty($company->uuid)) {
                $company->uuid = (string) Str::uuid();
            }
        });
    }

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    public function members(): \Illuminate\Database\Eloquent\Relations\BelongsToMany
    {
        return $this->belongsToMany(User::class, 'user_companies')
                    ->withPivot('status')
                    ->withTimestamps();
    }

    public function systems(): HasMany
    {
        return $this->hasMany(ConnectedSystem::class);
    }

    public function gatewayAccounts(): HasMany
    {
        return $this->hasMany(GatewayAccount::class);
    }

    public function apiKeys(): HasMany
    {
        return $this->hasMany(ApiKey::class);
    }

    public function integrations(): HasMany
    {
        return $this->hasMany(Integration::class);
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(Transaction::class);
    }

    public function customers(): HasMany
    {
        return $this->hasMany(Customer::class);
    }

    public function gateways(): HasMany
    {
        return $this->hasMany(Gateway::class);
    }

    public function subscriptions(): HasMany
    {
        return $this->hasMany(Subscription::class);
    }

    public function splitRules(): HasMany
    {
        return $this->hasMany(SplitRule::class);
    }

    public function auditLogs(): HasMany
    {
        return $this->hasMany(AuditLog::class);
    }

    public function financialReports(): HasMany
    {
        return $this->hasMany(FinancialReport::class);
    }

    public function defaultGateway()
    {
        return $this->gateways()->where('is_default', true)->first();
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }
}
