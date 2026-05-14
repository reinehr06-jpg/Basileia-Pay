<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WebhookDelivery extends Model
{
    use HasFactory;

    protected $fillable = [
        'uuid',
        'connected_system_id',
        'webhook_endpoint_id',
        'event',
        'payload_masked',
        'status',
        'attempts',
        'last_response_code',
        'last_response_body_masked',
        'next_retry_at',
        'delivered_at',
    ];

    protected $casts = [
        'payload_masked' => 'array',
        'next_retry_at'  => 'datetime',
        'delivered_at'   => 'datetime',
    ];

    public function endpoint(): BelongsTo
    {
        return $this->belongsTo(WebhookEndpoint::class, 'webhook_endpoint_id');
    }

    public function connectedSystem(): BelongsTo
    {
        return $this->belongsTo(ConnectedSystem::class);
    }
}
