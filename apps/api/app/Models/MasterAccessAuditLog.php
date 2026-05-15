<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MasterAccessAuditLog extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $fillable = [
        'event',
        'user_id',
        'email',
        'ip_address',
        'device_fingerprint_hash',
        'user_agent',
        'challenge_id',
        'session_id',
        'metadata_masked',
        'created_at',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'metadata_masked' => 'array',
    ];
}
