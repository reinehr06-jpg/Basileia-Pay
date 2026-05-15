<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Models\Concerns\BelongsToCompany;

class Payment extends Model
{
    use HasFactory, BelongsToCompany;

    protected $fillable = [
        'uuid',
        'company_id',
        'order_id',
        'checkout_session_id',
        'gateway_account_id',
        'method',
        'status',
        'amount',
        'currency',
        'gateway_payment_id',
        'idempotency_key',
        'trace_id',
        'approved_at',
        'refunded_at',
    ];

    protected $casts = [
        'approved_at' => 'datetime',
        'refunded_at' => 'datetime',
    ];

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function gatewayAccount(): BelongsTo
    {
        return $this->belongsTo(GatewayAccount::class);
    }

    public function attempts(): HasMany
    {
        return $this->hasMany(PaymentAttempt::class);
    }

    public function checkoutSession(): BelongsTo
    {
        return $this->belongsTo(CheckoutSession::class);
    }
}
