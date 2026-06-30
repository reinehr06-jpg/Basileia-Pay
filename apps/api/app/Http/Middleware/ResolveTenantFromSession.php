<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Models\AuthSession;
use App\Models\Company;
use App\Services\TenantContext;

class ResolveTenantFromSession
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        if (!$user) {
            return $next($request);
        }

        $token = $user->currentAccessToken();
        
        $session = null;
        if ($token) {
            $session = AuthSession::where('token_id', $token->id)->first();
        }

        $companyId = $session?->company_id ?? $user->company_id;
        
        if (!$companyId) {
            return response()->json([
                'success' => false,
                'error' => ['code' => 'no_company', 'message' => 'Usuário sem empresa vinculada.'],
            ], 403);
        }

        if (!$user->isSuperAdmin() && $companyId !== $user->company_id) {
            // Verify access through pivot
            $hasAccess = $user->companies()->where('company_id', $companyId)->exists();
            if (!$hasAccess) {
                return response()->json([
                    'success' => false,
                    'error' => ['code' => 'cross_company_denied', 'message' => 'Acesso negado a esta empresa.'],
                ], 403);
            }
        }

        $company = Company::find($companyId);
        
        if (!$company || $company->status !== 'active') {
            return response()->json([
                'success' => false,
                'error' => ['code' => 'company_inactive', 'message' => 'Empresa inativa ou não encontrada.'],
            ], 403);
        }

        // Store user company in context
        TenantContext::set($company);
        $request->attributes->set('user_company_id', $companyId);

        // If request targets a specific company via header/query, optionally verify match or switch implicitly
        // For strictness, if header X-Company-Id is provided and differs, deny it or switch it dynamically
        $targetCompanyId = $request->header('X-Company-Id');
        if ($targetCompanyId && (int) $targetCompanyId !== $companyId) {
            if (!$user->isSuperAdmin() && !$user->companies()->where('company_id', $targetCompanyId)->exists()) {
                return response()->json([
                    'success' => false,
                    'error' => ['code' => 'cross_company_denied', 'message' => 'Acesso negado a empresa especificada no cabeçalho.'],
                ], 403);
            }
            
            // Allow dynamic switch for API calls with X-Company-Id
            $dynamicCompany = Company::find($targetCompanyId);
            if ($dynamicCompany && $dynamicCompany->status === 'active') {
                TenantContext::set($dynamicCompany);
                $request->attributes->set('user_company_id', $targetCompanyId);
            }
        }

        return $next($request);
    }
}
