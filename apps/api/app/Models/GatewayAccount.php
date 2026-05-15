<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Models\Concerns\BelongsToCompany;

class GatewayAccount extends Model
{
    use HasFactory, BelongsToCompany;

    protected $fillable = [
        'company_id',
        'name',
        'provider',
        'credentials_encrypted',
        'environment',
        'status',
        'priority',
        'settings',
        'last_tested_at',
        'last_test_status',
        'created_by',
        'uuid',
    ];

    protected $hidden = [
        'credentials_encrypted', // NEVER expose encrypted credentials in API responses
    ];

    protected $casts = [
        'environment' => 'string',
        'status' => 'string',
        'priority' => 'integer',
        'settings' => 'array',
        'last_tested_at' => 'datetime',
        'last_test_status' => 'string',
    ];

    protected static function booted()
    {
        static::creating(function ($gatewayAccount) {
            if (empty($gatewayAccount->uuid)) {
                $gatewayAccount->uuid = (string) \Illuminate\Support\Str::uuid();
            }
        });
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Scope to only active gateways.
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    /**
     * Scope to gateways matching an environment.
     */
    public function scopeForEnvironment($query, string $environment)
    {
        return $query->where('environment', $environment);
    }
}
