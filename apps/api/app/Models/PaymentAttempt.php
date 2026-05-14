<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PaymentAttempt extends Model
{
    use HasFactory;

    protected $fillable = [
        'payment_id',
        'gateway_account_id',
        'method',
        'status',
        'request_payload_masked',
        'response_payload_masked',
        'gateway_reference',
        'error_code',
        'error_message',
        'started_at',
        'finished_at',
    ];

    protected $casts = [
        'request_payload_masked' => 'array',
        'response_payload_masked' => 'array',
        'started_at' => 'datetime',
        'finished_at' => 'datetime',
    ];

    public function payment(): BelongsTo
    {
        return $this->belongsTo(Payment::class);
    }

    public function gatewayAccount(): BelongsTo
    {
        return $this->belongsTo(GatewayAccount::class);
    }
}
