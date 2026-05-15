<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WebhookEndpoint extends Model
{
    use HasFactory;

    protected $fillable = [
        'uuid',
        'company_id',
        'system_id',
        'url',
        'secret_hash',
        'events',
        'status',
        'failure_count',
        'last_delivery_at',
        'last_delivery_status',
    ];

    protected $casts = [
        'events'           => 'array',
        'last_delivery_at' => 'datetime',
    ];

    public function system(): BelongsTo
    {
        return $this->belongsTo(ConnectedSystem::class, 'system_id');
    }
}
