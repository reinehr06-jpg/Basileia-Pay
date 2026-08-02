<?php

namespace App\Http\Middleware;

use App\Models\Company;
use App\Services\TenantContext;
use Closure;
use Illuminate\Http\Request;

class SetTenantContext
{
    /**
     * Para requests autenticados via Sanctum (dashboard),
     * seta o TenantContext baseado no company_id do usuario.
     */
    public function handle(Request $request, Closure $next)
    {
        $user = $request->user();

        if (!$user) {
            return $next($request);
        }

        $company = null;

        // 1. Resolve company from basileia_active_company cookie
        $activeCompanyCookie = $request->cookie('basileia_active_company');
        if ($activeCompanyCookie) {
            $company = Company::find($activeCompanyCookie);
        }

        // 2. Resolve company from X-Active-Company-ID header
        if (!$company && $request->hasHeader('X-Active-Company-ID')) {
            $company = Company::find($request->header('X-Active-Company-ID'));
        }

        // 3. Resolve company from user's company_id
        if (!$company && $user->company_id) {
            $company = Company::find($user->company_id);
        }

        // Removed fallback for super_admin to prevent cross-tenant leak

        if ($company) {
            // Set TenantContext details
            TenantContext::set($company, null, null, $company->settings['environment'] ?? 'production');
            
            // Override user's company_id dynamically in memory
            $user->company_id = $company->id;
            
            // Keep resolved company in request attributes for upstream middlewares
            $request->attributes->set('company', $company);
        }

        return $next($request);
    }
}
