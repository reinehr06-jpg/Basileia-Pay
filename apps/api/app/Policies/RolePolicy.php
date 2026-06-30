<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Role;
use App\Services\TenantContext;

class RolePolicy
{
    public function viewAny(User $user): bool
    {
        return $this->hasPermission($user, 'roles.view');
    }

    public function view(User $user, Role $role): bool
    {
        return $this->hasPermission($user, 'roles.view') && 
            ($role->company_id === null || $role->company_id === TenantContext::companyId());
    }

    public function create(User $user): bool
    {
        return $this->hasPermission($user, 'roles.create');
    }

    public function update(User $user, Role $role): bool
    {
        return $this->hasPermission($user, 'roles.update') && $role->company_id === TenantContext::companyId();
    }

    public function delete(User $user, Role $role): bool
    {
        return $this->hasPermission($user, 'roles.delete') && $role->company_id === TenantContext::companyId();
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
