<?php

namespace App\Models\Scopes;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Scope;
use App\Services\TenantContext;

class TenantScope implements Scope
{
    /**
     * Apply the scope to a given Eloquent query builder.
     */
    public function apply(Builder $builder, Model $model)
    {
        $companyId = TenantContext::id();

        // Só aplica se houver um tenant setado na request/cli.
        // Se quisermos forçar que toda query tenha um company_id, faríamos uma Exception aqui
        // mas vamos apenas filtrar se houver o ID, para não quebrar jobs legados antes do refactor F6/F5.
        
        if ($companyId) {
            $builder->where($model->getTable() . '.company_id', $companyId);
        }
    }
}
