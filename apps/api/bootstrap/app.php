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
        // Confiar no proxy do Easypanel (Traefik) para evitar loop de redirecionamento (HTTPS/HTTP)
        $middleware->trustProxies(at: '*');

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
            'secure.token' => \App\Http\Middleware\EnforceSecureTokenization::class,
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
            'server.only' => \App\Http\Middleware\ServerToServerMiddleware::class,
        ]);

        $middleware->web(append: [
            \App\Http\Middleware\SecurityHeaders::class,
        ]);

    })
    ->withSchedule(function (\Illuminate\Console\Scheduling\Schedule $schedule) {
        $schedule->command('tokens:purge')->hourly();
        $schedule->command('webhooks:retry-failed')->everyFiveMinutes();
        $schedule->command('payments:sync-pending')->everyTenMinutes();
        $schedule->command('reports:generate-daily')->dailyAt('02:00');
        $schedule->command('logs:cleanup')->weekly();
        $schedule->command('payments:check-health')->everyFiveMinutes();
        $schedule->command('gateway:check-health')->everyFifteenMinutes();
        $schedule->command('billing:charge')->dailyAt('06:00');
        $schedule->command('security:deadman-switch')->hourly();
        $schedule->command('checkout:calculate-scores')->everyFifteenMinutes();
    })
    ->withExceptions(function (Exceptions $exceptions) {
        // Todas as exceções retornam JSON (não mais páginas Blade de erro)
        $exceptions->shouldRenderJsonWhen(fn($request) => true);

        // Impede redirect em AuthenticationException — retorna 401 JSON diretamente
        $exceptions->render(function (\Illuminate\Auth\AuthenticationException $e, Request $request) {
            return response()->json([
                'success' => false,
                'error' => [
                    'code' => 'unauthenticated',
                    'message' => 'Não autenticado. Faça login novamente.',
                ],
            ], 401);
        });

        $exceptions->render(function (\Illuminate\Auth\Access\AuthorizationException $e, Request $request) {
            return response()->json([
                'success' => false,
                'error' => ['code' => 'forbidden', 'message' => 'Acesso negado.'],
            ], 403);
        });

        $exceptions->render(function (\Illuminate\Validation\ValidationException $e, Request $request) {
            return response()->json([
                'success' => false,
                'error' => ['code' => 'validation_error', 'message' => 'Dados inválidos.', 'fields' => $e->errors()],
            ], 422);
        });

        $exceptions->render(function (\Illuminate\Database\Eloquent\ModelNotFoundException $e, Request $request) {
            return response()->json([
                'success' => false,
                'error' => ['code' => 'not_found', 'message' => 'Recurso não encontrado.'],
            ], 404);
        });

        // NÃO vazar stack traces em produção
        $exceptions->render(function (\Throwable $e, Request $request) {
            if (app()->environment('production')) {
                \Illuminate\Support\Facades\Log::error('Unhandled exception', ['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
                return response()->json([
                    'success' => false,
                    'error' => ['code' => 'server_error', 'message' => 'Erro interno.'],
                ], 500);
            }
        });

        // Integrar com Sentry
        $exceptions->reportable(function (\Throwable $e) {
            if (app()->bound('sentry') && app()->environment('production')) {
                app('sentry')->captureException($e);
            }
        });
    })->create();
