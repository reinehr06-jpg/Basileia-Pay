<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

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
        // Remove middlewares de sessão/CSRF que não fazem mais sentido para API
        $middleware->api(prepend: [
            \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        // Todas as exceções retornam JSON (não mais páginas Blade de erro)
        $exceptions->shouldRenderJsonWhen(fn($request) => true);
    })->create();
