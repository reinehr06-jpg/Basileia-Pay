<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CheckoutVersion extends Model
{
    protected $fillable = [
        'checkout_id',
        'version_number',
        'config',
        'trust_score',
        'created_by',
    ];

    protected $casts = [
        'config' => 'array',
        'trust_score' => 'float',
        'version_number' => 'integer',
    ];

    public function checkout()
    {
        return $this->belongsTo(Checkout::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
