<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WebhookEvent extends Model
{
    protected $fillable = [
        'company_id',
        'integration_id',
        'transaction_id',
        'event_type',
        'idempotency_key',
        'payload',
        'processed',
        'processed_at',
    ];

    protected $casts = [
        'payload' => 'array',
        'processed' => 'boolean',
        'processed_at' => 'datetime',
    ];

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function scopePending($query)
    {
        return $query->where('processed', false);
    }

    public function scopeProcessed($query)
    {
        return $query->where('processed', true);
    }
}
