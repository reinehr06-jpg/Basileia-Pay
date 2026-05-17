<?php

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        // web.php mantido apenas para redirect + /health
        web: __DIR__.'/../routes/web.php',
        // api.php com todos os endpoints v1 e v2
        api: __DIR__.'/../routes/api.php',
        // webhooks continua igual
        then: function () {
            \Illuminate\Support\Facades\Route::middleware('web')
                ->group(base_path('routes/webhook.php'));
        },
    )
    ->withMiddleware(function (Middleware $middleware) {
        // Global tracing for all requests
        $middleware->prepend(\App\Http\Middleware\RequestTracingMiddleware::class);

        // Sanctum stateful requests
        $middleware->api(prepend: [
            \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,
        ]);

        // Security headers for all responses
        $middleware->append(\App\Http\Middleware\SecurityHeaders::class);

        // Route middleware aliases
        $middleware->alias([
            'reauth' => \App\Http\Middleware\RequireReauth::class,
            'resolve.api.key' => \App\Http\Middleware\ResolveApiKey::class,
            'validate.session' => \App\Http\Middleware\ValidateSessionContext::class,
            '2fa' => \App\Http\Middleware\EnsureTwoFactorVerified::class,
            'rate.company' => \App\Http\Middleware\RateLimitByCompany::class,
            'rate.checkout' => \App\Http\Middleware\RateLimitCheckout::class,
        ]);

    })
    ->withExceptions(function (Exceptions $exceptions) {
        // Todas as exceções retornam JSON (não mais páginas Blade de erro)
        $exceptions->shouldRenderJsonWhen(fn($request) => true);
    })->create();
