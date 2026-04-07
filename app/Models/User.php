<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, Notifiable;

    protected $fillable = [
        'company_id',
        'name',
        'email',
        'password',
        'role',
        'status',
        'must_change_password',
        'password_changed_at',
        'failed_login_attempts',
        'locked_until',
        'two_factor_enabled',
        'two_factor_secret',
        'two_factor_codes',
        'last_auth_at',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'two_factor_enabled' => 'boolean',
        'must_change_password' => 'boolean',
        'password_changed_at' => 'datetime',
        'last_auth_at' => 'datetime',
        'locked_until' => 'datetime',
    ];

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function auditLogs(): HasMany
    {
        return $this->hasMany(AuditLog::class);
    }

    public function reviewedFraudAnalyses(): HasMany
    {
        return $this->hasMany(FraudAnalysis::class, 'reviewed_by');
    }

    public function isSuperAdmin(): bool
    {
        return $this->role === 'super_admin';
    }

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    public function isOperator(): bool
    {
        return $this->role === 'operator';
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function needsPasswordChange(): bool
    {
        if ($this->must_change_password) {
            return true;
        }

        if (!$this->password_changed_at) {
            return true;
        }

        return $this->password_changed_at->diffInDays(now()) >= 15;
    }

    public function isPasswordExpired(): bool
    {
        if (!$this->password_changed_at) {
            return true;
        }

        return $this->password_changed_at->diffInDays(now()) >= 15;
    }
}
