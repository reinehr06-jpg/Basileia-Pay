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

        // 1. Validate requested company ID
        $requestedCompanyId = $request->cookie('basileia_active_company') ?? $request->header('X-Active-Company-ID') ?? $user->company_id;

        if ($requestedCompanyId) {
            $company = Company::find($requestedCompanyId);
            
            if ($company) {
                // F6: Segurança IDOR - Validar se o usuário pertence à empresa solicitada
                $userBelongs = $user->companies()->where('companies.id', $company->id)->exists();
                
                // Exceção: Se for a company_id padrão dele, ou ele for SuperAdmin
                if (!$userBelongs && $user->company_id !== $company->id && !$user->isSuperAdmin()) {
                    return response()->json(['error' => 'Unauthorized access to company context.'], 403);
                }
            }
        }

        // Fallback para a padrão se não achar
        if (!$company && $user->company_id) {
            $company = Company::find($user->company_id);
        }

        if ($company) {
            // Set TenantContext details
            TenantContext::set($company, null, null, $company->settings['environment'] ?? 'production');
            
            // Override user's company_id dynamically in memory
            $user->company_id = $company->id;
            
            // Keep resolved company in request attributes for upstream middlewares
            $request->attributes->set('company', $company);
            $request->attributes->set('company_id', $company->id);
        }

        return $next($request);
    }
}
