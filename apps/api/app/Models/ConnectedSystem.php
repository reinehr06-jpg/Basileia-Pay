<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class ConnectedSystem extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'company_id',
        'name',
        'slug',
        'api_key',
        'settings',
        'active'
    ];

    protected $casts = [
        'settings' => 'array',
        'active'   => 'boolean'
    ];

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
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
