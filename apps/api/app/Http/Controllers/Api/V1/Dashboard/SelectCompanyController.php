<?php

namespace App\Http\Controllers\Api\V1\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\AuthSession;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SelectCompanyController extends Controller
{
    /**
     * Switch the active company for the current session.
     */
    public function switch(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'company_id' => 'required|integer',
        ]);

        $user = $request->user();
        $targetCompanyId = $validated['company_id'];

        // Check if user has access to this company
        if (!$user->isSuperAdmin() && $user->company_id !== $targetCompanyId) {
            $hasAccess = $user->companies()->where('company_id', $targetCompanyId)->exists();
            if (!$hasAccess) {
                return response()->json([
                    'success' => false,
                    'error' => ['code' => 'access_denied', 'message' => 'Você não tem acesso a esta empresa.'],
                ], 403);
            }
        }

        $token = $user->currentAccessToken();
        
        if ($token) {
            $session = AuthSession::where('token_id', $token->id)->first();
            if ($session) {
                $session->update(['company_id' => $targetCompanyId]);
            } else {
                AuthSession::create([
                    'user_id' => $user->id,
                    'company_id' => $targetCompanyId,
                    'token_id' => $token->id,
                    'ip_address' => $request->ip(),
                    'user_agent' => $request->userAgent(),
                    'last_activity' => now(),
                    'expires_at' => $token->expires_at,
                    'status' => 'active',
                ]);
            }
        }

        app(\App\Services\Audit\AuditService::class)->log('auth.tenant.switch', $user, [
            'target_company_id' => $targetCompanyId,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Contexto alterado com sucesso.',
        ]);
    }

    /**
     * List all companies the user has access to.
     */
    public function list(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user->isSuperAdmin()) {
            $companies = \App\Models\Company::all(['id', 'uuid', 'name', 'slug', 'logo_url']);
        } else {
            $companies = $user->companies()->select(['companies.id', 'companies.uuid', 'companies.name', 'companies.slug', 'companies.logo_url'])->get();
            
            // Include default company if not in pivot
            if ($user->company_id && !$companies->contains('id', $user->company_id)) {
                $defaultCompany = \App\Models\Company::where('id', $user->company_id)->select(['id', 'uuid', 'name', 'slug', 'logo_url'])->first();
                if ($defaultCompany) {
                    $companies->push($defaultCompany);
                }
            }
        }

        return response()->json([
            'success' => true,
            'data' => $companies,
        ]);
    }
}
