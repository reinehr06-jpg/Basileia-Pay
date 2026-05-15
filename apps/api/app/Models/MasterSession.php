<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MasterSession extends Model
{
    use HasFactory;

    protected $fillable = [
        'uuid',
        'user_id', // nullable, master sessions may not be tied to a user
        'company_id',
        'session_token_hash',
        'ip_address',
        'device_fingerprint_hash',
        'user_agent',
        'started_at',
        'expires_at',
        'last_seen_at',
        'revoked_at',
        'revoked_reason',
    ];

    protected $casts = [
        'started_at' => 'datetime',
        'expires_at' => 'datetime',
        'last_seen_at' => 'datetime',
        'revoked_at' => 'datetime',
    ];
}
