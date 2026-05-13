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
            // Webhook API routes
            Route::middleware('api')
                ->prefix('api')
                ->group(base_path('routes/webhook.php'));

            // Dashboard routes (auth, 2FA, admin panel)
            Route::middleware('web')
                ->group(base_path('routes/dashboard.php'));

            // Checkout routes (public checkout flows)
            Route::middleware('web')
                ->group(base_path('routes/checkout.php'));

            // Demo/debug routes (loaded only in local/staging)
            if (in_array(env('APP_ENV'), ['local', 'staging'])) {
                Route::middleware('web')
                    ->group(base_path('routes/demo.php'));
            }
        },
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->statefulApi();
        
        // Only trust all proxies in local/staging if needed, or better, specify them.
        if (env('APP_ENV') === 'production') {
            // $middleware->trustProxies(at: ['IP_DO_LOAD_BALANCER']);
        } else {
            $middleware->trustProxies(at: '*');
        }
        $middleware->alias([
            'api.auth' => \App\Http\Middleware\AuthenticateApi::class,
            '2fa' => \App\Http\Middleware\RequireTwoFactorAuth::class,
            'password.expiry' => \App\Http\Middleware\CheckPasswordExpiration::class,
            'enforce.2fa' => \App\Http\Middleware\EnforceTwoFactorAuth::class,
            'csrf' => \App\Http\Middleware\VerifyCsrfToken::class,
            'secure.token' => \App\Http\Middleware\EnforceSecureTokenization::class,
        ]);
        $middleware->web(append: [
            \App\Http\Middleware\SecurityHeaders::class,
        ]);
        $middleware->prepend(\App\Http\Middleware\HandleCors::class);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        $exceptions->report(function (\Throwable $e) {
            Log::error('Application Exception: ' . $e->getMessage(), [
                'exception' => get_class($e),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString(),
            ]);
        });
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
