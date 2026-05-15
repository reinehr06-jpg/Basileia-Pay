<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\Concerns\BelongsToCompany;

class ApiKey extends Model
{
    use HasFactory, BelongsToCompany;

    protected $table = 'system_api_keys';

    protected $fillable = [
        'connected_system_id',
        'company_id',
        'name',
        'key_prefix',
        'key_hash',
        'scopes',
        'environment',
        'last_used_at',
        'expires_at',
        'revoked_at',
        'revoked_by',
        'created_by',
        'uuid',
    ];

    protected $hidden = [
        'key_hash', // Never expose the hash in API responses
    ];

    protected $casts = [
        'scopes' => 'array',
        'last_used_at' => 'datetime',
        'expires_at' => 'datetime',
        'revoked_at' => 'datetime',
        'environment' => 'string',
    ];

    protected static function booted()
    {
        static::creating(function ($apiKey) {
            if (empty($apiKey->uuid)) {
                $apiKey->uuid = (string) \Illuminate\Support\Str::uuid();
            }
        });
    }

    public function system(): BelongsTo
    {
        return $this->belongsTo(ConnectedSystem::class, 'connected_system_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function revoker(): BelongsTo
    {
        return $this->belongsTo(User::class, 'revoked_by');
    }

    /**
     * Check if the key is currently valid (not revoked, not expired).
     */
    public function isValid(): bool
    {
        if ($this->revoked_at !== null) {
            return false;
        }

        if ($this->expires_at && $this->expires_at->isPast()) {
            return false;
        }

        return true;
    }

    /**
     * Scope to only active (non-revoked, non-expired) keys.
     */
    public function scopeActive($query)
    {
        return $query->whereNull('revoked_at')
            ->where(function ($q) {
                $q->whereNull('expires_at')->orWhere('expires_at', '>', now());
            });
    }
}
