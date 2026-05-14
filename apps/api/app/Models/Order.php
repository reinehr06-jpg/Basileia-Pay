<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'uuid',
        'company_id',
        'system_id',
        'checkout_session_id',
        'external_order_id',
        'customer_name',
        'customer_email',
        'customer_document',
        'customer_phone',
        'amount',
        'currency',
        'status',
        'metadata',
    ];

    protected $casts = [
        'metadata' => 'array',
    ];

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function connectedSystem(): BelongsTo
    {
        return $this->belongsTo(ConnectedSystem::class);
    }

    public function session(): BelongsTo
    {
        return $this->belongsTo(CheckoutSession::class, 'checkout_session_id');
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }
}
