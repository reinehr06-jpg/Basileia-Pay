<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use App\Models\Concerns\BelongsToCompany;

class CheckoutExperience extends Model
{
    use HasFactory, BelongsToCompany;

    protected $fillable = [
        'uuid',
        'company_id',
        'system_id',
        'name',
        'description',
        'status',
        'current_version_id',
        'published_version_id',
        'settings',
        'config',
        'created_by',
    ];

    protected $casts = [
        'settings' => 'array',
        'config'   => 'array',
    ];

    protected static function booted()
    {
        static::creating(function ($model) {
            if (empty($model->uuid)) {
                $model->uuid = (string) \Illuminate\Support\Str::uuid();
            }
        });
    }

    public function system(): BelongsTo
    {
        return $this->belongsTo(ConnectedSystem::class, 'system_id');
    }

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function versions(): HasMany
    {
        return $this->hasMany(CheckoutExperienceVersion::class);
    }

    public function publishedVersion(): HasOne
    {
        return $this->hasOne(CheckoutExperienceVersion::class)->where('status', 'published');
    }

    public function latestDraft(): HasOne
    {
        return $this->hasOne(CheckoutExperienceVersion::class)->where('status', 'draft')->orderBy('version_number', 'desc');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function sessions(): HasMany
    {
        return $this->hasMany(CheckoutSession::class, 'checkout_experience_id');
    }
}
