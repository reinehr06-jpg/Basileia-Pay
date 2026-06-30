<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Models\Concerns\BelongsToCompany;
use App\Models\Concerns\HasUuid;

class Order extends Model
{
    use HasFactory, BelongsToCompany, HasUuid;

    protected $fillable = [
        'uuid',
        'company_id',
        'connected_system_id',
        'checkout_session_id',
        'checkout_id',
        'checkout_publication_id',
        'external_order_id',
        'amount',
        'currency',
        'status',
        'customer_name',
        'customer_email',
        'customer_document',
        'metadata',
    ];

    protected $casts = [
        'metadata' => 'array',
    ];

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

    public function checkout(): BelongsTo
    {
        return $this->belongsTo(Checkout::class);
    }

    public function checkoutPublication(): BelongsTo
    {
        return $this->belongsTo(CheckoutPublication::class);
    }
}
