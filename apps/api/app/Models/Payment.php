<?php

namespace App\Models;

use App\Models\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Models\Concerns\BelongsToCompany;

class Payment extends Model
{
    use HasFactory, BelongsToCompany, HasUuid;

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
        'pix_qrcode',
        'pix_qrcode_url',
        'pix_expires_at',
        'boleto_url',
        'boleto_barcode',
        'gateway_response',
        'paid_at',
    ];

    protected $casts = [
        'pix_expires_at' => 'datetime',
        'paid_at' => 'datetime',
        'gateway_response' => 'array',
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
