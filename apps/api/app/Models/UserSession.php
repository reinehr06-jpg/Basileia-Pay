<?php

namespace App\Models;

use App\Models\Concerns\BelongsToCompany;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserSession extends Model
{
    use HasFactory, BelongsToCompany;

    protected $fillable = [
        'uuid',
        'user_id',
        'company_id',
        'session_token_hash',
        'ip_address',
        'user_agent',
        'device_fingerprint_hash',
        'started_at',
        'expires_at',
        'last_seen_at',
        'revoked_at',
        'revoked_reason',
        'created_at',
    ];

    protected $casts = [
        'started_at' => 'datetime',
        'expires_at' => 'datetime',
        'last_seen_at' => 'datetime',
        'revoked_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }
}
