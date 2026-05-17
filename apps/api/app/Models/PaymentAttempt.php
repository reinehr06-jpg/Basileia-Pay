<?php

namespace App\Models;

use App\Models\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PaymentAttempt extends Model
{
    use HasFactory, HasUuid;

    protected $fillable = [
        'payment_id',
        'company_id',
        'gateway_account_id',
        'method',
        'status',
        'gateway_payment_id',
        'request_payload_masked',
        'response_payload_masked',
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
}
