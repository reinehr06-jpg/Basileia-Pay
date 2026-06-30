<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Company;
use App\Services\TenantContext;

class CompanyPolicy
{
    public function view(User $user, Company $company): bool
    {
        return $this->hasPermission($user, 'company.view') && 
            $user->companies()->where('company_id', $company->id)->exists();
    }

    public function update(User $user, Company $company): bool
    {
        return $this->hasPermission($user, 'company.update') && 
            $user->companies()->where('company_id', $company->id)->exists();
    }

    private function hasPermission(User $user, string $permission): bool
    {
        if ($user->isSuperAdmin()) {
            return true;
        }

        $companyId = TenantContext::companyId();
        if (!$companyId) {
            return false;
        }

        return $user->roles()
            ->wherePivot('company_id', $companyId)
            ->whereHas('permissions', function($q) use ($permission) {
                $q->where('slug', $permission);
            })
            ->exists();
    }
}
