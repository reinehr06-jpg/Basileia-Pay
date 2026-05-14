<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class IdempotencyKey extends Model
{
    use HasFactory;

    protected $fillable = [
        'connected_system_id',
        'idempotency_key',
        'request_hash',
        'response_json',
        'resource_type',
        'resource_id',
        'expires_at',
    ];

    protected $casts = [
        'response_json' => 'array',
        'expires_at'    => 'datetime',
    ];

    public function connectedSystem(): BelongsTo
    {
        return $this->belongsTo(ConnectedSystem::class);
    }
}
