<?php

namespace App\Models;

use App\Models\Traits\HasUuid;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Subscription extends Model
{
    use HasUuid;

    protected $fillable = [
        'uuid',
        'company_id',
        'customer_id',
        'gateway_id',
        'plan_name',
        'amount',
        'currency',
        'billing_cycle',
        'interval',
        'status',
        'current_period_start',
        'current_period_end',
        'next_billing_date',
        'gateway_subscription_id',
        'metadata',
        'cancelled_at',
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

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function gateway(): BelongsTo
    {
        return $this->belongsTo(Gateway::class);
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeCancelled($query)
    {
        return $query->where('status', 'cancelled');
    }

    public function scopePastDue($query)
    {
        return $query->where('status', 'past_due');
    }

    public function isActive(): bool
    {
        return $this->status === 'active';
    }

    public function isCancelled(): bool
    {
        return $this->status === 'cancelled';
    }

    public function cancel(): void
    {
        $this->update([
            'status' => 'cancelled',
            'cancelled_at' => now(),
        ]);
    }

    public function renew(): void
    {
        $this->update([
            'current_period_start' => $this->current_period_end,
            'current_period_end' => $this->current_period_end->addMonths($this->interval),
            'next_billing_date' => $this->current_period_end->addMonths($this->interval),
            'status' => 'active',
        ]);
    }
}
