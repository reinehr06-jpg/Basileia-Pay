<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response;

class RequestTracingMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        $requestId = $request->header('X-Request-ID') ?: (string) Str::uuid();
        $traceId = $request->header('X-Trace-ID') ?: (string) Str::uuid();

        // Bind to request for easy access
        $request->attributes->set('request_id', $requestId);
        $request->attributes->set('trace_id', $traceId);

        // Share with logging context if using Laravel 11+ / Monolog
        if (function_exists('app') && app()->bound('log')) {
            \Illuminate\Support\Facades\Log::shareContext([
                'request_id' => $requestId,
                'trace_id' => $traceId,
            ]);
        }

        $response = $next($request);

        // Add to response headers
        $response->headers->set('X-Request-ID', $requestId);
        $response->headers->set('X-Trace-ID', $traceId);

        return $response;
    }
}
