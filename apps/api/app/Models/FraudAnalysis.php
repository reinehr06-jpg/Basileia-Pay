<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FraudAnalysis extends Model
{
    protected $fillable = [
        'transaction_id',
        'reviewed_by',
        'score',
        'status',
        'flags',
        'recommendation',
        'analyzed_at',
        'reviewed_at',
    ];

    protected $casts = [
        'score' => 'integer',
        'flags' => 'array',
        'analyzed_at' => 'datetime',
        'reviewed_at' => 'datetime',
    ];

    public function transaction(): BelongsTo
    {
        return $this->belongsTo(Transaction::class);
    }

    public function reviewedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    public function isHighRisk(): bool
    {
        return $this->score >= 70;
    }

    public function isLowRisk(): bool
    {
        return $this->score < 30;
    }

    public function approve(): void
    {
        $this->update([
            'status' => 'approved',
            'reviewed_at' => now(),
        ]);
    }

    public function reject(): void
    {
        $this->update([
            'status' => 'rejected',
            'reviewed_at' => now(),
        ]);
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeHighRisk($query)
    {
        return $query->where('score', '>=', 70);
    }
}
