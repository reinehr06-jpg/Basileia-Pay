<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AbandonmentEvent extends Model
{
    protected $fillable = [
        'company_id',
        'checkout_session_id',
        'last_action',
        'last_field_focused',
        'time_spent_seconds',
        'has_payment_attempt',
        'abandoned_at',
    ];

    protected $casts = [
        'abandoned_at' => 'datetime',
    ];
}
