<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Dashboard\CheckoutConfigController;
use App\Http\Controllers\Dashboard\CheckoutAuditController;
use App\Http\Controllers\Dashboard\CheckoutWhiteLabelController;
use App\Http\Controllers\Dashboard\CheckoutABTestController;
use App\Http\Controllers\Dashboard\CheckoutVersionController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Basileia Pay — API Routes.
| v1: Core Foundation + Legacy
| v2: Next.js Frontend Integration
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// ═══════════════════════════════════════════════════════════════════════════════
// API v1 — Core Foundation (Parte 1)
// ═══════════════════════════════════════════════════════════════════════════════
Route::prefix('v1')->group(function () {

    // ── Auth (sem middleware de auth — é o login) ──────────────────────────
    Route::post('auth/login', [\App\Http\Controllers\Api\V1\AuthController::class, 'login'])
        ->middleware('throttle:login');
    Route::post('auth/logout', [\App\Http\Controllers\Api\V1\AuthController::class, 'logout'])
        ->middleware('auth:sanctum');
    Route::get('auth/me', [\App\Http\Controllers\Api\V1\AuthController::class, 'me'])
        ->middleware('auth:sanctum');

    // 2FA
    Route::middleware('auth:sanctum')->prefix('auth/2fa')->group(function () {
        Route::post('enable', [\App\Http\Controllers\Api\V1\AuthController::class, 'enable2fa']);
        Route::post('confirm', [\App\Http\Controllers\Api\V1\AuthController::class, 'confirm2fa']);
        Route::post('disable', [\App\Http\Controllers\Api\V1\AuthController::class, 'disable2fa']);
        Route::post('verify', [\App\Http\Controllers\Api\V1\AuthController::class, 'verify2fa']);
    });

    // Reauth
    Route::post('auth/reauth', [\App\Http\Controllers\Api\V1\AuthController::class, 'reauth'])
        ->middleware('auth:sanctum');

    // ── Checkout Sessions (Sistemas Conectados via API Key) ───────────────
    Route::post('checkout-sessions', [\App\Http\Controllers\Api\V1\CheckoutSessionController::class, 'store']);
    Route::get('checkout-sessions/{id}', [\App\Http\Controllers\Api\V1\CheckoutSessionController::class, 'show']);

    // ── Checkout Público (Next.js) ────────────────────────────────────────
    Route::get('public/checkout-sessions/{sessionToken}', [\App\Http\Controllers\Api\V1\PublicCheckoutController::class, 'show']);
    Route::post('public/checkout-sessions/{sessionToken}/pay', [\App\Http\Controllers\Api\V1\PublicCheckoutController::class, 'pay']);
    Route::get('public/checkout-sessions/{sessionToken}/status', [\App\Http\Controllers\Api\V1\PublicCheckoutController::class, 'status']);

    // ── Webhooks de Gateways ──────────────────────────────────────────────
    Route::post('webhooks/gateways/{provider}/{accountUuid?}', [\App\Http\Controllers\Api\V1\GatewayWebhookController::class, 'handle']);

    // ── Protected routes (via integration ck_live_... keys — legacy) ─────
    Route::middleware('api.auth')->group(function () {
        // Transactions
        Route::apiResource('transactions', \App\Http\Controllers\Api\TransactionController::class);
        Route::post('transactions/{id}/cancel', [\App\Http\Controllers\Api\TransactionController::class, 'cancel']);
        Route::post('transactions/{id}/refund', [\App\Http\Controllers\Api\TransactionController::class, 'refund']);

        // Payments
        Route::post('payments/process', [\App\Http\Controllers\Api\PaymentController::class, 'process']);
        Route::get('payments/{id}/status', [\App\Http\Controllers\Api\PaymentController::class, 'status']);
        Route::get('payments/{id}/pix', [\App\Http\Controllers\Api\PaymentController::class, 'pix']);
        Route::get('payments/{id}/boleto', [\App\Http\Controllers\Api\PaymentController::class, 'boleto']);

        // Customers
        Route::apiResource('customers', \App\Http\Controllers\Api\CustomerController::class);

        // Subscriptions
        Route::apiResource('subscriptions', \App\Http\Controllers\Api\SubscriptionController::class);
        Route::post('subscriptions/{id}/pause', [\App\Http\Controllers\Api\SubscriptionController::class, 'pause']);
        Route::post('subscriptions/{id}/resume', [\App\Http\Controllers\Api\SubscriptionController::class, 'resume']);

        // Reports
        Route::get('reports/summary', [\App\Http\Controllers\Api\ReportController::class, 'summary']);
        Route::get('reports/transactions', [\App\Http\Controllers\Api\ReportController::class, 'transactions']);
    });

    // ── Dashboard APIs — Sanctum auth ─────────────────────────────────────
    Route::middleware(['auth:sanctum', 'throttle:api'])->group(function () {
        // Systems
        Route::get('systems', [\App\Http\Controllers\Dashboard\SystemController::class, 'index']);
        Route::post('systems', [\App\Http\Controllers\Dashboard\SystemController::class, 'store']);
        Route::get('systems/{system}', [\App\Http\Controllers\Dashboard\SystemController::class, 'show']);
        Route::patch('systems/{system}', [\App\Http\Controllers\Dashboard\SystemController::class, 'update']);
        Route::delete('systems/{system}', [\App\Http\Controllers\Dashboard\SystemController::class, 'destroy']);

        // API Keys (nested under systems)
        Route::get('systems/{system}/api-keys', [\App\Http\Controllers\Dashboard\ApiKeyController::class, 'index']);
        Route::post('systems/{system}/api-keys', [\App\Http\Controllers\Dashboard\ApiKeyController::class, 'store'])
            ->middleware('reauth:api_key.create');
        Route::delete('systems/{system}/api-keys/{keyId}', [\App\Http\Controllers\Dashboard\ApiKeyController::class, 'destroy'])
            ->middleware('reauth:api_key.revoke');

        // Gateways
        Route::get('gateways', [\App\Http\Controllers\Dashboard\GatewayController::class, 'index']);
        Route::post('gateways', [\App\Http\Controllers\Dashboard\GatewayController::class, 'store']);
        Route::get('gateways/{gateway}', [\App\Http\Controllers\Dashboard\GatewayController::class, 'show']);
        Route::patch('gateways/{gateway}', [\App\Http\Controllers\Dashboard\GatewayController::class, 'update'])
            ->middleware('reauth:gateway.alter');
        Route::delete('gateways/{gateway}', [\App\Http\Controllers\Dashboard\GatewayController::class, 'destroy'])
            ->middleware('reauth:gateway.alter');
        Route::post('gateways/{gateway}/test', [\App\Http\Controllers\Dashboard\GatewayController::class, 'test']);
        Route::post('gateways/{gateway}/rotate-credentials', [\App\Http\Controllers\Dashboard\GatewayController::class, 'rotateCredentials'])
            ->middleware('reauth:gateway.rotate_credentials');

        // Audit Logs
        Route::get('audit-logs', [\App\Http\Controllers\Dashboard\AuditLogController::class, 'index']);

        // ── Dashboard Operacional (Parte 3) ───────────────────────────────────
        
        // Visão Geral
        Route::get('dashboard/stats', [\App\Http\Controllers\Api\V1\DashboardStatsController::class, 'index']);

        // Builder / Studio
        Route::get('checkouts', [\App\Http\Controllers\Api\V1\StudioController::class, 'index']);
        Route::post('checkouts', [\App\Http\Controllers\Api\V1\StudioController::class, 'store']);
        Route::get('checkouts/{id}', [\App\Http\Controllers\Api\V1\StudioController::class, 'show']);
        Route::patch('checkouts/{id}', [\App\Http\Controllers\Api\V1\StudioController::class, 'update']);
        Route::get('checkouts/{id}/versions', [\App\Http\Controllers\Api\V1\StudioController::class, 'versions']);
        Route::post('checkouts/{id}/publish', [\App\Http\Controllers\Api\V1\StudioController::class, 'publish']);
        Route::post('checkouts/{id}/rollback/{vid}', [\App\Http\Controllers\Api\V1\StudioController::class, 'rollback']);
        Route::post('checkouts/{id}/validate', [\App\Http\Controllers\Api\V1\StudioController::class, 'validateCheckout']);

        // Studio IA
        Route::post('studio/ai/generate', [\App\Http\Controllers\Api\V1\AiStudioController::class, 'generate']);
        Route::post('studio/ai/import-html', [\App\Http\Controllers\Api\V1\AiStudioController::class, 'importHtml']);
        Route::post('studio/ai/import-url', [\App\Http\Controllers\Api\V1\AiStudioController::class, 'importUrl']);

        // Configurações
        Route::get('settings/company', [\App\Http\Controllers\Api\V1\CompanySettingsController::class, 'show']);
        Route::patch('settings/company', [\App\Http\Controllers\Api\V1\CompanySettingsController::class, 'update']);
        Route::get('settings/users', [\App\Http\Controllers\Api\V1\UserSettingsController::class, 'index']);
        Route::post('settings/users/invite', [\App\Http\Controllers\Api\V1\UserSettingsController::class, 'invite']);
        Route::patch('settings/users/{id}/role', [\App\Http\Controllers\Api\V1\UserSettingsController::class, 'updateRole']);
        Route::delete('settings/users/{id}', [\App\Http\Controllers\Api\V1\UserSettingsController::class, 'destroy']);
        
        Route::get('settings/ai-providers', [\App\Http\Controllers\Api\V1\AiProviderSettingsController::class, 'index']);
        Route::post('settings/ai-providers', [\App\Http\Controllers\Api\V1\AiProviderSettingsController::class, 'store']);
        Route::patch('settings/ai-providers/{id}', [\App\Http\Controllers\Api\V1\AiProviderSettingsController::class, 'update']);
        Route::delete('settings/ai-providers/{id}', [\App\Http\Controllers\Api\V1\AiProviderSettingsController::class, 'destroy']);

        // Preferências de usuário
        Route::patch('me/preferences', [\App\Http\Controllers\Api\V1\MeController::class, 'updatePreferences']);
        Route::get('me/sessions', [\App\Http\Controllers\Api\V1\MeController::class, 'sessions']);
        Route::delete('me/sessions/{id}', [\App\Http\Controllers\Api\V1\MeController::class, 'revokeSession']);

        // Pix Automático (Assinaturas)
        Route::get('subscriptions', [\App\Http\Controllers\Api\V1\PixSubscriptionController::class, 'index']);
        Route::post('subscriptions', [\App\Http\Controllers\Api\V1\PixSubscriptionController::class, 'store']);
        Route::get('subscriptions/{uuid}', [\App\Http\Controllers\Api\V1\PixSubscriptionController::class, 'show']);
        Route::patch('subscriptions/{uuid}', [\App\Http\Controllers\Api\V1\PixSubscriptionController::class, 'update']);
        Route::post('subscriptions/{uuid}/pause', [\App\Http\Controllers\Api\V1\PixSubscriptionController::class, 'pause']);
        Route::post('subscriptions/{uuid}/resume', [\App\Http\Controllers\Api\V1\PixSubscriptionController::class, 'resume']);
        Route::post('subscriptions/{uuid}/cancel', [\App\Http\Controllers\Api\V1\PixSubscriptionController::class, 'cancel'])
            ->middleware('reauth:subscription.cancel');
        Route::get('subscriptions/{uuid}/cycles', [\App\Http\Controllers\Api\V1\PixSubscriptionController::class, 'cycles']);
        Route::get('subscriptions/{uuid}/events', [\App\Http\Controllers\Api\V1\PixSubscriptionController::class, 'events']);
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
// API v2 — Next.js Frontend Integration
// ═══════════════════════════════════════════════════════════════════════════════
Route::prefix('v2')->name('api.v2.')->group(function () {

    // ── Auth ───────────────────────────────────────────────────────────────
    Route::post('auth/login', [\App\Http\Controllers\Api\V2\AuthController::class, 'login']);
    Route::post('auth/logout', [\App\Http\Controllers\Api\V2\AuthController::class, 'logout'])
        ->middleware('auth:sanctum');
    Route::get('auth/me', [\App\Http\Controllers\Api\V2\AuthController::class, 'me'])
        ->middleware('auth:sanctum');

    // ── Checkout público (sem auth) ───────────────────────────────────────
    Route::prefix('checkout')->name('checkout.')->group(function () {
        Route::get('{uuid}', [\App\Http\Controllers\Api\V2\CheckoutController::class, 'show']);
        Route::post('{uuid}/process', [\App\Http\Controllers\Api\V2\CheckoutController::class, 'process']);
        Route::get('{uuid}/status', [\App\Http\Controllers\Api\V2\CheckoutController::class, 'status']);
        Route::get('{uuid}/receipt', [\App\Http\Controllers\Api\V2\CheckoutController::class, 'receipt']);
    });

    // ── Eventos público (sem auth) ────────────────────────────────────────
    Route::prefix('events')->name('events.')->group(function () {
        Route::get('{slug}', [\App\Http\Controllers\Api\V2\EventCheckoutController::class, 'show']);
        Route::post('{slug}/process', [\App\Http\Controllers\Api\V2\EventCheckoutController::class, 'process']);
        Route::get('{slug}/status', [\App\Http\Controllers\Api\V2\EventCheckoutController::class, 'status']);
    });

    // ── Dashboard (autenticado via Sanctum) ───────────────────────────────
    Route::middleware('auth:sanctum')->prefix('dashboard')->name('dashboard.')->group(function () {

        // KPIs + gráfico
        Route::get('stats', [\App\Http\Controllers\Api\V2\DashboardController::class, 'stats']);

        // Transações
        Route::get('transactions', [\App\Http\Controllers\Api\V2\TransactionController::class, 'index']);
        Route::get('transactions/export', [\App\Http\Controllers\Api\V2\TransactionController::class, 'export']);
        Route::get('transactions/{id}', [\App\Http\Controllers\Api\V2\TransactionController::class, 'show']);
        Route::post('transactions/{id}/cancel', [\App\Http\Controllers\Api\V2\TransactionController::class, 'cancel']);
        Route::post('transactions/{id}/refund', [\App\Http\Controllers\Api\V2\TransactionController::class, 'refund']);

        // Gateways
        Route::get('gateways', [\App\Http\Controllers\Api\V2\GatewayController::class, 'index']);
        Route::post('gateways', [\App\Http\Controllers\Api\V2\GatewayController::class, 'store']);
        Route::get('gateways/{id}', [\App\Http\Controllers\Api\V2\GatewayController::class, 'show']);
        Route::put('gateways/{id}', [\App\Http\Controllers\Api\V2\GatewayController::class, 'update']);
        Route::delete('gateways/{id}', [\App\Http\Controllers\Api\V2\GatewayController::class, 'destroy']);
        Route::post('gateways/{id}/toggle', [\App\Http\Controllers\Api\V2\GatewayController::class, 'toggle']);
        Route::post('gateways/{id}/test', [\App\Http\Controllers\Api\V2\GatewayController::class, 'test']);

        // Eventos (painel)
        Route::get('events', [\App\Http\Controllers\Api\V2\EventController::class, 'index']);
        Route::post('events', [\App\Http\Controllers\Api\V2\EventController::class, 'store']);
        Route::post('events/{id}/toggle', [\App\Http\Controllers\Api\V2\EventController::class, 'toggle']);
        Route::delete('events/{id}', [\App\Http\Controllers\Api\V2\EventController::class, 'destroy']);

        // Relatórios
        Route::get('reports/summary', [\App\Http\Controllers\Api\V2\ReportController::class, 'summary']);
        Route::get('reports/export', [\App\Http\Controllers\Api\V2\ReportController::class, 'export']);

        // Webhooks
        Route::get('webhooks', [\App\Http\Controllers\Api\V2\WebhookController::class, 'index']);
        Route::get('webhooks/{id}', [\App\Http\Controllers\Api\V2\WebhookController::class, 'show']);
        Route::post('webhooks/{id}/retry', [\App\Http\Controllers\Api\V2\WebhookController::class, 'retry']);

        // Integrações
        Route::get('integrations', [\App\Http\Controllers\Api\V2\IntegrationController::class, 'index']);
        Route::post('integrations', [\App\Http\Controllers\Api\V2\IntegrationController::class, 'store']);
        Route::put('integrations/{id}', [\App\Http\Controllers\Api\V2\IntegrationController::class, 'update']);
        Route::post('integrations/{id}/toggle', [\App\Http\Controllers\Api\V2\IntegrationController::class, 'toggle']);
        Route::delete('integrations/{id}', [\App\Http\Controllers\Api\V2\IntegrationController::class, 'destroy']);

        // Sources
        Route::get('sources', [\App\Http\Controllers\Api\V2\SourceController::class, 'index']);
        Route::post('sources', [\App\Http\Controllers\Api\V2\SourceController::class, 'store']);
        Route::put('sources/{id}', [\App\Http\Controllers\Api\V2\SourceController::class, 'update']);
        Route::patch('sources/{id}/toggle', [\App\Http\Controllers\Api\V2\SourceController::class, 'toggle']);
        Route::delete('sources/{id}', [\App\Http\Controllers\Api\V2\SourceController::class, 'destroy']);

        // Settings
        Route::get('settings/receipt', [\App\Http\Controllers\Api\V2\SettingsController::class, 'receipt']);
        Route::put('settings/receipt', [\App\Http\Controllers\Api\V2\SettingsController::class, 'updateReceipt']);

        // Lab / Builder
        Route::apiResource('checkout-configs', CheckoutConfigController::class);
        Route::post('checkout-configs/{id}/duplicate', [CheckoutConfigController::class, 'duplicate']);
        Route::get('checkout-configs/{id}/versions', [CheckoutVersionController::class, 'index']);
        Route::post('checkout-configs/{id}/restore/{versionId}', [CheckoutVersionController::class, 'restore']);

        // Auditoria
        Route::get('audit', [CheckoutAuditController::class, 'index']);
        Route::get('checkout-configs/{id}/audit', [CheckoutAuditController::class, 'forConfig']);

        // Analytics / Observability
        Route::get('analytics/overview', [\App\Http\Controllers\Dashboard\AnalyticsController::class, 'overview']);
        Route::get('analytics/gateways', [\App\Http\Controllers\Dashboard\AnalyticsController::class, 'byGateway']);

        // Roteamento Inteligente (Smart Routing)
        Route::apiResource('routing-rules', \App\Http\Controllers\Dashboard\RoutingRuleController::class);

        // White Label
        Route::get('white-label', [CheckoutWhiteLabelController::class, 'show']);
        Route::put('white-label', [CheckoutWhiteLabelController::class, 'update']);

        // Testes A/B
        Route::apiResource('ab-tests', CheckoutABTestController::class);
        Route::post('ab-tests/{id}/toggle', [CheckoutABTestController::class, 'toggle']);
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
// Internal Vault (Tokenização)
// ═══════════════════════════════════════════════════════════════════════════════
Route::prefix('vault')->group(function () {
    Route::post('tokenize-card', [\App\Http\Controllers\Api\VaultController::class, 'tokenize']);
    Route::post('resolve-token', [\App\Http\Controllers\Api\VaultController::class, 'resolve']);
});

// ═══════════════════════════════════════════════════════════════════════════════
// Master Access (localhost + token-based)
// ═══════════════════════════════════════════════════════════════════════════════
Route::prefix('local/master-access')->middleware('throttle:master_login')->group(function () {
    Route::post('challenges', [\App\Http\Controllers\Local\MasterAccessController::class, 'generateChallenge']);
    Route::get('{token}', [\App\Http\Controllers\Local\MasterAccessController::class, 'showChallenge']);
});

Route::prefix('master')->middleware('throttle:master_login')->group(function () {
    Route::post('login', [\App\Http\Controllers\Master\AuthController::class, 'login']);
    Route::get('session', [\App\Http\Controllers\Master\AuthController::class, 'validateSession']);
    Route::post('logout', [\App\Http\Controllers\Master\AuthController::class, 'logout']);
});
