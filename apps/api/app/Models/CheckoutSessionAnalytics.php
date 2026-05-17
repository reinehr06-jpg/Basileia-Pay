<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CheckoutSessionAnalytics extends Model
{
    protected $fillable = [
        'company_id',
        'checkout_session_id',
        'event_type',
        'device_type',
        'browser',
        'os',
        'ip_address',
        'country',
        'region',
        'city',
        'metadata',
        'occurred_at',
    ];

    protected $casts = [
        'metadata' => 'array',
        'occurred_at' => 'datetime',
    ];
}
