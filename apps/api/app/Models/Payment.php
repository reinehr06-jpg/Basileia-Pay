<?php

namespace App\Models;

use App\Models\Traits\HasUuid;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Payment extends Model
{
    use HasUuid;

    protected $fillable = [
        'uuid',
        'transaction_id',
        'gateway_id',
        'amount',
        'currency',
        'payment_method',
        'status',
        'gateway_response',
        'gateway_transaction_id',
        'paid_at',
        'pix_expires_at',
        'boleto_expires_at',
        'boleto_url',
        'pix_qrcode',
        'card_last_digits',
        'card_brand',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'gateway_response' => 'array',
        'paid_at' => 'datetime',
        'pix_expires_at' => 'datetime',
        'boleto_expires_at' => 'datetime',
    ];

    public function transaction(): BelongsTo
    {
        return $this->belongsTo(Transaction::class);
    }

    public function gateway(): BelongsTo
    {
        return $this->belongsTo(Gateway::class);
    }

    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function isApproved(): bool
    {
        return $this->status === 'approved';
    }

    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    public function isPixExpired(): bool
    {
        return $this->pix_expires_at && $this->pix_expires_at->isPast();
    }

    public function isBoletoExpired(): bool
    {
        return $this->boleto_expires_at && $this->boleto_expires_at->isPast();
    }
}
