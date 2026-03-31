<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Gateway extends Model
{
    protected $fillable = [
        'company_id',
        'name',
        'type',
        'status',
        'is_default',
    ];

    protected $casts = [
        'is_default' => 'boolean',
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
        return $this->hasMany(Payment::class);
    }

    public function subscriptions(): HasMany
    {
        return $this->hasMany(Subscription::class);
    }

    public function splitRules(): HasMany
    {
        return $this->hasMany(SplitRule::class);
    }

    public function getConfig(string $key, mixed $default = null): mixed
    {
        $config = $this->configs()->where('key', $key)->first();

        return $config ? $config->decrypted_value : $default;
    }

    public function setConfig(string $key, mixed $value): void
    {
        $this->configs()->updateOrCreate(
            ['key' => $key],
            ['value' => $value]
        );
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
