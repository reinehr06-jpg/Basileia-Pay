<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SplitRule extends Model
{
    protected $fillable = [
        'company_id',
        'gateway_id',
        'name',
        'recipient',
        'percentage',
        'fixed_amount',
        'priority',
        'status',
    ];

    protected $casts = [
        'percentage' => 'decimal:2',
        'fixed_amount' => 'decimal:2',
        'priority' => 'integer',
    ];

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function gateway(): BelongsTo
    {
        return $this->belongsTo(Gateway::class);
    }

    public function calculateSplit(float $totalAmount): float
    {
        $split = 0.0;

        if ($this->percentage > 0) {
            $split = $totalAmount * ($this->percentage / 100);
        }

        if ($this->fixed_amount > 0) {
            $split += $this->fixed_amount;
        }

        return round($split, 2);
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeByPriority($query)
    {
        return $query->orderBy('priority', 'asc');
    }
}
