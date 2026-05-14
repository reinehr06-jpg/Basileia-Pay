<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FinancialReport extends Model
{
    protected $fillable = [
        'company_id',
        'type',
        'period_start',
        'period_end',
        'total_transactions',
        'total_amount',
        'total_net_amount',
        'total_fees',
        'total_refunded',
        'currency',
        'report_data',
        'generated_at',
    ];

    protected $casts = [
        'total_transactions' => 'integer',
        'total_amount' => 'decimal:2',
        'total_net_amount' => 'decimal:2',
        'total_fees' => 'decimal:2',
        'total_refunded' => 'decimal:2',
        'report_data' => 'array',
        'period_start' => 'datetime',
        'period_end' => 'datetime',
        'generated_at' => 'datetime',
    ];

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function scopeByType($query, string $type)
    {
        return $query->where('type', $type);
    }

    public function scopeByPeriod($query, $start, $end)
    {
        return $query->where('period_start', '>=', $start)
                     ->where('period_end', '<=', $end);
    }

    public function getGrossMarginAttribute(): float
    {
        if ($this->total_amount == 0) {
            return 0;
        }

        return round(($this->total_net_amount / $this->total_amount) * 100, 2);
    }
}
