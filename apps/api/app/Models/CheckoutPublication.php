<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CheckoutPublication extends Model
{
    protected $fillable = [
        'checkout_id',
        'checkout_version_id',
        'published_at',
        'published_by',
        'public_url',
        'status',
    ];

    protected $casts = [
        'published_at' => 'datetime',
    ];

    public function checkout()
    {
        return $this->belongsTo(Checkout::class);
    }

    public function version()
    {
        return $this->belongsTo(CheckoutVersion::class, 'checkout_version_id');
    }

    public function publisher()
    {
        return $this->belongsTo(User::class, 'published_by');
    }
}
