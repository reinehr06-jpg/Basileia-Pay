<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\Concerns\BelongsToCompany;

class TrustDecision extends Model
{
    use BelongsToCompany;

    protected $fillable = [
        'uuid',
        'company_id',
        'entity_type',
        'entity_id',
        'decision',
        'score',
        'reason',
        'recommended_action',
        'signals',
        'environment',
    ];

    protected $casts = [
        'signals' => 'array',
        'score'   => 'integer',
    ];

    protected static function booted()
    {
        static::creating(function ($model) {
            if (empty($model->uuid)) {
                $model->uuid = (string) \Illuminate\Support\Str::uuid();
            }
        });
    }

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }
}
