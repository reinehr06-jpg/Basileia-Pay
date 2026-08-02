<?php

namespace App\Models;

use App\Services\Gateway\CredentialManager;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Gateway extends Model
{
    protected $fillable = [
        'company_id',
        'name',
        'slug',
        'type',
        'status',
        'is_default',
        'last_tested_at',
        'last_test_status',
    ];

    protected $casts = [
        'is_default' => 'boolean',
        'last_tested_at' => 'datetime',
    ];

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function configs(): HasMany
    {
        return $this->hasMany(GatewayConfig::class);
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(Transaction::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class, 'gateway_id');
    }

    public function paymentAttempts(): HasMany
    {
        return $this->hasMany(PaymentAttempt::class, 'gateway_id');
    }

    public function subscriptions(): HasMany
    {
        return $this->hasMany(Subscription::class);
    }

    public function splitRules(): HasMany
    {
        return $this->hasMany(SplitRule::class);
    }

    public function gatewayAccounts(): HasMany
    {
        return $this->hasMany(GatewayAccount::class, 'gateway_type', 'slug');
    }

    public function checkoutSessions(): HasMany
    {
        return $this->hasMany(CheckoutSession::class, 'gateway_id');
    }

    public function pixSubscriptions(): HasMany
    {
        return $this->hasMany(PixSubscription::class, 'gateway_id');
    }

    public function gatewayHealthSnapshots(): HasMany
    {
        return $this->hasMany(GatewayHealthSnapshot::class, 'gateway_id');
    }

    public function getRouteKeyName(): string
    {
        return 'slug';
    }

    public function getConfig(string $key, mixed $default = null): mixed
    {
        if (!$this->relationLoaded('configs')) {
            $this->load('configs');
        }
        $config = $this->configs->firstWhere('key', $key);

        return $config ? $config->value : $default;
    }

    public function setConfig(string $key, mixed $value): void
    {
        $this->configs()->updateOrCreate(
            ['key' => $key],
            ['value' => $value]
        );
    }

    public function allCredentials(): array
    {
        return app(CredentialManager::class)->getCredentials($this);
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeDefault($query)
    {
        return $query->where('is_default', true);
    }
}
