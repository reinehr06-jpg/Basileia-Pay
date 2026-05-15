<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\Concerns\BelongsToCompany;

class CheckoutSession extends Model
{
    use HasFactory, BelongsToCompany;

    protected $fillable = [
        'uuid',
        'company_id',
        'connected_system_id',
        'checkout_experience_id',
        'session_token',
        'amount',
        'currency',
        'status',
        'environment',
        'customer_data',
        'metadata',
        'expires_at',
    ];

    protected $casts = [
        'customer_data' => 'array',
        'metadata'      => 'array',
        'expires_at'    => 'datetime'
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
