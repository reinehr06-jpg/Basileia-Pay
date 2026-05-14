<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CheckoutApproval extends Model
{
    protected $fillable = [
        'checkout_config_id',
        'requested_by',
        'reviewed_by',
        'status',
        'note',
        'review_note',
        'reviewed_at',
    ];

    protected $casts = [
        'reviewed_at' => 'datetime',
    ];

    public function config()
    {
        return $this->belongsTo(CheckoutConfig::class, 'checkout_config_id');
    }

    public function requestedBy()
    {
        return $this->belongsTo(User::class, 'requested_by');
    }

    public function reviewedBy()
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }
}
