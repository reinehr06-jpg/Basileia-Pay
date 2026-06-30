<?php

namespace App\Models\Concerns;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Auth;

trait BelongsToCompany
{
    /**
     * Boot the trait and apply global scope to filter by current company.
     */
    protected static function bootBelongsToCompany(): void
    {
        static::addGlobalScope('company', function (Builder $builder) {
            if ($company = \App\Services\TenantContext::company()) {
                $builder->where(
                    (new static)->getTable() . '.company_id',
                    $company->id
                );
            }
        });

        static::creating(function ($model) {
            if (empty($model->company_id) && $company = \App\Services\TenantContext::company()) {
                $model->company_id = $company->id;
            }
        });
    }

    /**
     * A model belongs to a company.
     */
    public function company(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(\App\Models\Company::class);
    }
}
