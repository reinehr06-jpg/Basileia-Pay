<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PaymentAnalytics extends Model
{
    protected $fillable = [
        'company_id',
        'payment_id',
        'method',
        'status',
        'amount',
        'latency_ms',
        'error_code',
        'bin',
        'brand',
        'occurred_at',
    ];

    protected $casts = [
        'occurred_at' => 'datetime',
    ];
}
