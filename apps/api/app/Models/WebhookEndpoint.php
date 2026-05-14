<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class WebhookEndpoint extends Model
{
    protected $fillable = [
        'integration_id',
        'url',
        'secret_hash',
        'events',
        'status',
        'retry_count',
    ];

    protected $casts = [
        'events' => 'array',
        'retry_count' => 'integer',
    ];

    public function integration(): BelongsTo
    {
        return $this->belongsTo(Integration::class);
    }

    public function deliveries(): HasMany
    {
        return $this->hasMany(WebhookDelivery::class, 'endpoint_id');
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }
}
