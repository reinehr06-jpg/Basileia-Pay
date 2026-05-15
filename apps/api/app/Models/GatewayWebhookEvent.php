<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GatewayWebhookEvent extends Model
{
    use HasFactory;

    protected $fillable = [
        'uuid',
        'company_id',
        'gateway',
        'gateway_event_id',
        'event_type',
        'payload_masked',
        'processed_at',
        'status',
    ];

    protected $casts = [
        'payload_masked' => 'array',
        'processed_at' => 'datetime',
    ];
}
