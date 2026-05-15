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
        'company_id',
        'endpoint_id',
        'event_type',
        'idempotency_key',
        'payload_masked',
        'status',
        'http_status',
        'response_body',
        'attempts',
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
        return $this->belongsTo(WebhookEndpoint::class, 'endpoint_id');
    }
}
