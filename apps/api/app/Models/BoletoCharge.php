<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BoletoCharge extends Model
{
    use HasFactory;

    protected $fillable = [
        'uuid',
        'payment_attempt_id',
        'gateway_boleto_id',
        'barcode',
        'pdf_url',
        'due_date',
        'status',
        'paid_at',
    ];

    protected $casts = [
        'due_date' => 'date',
        'paid_at' => 'datetime',
    ];

    public function paymentAttempt(): BelongsTo
    {
        return $this->belongsTo(PaymentAttempt::class);
    }
}
