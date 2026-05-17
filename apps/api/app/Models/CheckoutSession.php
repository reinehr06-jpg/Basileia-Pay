<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Models\Concerns\BelongsToCompany;
use App\Models\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Relations\HasOne;

class CheckoutSession extends Model
{
    use HasFactory, BelongsToCompany, HasUuid;

    protected $fillable = [
        'uuid',
        'company_id',
        'connected_system_id',
        'checkout_experience_id',
        'gateway_account_id',
        'session_token',
        'amount',
        'currency',
        'status',
        'customer',
        'items',
        'resolved_config_json',
        'expires_at',
    ];

    protected $casts = [
        'customer'             => 'array',
        'items'                => 'array',
        'resolved_config_json' => 'array',
        'expires_at'           => 'datetime'
    ];

    public function connectedSystem(): BelongsTo
    {
        return $this->belongsTo(ConnectedSystem::class);
    }

    public function order(): HasOne
    {
        return $this->hasOne(Order::class);
    }

    public function experience(): BelongsTo
    {
        return $this->belongsTo(CheckoutExperience::class, 'checkout_experience_id');
    }

    public function gatewayAccount(): BelongsTo
    {
        return $this->belongsTo(GatewayAccount::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }
}
