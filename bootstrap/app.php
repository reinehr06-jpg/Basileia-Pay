<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Route;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        then: function () {
            Route::middleware('api')
                ->prefix('api')
                ->group(base_path('routes/webhook.php'));
        },
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->append(\App\Http\Middleware\EnforceSecureTokenization::class);
        $middleware->statefulApi();
        $middleware->trustProxies(at: '*');
        $middleware->alias([
            'api.auth' => \App\Http\Middleware\AuthenticateApi::class,
            '2fa' => \App\Http\Middleware\RequireTwoFactorAuth::class,
            'password.expiry' => \App\Http\Middleware\CheckPasswordExpiration::class,
            'enforce.2fa' => \App\Http\Middleware\EnforceTwoFactorAuth::class,
        ]);
        $middleware->preventEmptyRequests();
    })
    ->withExceptions(function (Exceptions $exceptions) {
        $exceptions->render(function (\Illuminate\Auth\AuthenticationException $e, Request $request) {
            if ($request->expectsJson()) {
                Log::warning('AuthenticationException thrown for API request', [
                    'url' => $request->fullUrl(),
                    'method' => $request->method(),
                    'ip' => $request->ip(),
                    'headers' => $request->headers->all(),
                    'trace' => $e->getTraceAsString(),
                ]);
                return response()->json([
                    'message' => 'Unauthenticated.',
                ], Response::HTTP_UNAUTHORIZED);
            }
        });
    })->create();
