<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RecoveryCampaign extends Model
{
    protected $fillable = [
        'company_id',
        'name',
        'channel',
        'delay_minutes',
        'status',
        'content',
    ];

    protected $casts = [
        'content' => 'array',
    ];
}
