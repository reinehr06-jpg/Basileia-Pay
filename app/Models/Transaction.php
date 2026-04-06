<?php

namespace App\Models;

use App\Models\Traits\HasUuid;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Transaction extends Model
{
    use HasUuid;

    protected $fillable = [
        'uuid',
        'company_id',
        'integration_id',
        'gateway_id',
        'customer_id',
        'external_id',
        'reference',
        'description',
        'amount',
        'net_amount',
        'currency',
        'payment_method',
        'installments',
        'status',
        'gateway_transaction_id',
        'gateway_response',
        'metadata',
        'ip_address',
        'user_agent',
        'paid_at',
        'cancelled_at',
        'refunded_at',
        'customer_name',
        'customer_email',
        'customer_document',
        'customer_phone',
        'customer_address',
        'fraud_score',
        'fraud_risk_level',
        'fraud_flags',
        'fraud_recommendation',
        'refunded_amount',
        'status_changed_at',
        'asaas_payment_id',
        'source',
        'callback_url',
        'asaas_customer_id',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'net_amount' => 'decimal:2',
        'installments' => 'integer',
        'gateway_response' => 'array',
        'metadata' => 'array',
        'paid_at' => 'datetime',
        'expires_at' => 'datetime',
    ];

    protected $appends = ['payment_url'];

    public function getPaymentUrlAttribute(): string
    {
        return config('app.url') . '/' . $this->uuid;
    }

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function integration(): BelongsTo
    {
        return $this->belongsTo(Integration::class);
    }

    public function gateway(): BelongsTo
    {
        return $this->belongsTo(Gateway::class);
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(TransactionItem::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    public function fraudAnalysis(): HasOne
    {
        return $this->hasOne(FraudAnalysis::class);
    }

    public function scopeByStatus($query, string $status)
    {
        return $query->where('status', $status);
    }

    public function scopeByCompany($query, int $companyId)
    {
        return $query->where('company_id', $companyId);
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

    public function isRefused(): bool
    {
        return $this->status === 'refused';
    }

    public function isRefunded(): bool
    {
        return $this->status === 'refunded';
    }

    public function isCancelled(): bool
    {
        return $this->status === 'cancelled';
    }

    public function canBeCancelled(): bool
    {
        return in_array($this->status, ['pending', 'processing']);
    }

    public function canBeRefunded(): bool
    {
        return $this->status === 'approved';
    }
}
