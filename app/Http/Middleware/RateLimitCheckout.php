<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\RateLimiter;
use Symfony\Component\HttpFoundation\Response;

class RateLimitCheckout
{
    protected int $maxAttempts = 10;
    protected int $decayMinutes = 1;
    protected int $maxPaymentAttempts = 5;
    protected int $paymentDecayMinutes = 10;

    public function handle(Request $request, Closure $next): Response
    {
        $ip = $request->ip();
        
        if ($this->isPaymentEndpoint($request)) {
            $key = 'checkout:payment:' . $ip;
            $maxAttempts = $this->maxPaymentAttempts;
            $decaySeconds = $this->paymentDecayMinutes * 60;

            if (RateLimiter::tooManyAttempts($key, $maxAttempts)) {
                $seconds = RateLimiter::availableIn($key);
                Log::warning('Payment rate limit exceeded', [
                    'ip' => $ip,
                    'seconds_until_unlock' => $seconds,
                ]);
                return $this->rateLimitResponse($request, $seconds, 'Muitas tentativas de pagamento. Tente novamente em alguns minutos.');
            }

            RateLimiter::hit($key, $decaySeconds);
        } else {
            $key = 'checkout:view:' . $ip;
            
            if (RateLimiter::tooManyAttempts($key, $this->maxAttempts)) {
                $seconds = RateLimiter::availableIn($key);
                return $this->rateLimitResponse($request, $seconds, 'Muitas requisições. Tente novamente em alguns segundos.');
            }

            RateLimiter::hit($key, $this->decayMinutes * 60);
        }

        $response = $next($request);

        if ($this->isPaymentEndpoint($request)) {
            $key = 'checkout:payment:' . $ip;
            $response->headers->add([
                'X-RateLimit-Limit' => $this->maxPaymentAttempts,
                'X-RateLimit-Remaining' => RateLimiter::remaining($key, $this->maxPaymentAttempts),
            ]);
        }

        return $response;
    }

    private function isPaymentEndpoint(Request $request): bool
    {
        return $request->is('pay/*/process') || 
               $request->is('api/v1/payments/process') ||
               $request->routeIs('checkout.process');
    }

    private function rateLimitResponse(Request $request, int $seconds, string $message): Response
    {
        if ($request->expectsJson() || $request->is('api/*')) {
            return response()->json([
                'error' => $message,
                'retry_after' => $seconds,
            ], 429);
        }

        return response()->view('checkout.error', [
            'message' => $message,
        ], 429);
    }
}
