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
        'order_id',
        'checkout_session_id',
        'gateway_account_id',
        'gateway_transaction_id',
        'method',
        'amount',
        'status',
        'gateway_response',
        'pix_qrcode',
        'pix_qrcode_url',
        'pix_expires_at',
        'boleto_url',
        'boleto_barcode',
        'boleto_expires_at',
        'card_last_digits',
        'card_brand',
        'paid_at',
    ];

    protected $casts = [
        'gateway_response' => 'array',
        'pix_expires_at' => 'datetime',
        'boleto_expires_at' => 'datetime',
        'paid_at' => 'datetime',
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
