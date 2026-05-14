<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class EnforceTwoFactorAuth
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = Auth::user();

        if (! $user) {
            return $next($request);
        }

        // Exclude internal routes, checkout, and 2FA setup itself
        $excludedRoutePatterns = [
            'login',
            'logout',
            'profile.2fa.*',
            'checkout.*',
            'evento.*',
            'api.*',
            'pay.*',
        ];

        if ($request->route() && \Illuminate\Support\Str::is($excludedRoutePatterns, $request->route()->getName())) {
            return $next($request);
        }

        if (! $user->two_factor_enabled) {
            return redirect()->route('profile.2fa.setup')
                ->with('warning', 'Configure a autenticação de dois fatores para acessar o sistema.');
        }

        return $next($request);
    }
}
