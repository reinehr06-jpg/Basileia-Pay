<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CheckCompanyAccess
{
    public function handle(Request $request, Closure $next)
    {
        $user = Auth::user();

        if (!$user || !$user->company_id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $companyId = $request->route('company')
            ?? $request->input('company_id')
            ?? $request->header('X-Company-Id');

        if ($companyId && (int) $companyId !== (int) $user->company_id) {
            return response()->json(['error' => 'Forbidden: company access denied'], 403);
        }

        $request->merge(['company_id' => $user->company_id]);

        return $next($request);
    }
}
