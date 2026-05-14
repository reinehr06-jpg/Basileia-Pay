<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class CheckPasswordExpiration
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = Auth::user();

        if (!$user) {
            return $next($request);
        }

        if ($user->needsPasswordChange()) {
            if (!$request->is('password/change', 'logout', 'profile/2fa/*')) {
                return redirect()->route('password.change')
                    ->with('warning', 'Sua senha expirou. Você deve alterá-la.');
            }
        }

        return $next($request);
    }
}