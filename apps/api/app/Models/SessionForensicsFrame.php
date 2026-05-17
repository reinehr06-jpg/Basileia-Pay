<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SessionForensicsFrame extends Model
{
    protected $fillable = [
        'session_id',
        'company_id',
        'frame_type',
        'element_id',
        'scroll_position',
        'time_in_session_ms',
        'method_context',
        'error_code',
        'occurred_at',
    ];

    protected $casts = [
        'occurred_at' => 'datetime',
    ];
}
