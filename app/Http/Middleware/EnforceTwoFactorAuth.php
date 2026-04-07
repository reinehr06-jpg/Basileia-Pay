<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class EnforceTwoFactorAuth
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = Auth::user();

        if (!$user) {
            return $next($request);
        }

        $excludedRoutes = [
            'profile.2fa.setup',
            'profile.2fa.enable',
            'profile.2fa.disable',
            'profile.2fa.verify',
            'profile.2fa.verify.post',
            'password.change',
            'logout',
        ];

        if (in_array($request->route()?->name, $excludedRoutes)) {
            return $next($request);
        }

        if (!$user->two_factor_enabled) {
            return redirect()->route('profile.2fa.setup')
                ->with('warning', 'Configure a autenticação de dois fatores para acessar o sistema.');
        }

        return $next($request);
    }
}