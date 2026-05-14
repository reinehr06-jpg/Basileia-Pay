<?php

namespace App\Policies;

use App\Models\CheckoutConfig;
use App\Models\User;

class CheckoutConfigPolicy
{
    private function role(User $user): string
    {
        if ($user->isSuperAdmin()) return 'owner';
        if ($user->isAdmin()) return 'admin';
        if ($user->isOperator()) return 'editor';
        return 'viewer';
    }

    public function viewAny(User $user): bool { return true; }
    
    public function view(User $user, CheckoutConfig $c): bool { 
        return $user->company_id === $c->company_id; 
    }
    
    public function create(User $user): bool { 
        return in_array($this->role($user), ['owner','admin','editor']); 
    }
    
    public function update(User $user, CheckoutConfig $c): bool { 
        return $this->view($user,$c) && in_array($this->role($user), ['owner','admin','editor']); 
    }
    
    public function publish(User $user, CheckoutConfig $c): bool { 
        return $this->view($user,$c) && in_array($this->role($user), ['owner','admin']); 
    }
    
    public function delete(User $user, CheckoutConfig $c): bool { 
        return $this->view($user,$c) && in_array($this->role($user), ['owner','admin']); 
    }
    
    public function manageWhiteLabel(User $user): bool { 
        return $this->role($user) === 'owner'; 
    }
    
    public function viewAudit(User $user): bool { 
        return in_array($this->role($user), ['owner','admin']); 
    }
}
