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
        'session_token',
        'company_id',
        'connected_system_id',
        'order_id',
        'checkout_experience_id',
        'checkout_experience_version_id',
        'gateway_account_id',
        'status',
        'amount',
        'currency',
        'success_url',
        'cancel_url',
        'expires_at',
        'resolved_config_json',
        'metadata',
        'external_order_id',
        'idempotency_key',
        'customer',
        'items',
    ];

    protected $casts = [
        'customer'             => 'array',
        'items'                => 'array',
        'metadata'             => 'array',
        'resolved_config_json' => 'array',
        'expires_at'           => 'datetime'
    ];

    public function connectedSystem(): BelongsTo
    {
        return $this->belongsTo(ConnectedSystem::class);
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function experience(): BelongsTo
    {
        return $this->belongsTo(CheckoutExperience::class, 'checkout_experience_id');
    }

    public function experienceVersion(): BelongsTo
    {
        return $this->belongsTo(CheckoutExperienceVersion::class, 'checkout_experience_version_id');
    }

    public function gatewayAccount(): BelongsTo
    {
        return $this->belongsTo(GatewayAccount::class);
    }
}
