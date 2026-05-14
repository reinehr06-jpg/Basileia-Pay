<?php

namespace App\Http\Middleware;

use App\Services\TwoFactorAuthService;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class RequireTwoFactorAuth
{
    public function __construct(
        private TwoFactorAuthService $twoFactorService
    ) {}

    public function handle(Request $request, Closure $next): Response
    {
        $user = Auth::user();

        if (!$user) {
            return redirect()->route('login');
        }

        if (!$user->two_factor_enabled) {
            return redirect()->route('profile.2fa.setup');
        }

        if ($this->twoFactorService->needsReauth($user)) {
            $request->session()->put('2fa_required', true);
            return redirect()->route('profile.2fa.verify');
        }

        $verified = $request->session()->get('2fa_verified', false);

        if ($request->routeIs('profile.2fa.*')) {
            return $next($request);
        }

        if (!$verified) {
            return redirect()->route('profile.2fa.verify');
        }

        return $next($request);
    }
}