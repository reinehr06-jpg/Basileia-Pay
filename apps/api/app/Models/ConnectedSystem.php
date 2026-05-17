<?php

namespace App\Models; use App\Models\Concerns\HasUuid;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use App\Models\Concerns\BelongsToCompany;

class ConnectedSystem extends Model
{
    use HasFactory, SoftDeletes, BelongsToCompany;

    protected $fillable = [
        'company_id',
        'name',
        'slug',
        'description',
        'logo_url',
        'settings',
        'active',
        'webhook_url',
        'webhook_secret_hash',
        'environment',
        'status',
        'uuid',
    ];

    protected $casts = [
        'settings' => 'array',
        'active'   => 'boolean',
        'environment' => 'string',
        'status' => 'string',
    ];

    protected static function booted()
    {
        static::creating(function ($system) {
            if (empty($system->uuid)) {
                $system->uuid = (string) \Illuminate\Support\Str::uuid();
            }
        });
    }

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function apiKeys(): HasMany
    {
        return $this->hasMany(ApiKey::class);
    }

    public function gatewayAccounts(): HasMany
    {
        return $this->hasMany(GatewayAccount::class);
    }

    public function defaultGateway(): HasOne
    {
        return $this->hasOne(GatewayAccount::class)->where('is_default', true);
    }

    public function experiences(): HasMany
    {
        return $this->hasMany(CheckoutExperience::class);
    }

    public function sessions(): HasMany
    {
        return $this->hasMany(CheckoutSession::class);
    }

    public function webhooks(): HasMany
    {
        return $this->hasMany(WebhookEndpoint::class);
    }
}
