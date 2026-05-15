<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PixCharge extends Model
{
    use HasFactory;

    protected $fillable = [
        'uuid',
        'payment_attempt_id',
        'gateway_pix_id',
        'qr_code_base64',
        'copy_paste_code',
        'expires_at',
        'status',
        'poll_count',
        'last_polled_at',
        'paid_at',
    ];

    protected $casts = [
        'expires_at' => 'datetime',
        'last_polled_at' => 'datetime',
        'paid_at' => 'datetime',
    ];

    public function paymentAttempt(): BelongsTo
    {
        return $this->belongsTo(PaymentAttempt::class);
    }
}
