<?php

use App\Providers\MasterRouteServiceProvider;
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
                ->group(base_path('routes/checkout.php'));

            \Illuminate\Support\Facades\Route::middleware('web')
                ->group(base_path('routes/webhook.php'));

            \Illuminate\Support\Facades\Route::middleware('api')
                ->group(base_path('routes/master.php'));
        },
    )
    ->withMiddleware(function (Middleware $middleware) {
        // Exclui rotas de pagamento e processamento de verificação CSRF
        $middleware->validateCsrfTokens(except: [
            'checkout/process/*',
            'checkout/pix/process/*',
            'checkout/boleto/process/*',
            'checkout/asaas/process/*',
            'evento/*/pay',
            'pay/*/process',
            'webhooks/*',
            'webhooks/checkout',
            'api/v2/auth/*',
            'api/v1/auth/*',
        ]);

        // Global tracing for all requests
        $middleware->prepend(\App\Http\Middleware\RequestTracingMiddleware::class);

        // Sanctum stateful requests
        $middleware->api(prepend: [
            \App\Http\Middleware\AuthenticateWithCookie::class,
            \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,
        ]);

        // Set tenant context for Sanctum-authenticated requests
        $middleware->api(append: [
            \App\Http\Middleware\SetTenantContext::class,
        ]);

        // Security headers for all responses
        $middleware->append(\App\Http\Middleware\SecurityHeaders::class);

        // Route middleware aliases
        $middleware->alias([
            'api.auth' => \App\Http\Middleware\AuthenticateApi::class,
            'reauth' => \App\Http\Middleware\RequireReauth::class,
            'resolve.api.key' => \App\Http\Middleware\ResolveApiKey::class,
            'validate.session' => \App\Http\Middleware\ValidateSessionContext::class,
            '2fa' => \App\Http\Middleware\EnsureTwoFactorVerified::class,
            'rate.company' => \App\Http\Middleware\RateLimitByCompany::class,
            'rate.checkout' => \App\Http\Middleware\RateLimitCheckout::class,
            'tracing' => \App\Http\Middleware\RequestTracingMiddleware::class,
            'master.guard' => \App\Http\Middleware\MasterAccessGuard::class,
            'master.2fa' => \App\Http\Middleware\Master2FAMiddleware::class,
            'master.ratelimit' => \App\Http\Middleware\MasterRateLimiter::class,
            'ip.allowlist' => \App\Http\Middleware\IpAllowlist::class,
            'zero.trust' => \App\Http\Middleware\ZeroTrustMiddleware::class,
            'scope.company' => \App\Http\Middleware\ResolveTenantFromSession::class,
            'anomaly.detect' => \App\Http\Middleware\AnomalyDetection::class,
            'jit' => \App\Http\Middleware\JitAccessMiddleware::class,
            'super.admin' => \App\Http\Middleware\EnsureUserIsSuperAdmin::class,
            'token.expiry' => \App\Http\Middleware\CheckTokenExpiration::class,
        ]);

        $middleware->web(append: [
            \App\Http\Middleware\SecurityHeaders::class,
        ]);

    })
    ->withSchedule(function (\Illuminate\Console\Scheduling\Schedule $schedule) {
        $schedule->command('tokens:purge')->hourly();
    })
    ->withExceptions(function (Exceptions $exceptions) {
        // Todas as exceções retornam JSON (não mais páginas Blade de erro)
        $exceptions->shouldRenderJsonWhen(fn($request) => true);

        // Impede redirect em AuthenticationException — retorna 401 JSON diretamente
        // Sem isso, o Laravel redireciona para /login (GET), transformando
        // qualquer POST em GET e causando erro "method not supported"
        $exceptions->render(function (\Illuminate\Auth\AuthenticationException $e, Request $request) {
            return response()->json([
                'success' => false,
                'error' => [
                    'code' => 'unauthenticated',
                    'message' => 'Não autenticado. Faça login novamente.',
                ],
            ], 401);
        });
    })->create();
