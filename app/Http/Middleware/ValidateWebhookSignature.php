<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class ValidateWebhookSignature
{
    public function handle(Request $request, Closure $next)
    {
        $signature = $request->header('X-Checkout-Signature');
        $gateway = $request->route('gateway') ?? 'asaas';

        $config = config("gateways.{$gateway}.webhook_token");

        if ($config && $signature) {
            $payload = $request->getContent();
            $expected = hash_hmac('sha256', $payload, $config);

            if (!hash_equals($expected, $signature)) {
                return response()->json(['error' => 'Invalid signature'], 401);
            }
        }

        return $next($request);
    }
}
