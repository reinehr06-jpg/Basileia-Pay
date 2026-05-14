<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CheckoutVersion extends Model
{
    protected $fillable = [
        'checkout_config_id',
        'label',
        'snapshot',
        'created_by',
    ];

    protected $casts = [
        'snapshot' => 'array',
    ];

    public function config()
    {
        return $this->belongsTo(CheckoutConfig::class, 'checkout_config_id');
    }
}
