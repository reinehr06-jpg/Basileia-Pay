<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MasterAccessChallenge extends Model
{
    use HasFactory;

    protected $fillable = [
        'uuid',
        'token_prefix',
        'token_hash',
        'ephemeral_secret_hash',
        'generated_by',
        'generated_from_ip',
        'generated_from_device_hash',
        'allowed_email',
        'status',
        'expires_at',
        'consumed_at',
        'failed_attempts',
    ];

    protected $casts = [
        'expires_at' => 'datetime',
        'consumed_at' => 'datetime',
        'failed_attempts' => 'integer',
    ];
}
