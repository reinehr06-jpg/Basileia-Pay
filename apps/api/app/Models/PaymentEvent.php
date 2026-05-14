<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PaymentEvent extends Model
{
    protected $fillable = [
        'transaction_uuid',
        'company_id',
        'integration_id',
        'gateway_id',
        'gateway_type',
        'event_type',
        'status_normalized',
        'payment_method',
        'currency',
        'amount',
        'gateway_status',
        'gateway_code',
        'gateway_message',
        'bin',
        'brand',
        'country',
        'occurred_at',
    ];

    protected $casts = [
        'occurred_at' => 'datetime',
        'amount'      => 'decimal:2',
    ];
}
