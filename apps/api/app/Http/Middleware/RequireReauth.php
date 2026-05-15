<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Session;

class RequireReauth
{
    public const REAUTH_ACTIONS = [
        'api_key.create',
        'api_key.revoke',
        'gateway.alter',
        'gateway.rotate_credentials',
        'payment.refund',
        'webhook.alter',
        'permission.change',
        'checkout.publish_production',
        'environment.change',
    ];

    public function handle(Request $request, Closure $next, string $action): mixed
    {
        $reauthAt = Session::get('reauth_confirmed_at');

        $windowMinutes = config('security.reauth_window_minutes', 10);

        if (!$reauthAt || now()->diffInMinutes($reauthAt) > $windowMinutes) {
            return response()->json([
                'error'   => 'reauth_required',
                'message' => 'Esta ação requer confirmação de identidade.',
                'action'  => $action,
            ], 403);
        }

        return $next($request);
    }
}
