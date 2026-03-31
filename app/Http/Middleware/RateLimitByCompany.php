<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;

class RateLimitByCompany
{
    public int $maxAttempts = 60;
    public int $decayMinutes = 1;

    public function handle(Request $request, Closure $next)
    {
        $companyId = $request->input('company_id')
            ?? $request->user()?->company_id
            ?? $request->integration?->company_id
            ?? $request->ip();

        $key = 'company:' . $companyId;

        if (RateLimiter::tooManyAttempts($key, $this->maxAttempts)) {
            $seconds = RateLimiter::availableIn($key);

            return response()->json([
                'error' => 'Rate limit exceeded. Try again in ' . $seconds . ' seconds.',
            ], 429);
        }

        RateLimiter::hit($key, $this->decayMinutes * 60);

        $response = $next($request);

        $response->headers->add('X-RateLimit-Limit', $this->maxAttempts);
        $response->headers->add('X-RateLimit-Remaining', RateLimiter::remaining($key, $this->maxAttempts));

        return $response;
    }
}
