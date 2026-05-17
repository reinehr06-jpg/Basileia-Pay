<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PaymentEvent extends Model
{
    protected $fillable = [
        'company_id',
        'payment_id',
        'payment_attempt_id',
        'order_id',
        'checkout_session_id',
        'event_type',
        'status_from',
        'status_to',
        'provider',
        'gateway_payment_id',
        'request_id',
        'trace_id',
        'metadata_masked',
    ];

    protected $casts = [
        'metadata_masked' => 'array',
    ];

    public function payment(): BelongsTo
    {
        return $this->belongsTo(Payment::class);
    }

    public function attempt(): BelongsTo
    {
        return $this->belongsTo(PaymentAttempt::class, 'payment_attempt_id');
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function checkoutSession(): BelongsTo
    {
        return $this->belongsTo(CheckoutSession::class);
    }
}
