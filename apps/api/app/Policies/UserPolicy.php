<?php

namespace App\Policies;

use App\Models\User;
use App\Services\TenantContext;

class UserPolicy
{
    public function viewAny(User $user): bool
    {
        return $this->hasPermission($user, 'users.view');
    }

    public function view(User $user, User $model): bool
    {
        return $this->hasPermission($user, 'users.view') && 
            $model->companies()->where('company_id', TenantContext::companyId())->exists();
    }

    public function create(User $user): bool
    {
        return $this->hasPermission($user, 'users.create');
    }

    public function update(User $user, User $model): bool
    {
        return $this->hasPermission($user, 'users.update') && 
            $model->companies()->where('company_id', TenantContext::companyId())->exists();
    }

    public function delete(User $user, User $model): bool
    {
        return $this->hasPermission($user, 'users.delete') && 
            $model->companies()->where('company_id', TenantContext::companyId())->exists();
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
