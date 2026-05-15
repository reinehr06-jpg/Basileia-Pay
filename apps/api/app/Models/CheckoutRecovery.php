<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CheckoutRecovery extends Model
{
    use HasFactory;

    protected $table = 'checkout_recovery';

    protected $fillable = [
        'uuid',
        'checkout_session_id',
        'company_id',
        'recovery_token',
        'abandoned_at',
        'email_sent_at',
        'opened_at',
        'converted_at',
        'converted_payment_id',
        'expires_at',
    ];

    protected $casts = [
        'abandoned_at'   => 'datetime',
        'email_sent_at'  => 'datetime',
        'opened_at'      => 'datetime',
        'converted_at'   => 'datetime',
        'expires_at'     => 'datetime',
    ];
}
