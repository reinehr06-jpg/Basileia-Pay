<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PaymentToken extends Model
{
    protected $fillable = [
        'company_id',
        'customer_id',
        'gateway',
        'token',
        'brand',
        'last4',
        'expiry_month',
        'expiry_year',
        'is_default',
    ];

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }
}
