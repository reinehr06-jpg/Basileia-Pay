<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RecoveryCampaign extends Model
{
    protected $fillable = [
        'company_id',
        'system_id',
        'name',
        'channel',
        'trigger_event',
        'delay_minutes',
        'max_recovery_attempts',
        'channel_email',
        'discount_type',
        'discount_value',
        'relink_expires_hours',
        'status',
        'content',
    ];

    protected $casts = [
        'content' => 'array',
    ];
}
