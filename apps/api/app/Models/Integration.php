<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Integration extends Model
{
    protected $fillable = [
        'company_id',
        'gateway_id',
        'name',
        'slug',
        'base_url',
        'api_key_hash',
        'api_key_prefix',
        'permissions',
        'status',
        'webhook_url',
        'webhook_secret',
    ];

    protected $casts = [
        'permissions' => 'array',
    ];

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function gateway(): BelongsTo
    {
        return $this->belongsTo(Gateway::class);
    }

    /**
     * Retorna o gateway efetivo desta integração.
     * Prioridade: gateway próprio da integração → gateway padrão da empresa.
     *
     * Company::defaultGateway() é método (não HasOne), então chamamos com ().
     */
    public function effectiveGateway(): ?Gateway
    {
        if ($this->gateway) {
            return $this->gateway;
        }

        if ($this->company) {
            $default = $this->company->defaultGateway();
            if ($default) {
                return $default;
            }
        }

        return null;
    }

    public function webhookEndpoints(): HasMany
    {
        return $this->hasMany(WebhookEndpoint::class);
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(Transaction::class);
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }
}
