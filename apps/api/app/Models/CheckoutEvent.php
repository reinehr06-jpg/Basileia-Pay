<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CheckoutEvent extends Model
{
    use HasFactory;

    public $timestamps = false; // We use occurred_at

    protected $fillable = [
        'checkout_session_id',
        'company_id',
        'event_type',
        'ip_hash',
        'device_type',
        'metadata',
        'occurred_at',
    ];

    protected $casts = [
        'metadata'    => 'array',
        'occurred_at' => 'datetime',
    ];
}
