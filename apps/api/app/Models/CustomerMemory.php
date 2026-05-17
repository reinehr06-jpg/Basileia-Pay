<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CustomerMemory extends Model
{
    protected $fillable = [
        'company_id',
        'email',
        'preferred_method',
        'last_card_brand',
        'metadata',
        'last_seen_at',
    ];

    protected $casts = [
        'metadata' => 'array',
        'last_seen_at' => 'datetime',
    ];
}
