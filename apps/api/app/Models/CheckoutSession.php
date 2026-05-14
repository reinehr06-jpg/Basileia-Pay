<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CheckoutSession extends Model
{
    use HasFactory;

    protected $fillable = [
        'uuid',
        'connected_system_id',
        'checkout_experience_id',
        'external_order_id',
        'idempotency_key',
        'customer',
        'items',
        'amount',
        'currency',
        'success_url',
        'cancel_url',
        'metadata',
        'expires_at',
        'status'
    ];

    protected $casts = [
        'customer'   => 'array',
        'items'      => 'array',
        'metadata'   => 'array',
        'expires_at' => 'datetime'
    ];

    public function connectedSystem(): BelongsTo
    {
        return $this->belongsTo(ConnectedSystem::class);
    }

    public function experience(): BelongsTo
    {
        return $this->belongsTo(CheckoutExperience::class, 'checkout_experience_id');
    }
}
