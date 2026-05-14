<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GatewayAccount extends Model
{
    use HasFactory;

    protected $fillable = [
        'connected_system_id',
        'gateway_type',
        'name',
        'credentials',
        'is_active',
        'is_default'
    ];

    protected $casts = [
        'credentials' => 'array',
        'is_active'   => 'boolean',
        'is_default'  => 'boolean'
    ];

    public function connectedSystem(): BelongsTo
    {
        return $this->belongsTo(ConnectedSystem::class);
    }
}
