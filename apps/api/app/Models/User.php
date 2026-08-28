<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use App\Models\Concerns\BelongsToCompany;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Str;

class User extends Authenticatable
{
    use HasApiTokens, Notifiable, BelongsToCompany, HasFactory;

    protected $fillable = [
        'company_id',
        'name',
        'email',
        'password',
        'status',
        'must_change_password',
        'password_changed_at',
        'two_factor_enabled',
        'two_factor_confirmed_at',
        'last_auth_at',
        'last_login_at',
        'failed_attempts',
        'locked_at',
        'uuid',
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
        'last_login_at' => 'datetime',
        'locked_at' => 'datetime',
        'two_factor_confirmed_at' => 'datetime',
        'failed_attempts' => 'integer',
    ];

    protected static function booted()
    {
        static::creating(function ($user) {
            if (empty($user->uuid)) {
                $user->uuid = (string) Str::uuid();
            }
        });
    }

    public function auditLogs(): HasMany
    {
        return $this->hasMany(AuditLog::class);
    }

    public function sessions(): HasMany
    {
        return $this->hasMany(AuthSession::class);
    }

    public function companies(): \Illuminate\Database\Eloquent\Relations\BelongsToMany
    {
        return $this->belongsToMany(Company::class, 'user_companies')
                    ->withPivot('status')
                    ->withTimestamps();
    }

    public function roles(): \Illuminate\Database\Eloquent\Relations\BelongsToMany
    {
        return $this->belongsToMany(Role::class, 'user_role_assignments')
                    ->withPivot('company_id')
                    ->withTimestamps();
    }

    public function twoFactorSecretRel() // Can't be named twoFactorSecret due to existing property usage potential
    {
        return $this->hasOne(TwoFactorSecret::class);
    }

    public function reviewedFraudAnalyses(): HasMany
    {
        return $this->hasMany(FraudAnalysis::class, 'reviewed_by');
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function isSuperAdmin(): bool
    {
        return $this->roles()->where('slug', 'super-admin')->exists();
    }

    public function canImpersonate(): bool
    {
        return $this->isSuperAdmin();
    }

    public function impersonations(): HasMany
    {
        return $this->hasMany(ImpersonationSession::class, 'super_admin_id');
    }

    public function getEffectiveCompanyId(): ?int
    {
        if (app()->bound('impersonation_company_id')) {
            return app('impersonation_company_id');
        }
        return $this->company_id;
    }

    public function isLocked(): bool
    {
        return $this->status === 'locked' || $this->locked_at !== null;
    }

    public function needsPasswordChange(): bool
    {
        if ($this->must_change_password) {
            return true;
        }

        if (!$this->isSuperAdmin()) {
            return false;
        }

        $baseDate = $this->password_changed_at ?? $this->created_at;
        return $baseDate && $baseDate->diffInDays(now()) >= 5;
    }

    public function isPasswordExpired(): bool
    {
        if (!$this->isSuperAdmin()) {
            return false;
        }

        $baseDate = $this->password_changed_at ?? $this->created_at;
        return $baseDate && $baseDate->diffInDays(now()) >= 5;
    }

    public function incrementFailedAttempts(): void
    {
        $this->increment('failed_attempts');

        if ($this->failed_attempts >= 5) {
            $this->update([
                'status' => 'locked',
                'locked_at' => now(),
            ]);
        }
    }

    public function resetFailedAttempts(): void
    {
        $this->update([
            'failed_attempts' => 0,
            'locked_at' => null,
            'last_login_at' => now(),
        ]);
    }
}
