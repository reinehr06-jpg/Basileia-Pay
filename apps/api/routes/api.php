<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// ═══════════════════════════════════════════════════════════════════════════════
// API Healthcheck
// ═══════════════════════════════════════════════════════════════════════════════
Route::get('/health', [\App\Http\Controllers\HealthController::class, 'check']);

// ═══════════════════════════════════════════════════════════════════════════════
// API v1 — Core Foundation (Fase 1-5)
// ═══════════════════════════════════════════════════════════════════════════════
Route::prefix('v1')->group(function () {

    // ── Auth (Público) ─────────────────────────────────────────────────────
    Route::post('auth/login', [\App\Http\Controllers\Api\V1\AuthController::class, 'login'])->middleware('throttle:auth_login');
    Route::post('auth/register', [\App\Http\Controllers\Api\V1\AuthController::class, 'register'])->middleware('throttle:auth_register');
    Route::post('auth/password/forgot', [\App\Http\Controllers\Api\V1\AuthController::class, 'forgotPassword'])->middleware('throttle:auth_password');
    Route::post('auth/password/reset', [\App\Http\Controllers\Api\V1\AuthController::class, 'resetPassword'])->middleware('throttle:auth_password');
    Route::post('auth/refresh', [\App\Http\Controllers\Api\V1\AuthController::class, 'refresh'])->middleware('throttle:auth_login');
    Route::post('auth/2fa/verify', [\App\Http\Controllers\Api\V1\TwoFactorController::class, 'verify']);

    // ── JIT Access (Just-In-Time Privilege Elevation) ─────────────────────
    Route::prefix('jit')->middleware(['auth:sanctum', 'zero.trust', 'scope.company', 'anomaly.detect'])->group(function () {
        Route::post('request', [\App\Http\Controllers\Api\V1\JitAccessController::class, 'request']);
        Route::get('my-active', [\App\Http\Controllers\Api\V1\JitAccessController::class, 'myActive']);
        Route::get('list', [\App\Http\Controllers\Api\V1\JitAccessController::class, 'list']);
        Route::post('{uuid}/approve', [\App\Http\Controllers\Api\V1\JitAccessController::class, 'approve']);
        Route::post('{uuid}/deny', [\App\Http\Controllers\Api\V1\JitAccessController::class, 'deny']);
    });

    // ── Checkout Sessions (Sistemas Conectados via API Key) ───────────────
    Route::middleware(['resolve.api.key', 'throttle:api_external', 'rate.company'])->group(function () {
        Route::post('checkout-sessions', [\App\Http\Controllers\Api\V1\CheckoutSessionController::class, 'store']);
        Route::get('checkout-sessions/{id}', [\App\Http\Controllers\Api\V1\CheckoutSessionController::class, 'show']);
    });

    // ── Checkout Público (Next.js) ────────────────────────────────────────
    Route::middleware(['rate.checkout'])->group(function () {
        Route::get('public/checkouts/{system_id}', [\App\Http\Controllers\Api\V1\PublicCheckoutController::class, 'show']);
        Route::post('public/checkouts/{system_id}/orders', [\App\Http\Controllers\Api\V1\PublicOrderController::class, 'storeOrder']);
        Route::post('public/orders/{order_id}/payments', [\App\Http\Controllers\Api\V1\PublicOrderController::class, 'storePayment']);
        
        Route::get('public/checkout-sessions/{sessionToken}', [\App\Http\Controllers\Api\V1\PublicCheckoutController::class, 'show'])->middleware('throttle:checkout_status');
        Route::post('public/checkout-sessions/{sessionToken}/pay', [\App\Http\Controllers\Api\V1\PublicCheckoutController::class, 'pay'])->middleware('throttle:checkout_pay');
        Route::get('public/checkout-sessions/{sessionToken}/status', [\App\Http\Controllers\Api\V1\PublicCheckoutController::class, 'status'])->middleware('throttle:checkout_status');
        Route::get('public/checkout-sessions/{sessionToken}/receipt', [\App\Http\Controllers\Api\V1\PublicCheckoutController::class, 'receipt'])->middleware('throttle:checkout_status');
        Route::get('public/checkout-sessions/{sessionToken}/failure', [\App\Http\Controllers\Api\V1\PublicCheckoutController::class, 'failure'])->middleware('throttle:checkout_status');
        Route::get('public/checkout-sessions/{sessionToken}/social-proof', [\App\Http\Controllers\Api\V1\PublicCheckoutController::class, 'socialProof'])->middleware('throttle:checkout_status');
        Route::post('public/checkout-sessions/{sessionToken}/resolve-memory', [\App\Http\Controllers\Api\V1\PublicCheckoutController::class, 'resolveMemory']);
        Route::post('public/checkout-sessions/{sessionToken}/frames', [\App\Http\Controllers\Public\SessionFramesController::class, 'store']);
        Route::post('public/checkout-sessions/{sessionToken}/abandon', [\App\Http\Controllers\Public\SessionFramesController::class, 'abandon']);
    });

    // ── Webhooks de Gateways ──────────────────────────────────────────────
    Route::post('webhooks/gateways/{provider}/{accountUuid?}', [\App\Http\Controllers\Api\V1\GatewayWebhookController::class, 'handle'])->middleware('throttle:webhooks');

    // ── Rotas Protegidas (Dashboard & Integrações) ────────────────────────
    Route::middleware(['auth:sanctum', 'zero.trust', 'scope.company', 'anomaly.detect', 'tracing', 'throttle:dashboard'])->group(function () {
        
        // Auth Me
        Route::get('auth/me', [\App\Http\Controllers\Api\V1\AuthController::class, 'me']);

        // Dashboard Stats & Lists
        Route::get('dashboard/stats', [\App\Http\Controllers\Api\V1\Dashboard\StatsController::class, 'index']);
        
        // Orders & Financials (Bloco 4)
        Route::get('dashboard/orders', [\App\Http\Controllers\Api\V1\Dashboard\FinancialController::class, 'indexOrders']);
        Route::get('dashboard/orders/{id}', [\App\Http\Controllers\Api\V1\Dashboard\FinancialController::class, 'showOrder']);
        Route::get('dashboard/orders/{id}/payments', [\App\Http\Controllers\Api\V1\Dashboard\FinancialController::class, 'orderPayments']);
        Route::post('dashboard/orders/{id}/refunds', [\App\Http\Controllers\Api\V1\Dashboard\FinancialController::class, 'storeRefund']);
        
        Route::get('dashboard/reconciliation/discrepancies', [\App\Http\Controllers\Api\V1\Dashboard\FinancialController::class, 'getDiscrepancies']);
        Route::post('dashboard/reconciliation/{order_id}/resync', [\App\Http\Controllers\Api\V1\Dashboard\FinancialController::class, 'resyncOrder']);
        
        Route::get('dashboard/financial-audit-logs', [\App\Http\Controllers\Api\V1\Dashboard\FinancialController::class, 'getAuditLogs']);

        Route::get('dashboard/payments', [\App\Http\Controllers\Api\V1\PaymentController::class, 'index']);
        Route::get('dashboard/systems', [\App\Http\Controllers\Api\V1\Dashboard\SystemController::class, 'index']);
        Route::post('dashboard/systems', [\App\Http\Controllers\Api\V1\Dashboard\SystemController::class, 'store']);
        Route::get('dashboard/systems/{uuid}', [\App\Http\Controllers\Api\V1\Dashboard\SystemController::class, 'show']);
        
        // Webhook Operational
        Route::get('dashboard/webhooks/deliveries', [\App\Http\Controllers\Api\V1\Dashboard\WebhookDeliveryController::class, 'index']);
        Route::get('dashboard/webhooks/deliveries/{uuid}', [\App\Http\Controllers\Api\V1\Dashboard\WebhookDeliveryController::class, 'show']);
        Route::post('dashboard/webhooks/deliveries/{uuid}/retry', [\App\Http\Controllers\Api\V1\Dashboard\WebhookDeliveryController::class, 'retry']);

        // Onboarding
        Route::get('dashboard/onboarding/status', [\App\Http\Controllers\Api\V1\Dashboard\OnboardingController::class, 'status']);
        Route::post('dashboard/onboarding/publish-checkout', [\App\Http\Controllers\Api\V1\Dashboard\OnboardingController::class, 'publishCheckout']);

        // ═══════════════════════════════════════════════════════════════════
        // Fase 5 — Alertas
        // ═══════════════════════════════════════════════════════════════════
        Route::get('dashboard/alerts', [\App\Http\Controllers\Api\V1\Dashboard\AlertController::class, 'index']);
        Route::get('dashboard/alerts/{id}', [\App\Http\Controllers\Api\V1\Dashboard\AlertController::class, 'show']);
        Route::post('dashboard/alerts/{id}/acknowledge', [\App\Http\Controllers\Api\V1\Dashboard\AlertController::class, 'acknowledge']);
        Route::post('dashboard/alerts/{id}/resolve', [\App\Http\Controllers\Api\V1\Dashboard\AlertController::class, 'resolve']);
        Route::post('dashboard/alerts/{id}/mute', [\App\Http\Controllers\Api\V1\Dashboard\AlertController::class, 'mute']);

        // ═══════════════════════════════════════════════════════════════════
        // Fase 5 — Monitoramento
        // ═══════════════════════════════════════════════════════════════════
        Route::get('dashboard/monitoring', [\App\Http\Controllers\Api\V1\Dashboard\MonitoringController::class, 'index']);
        Route::get('dashboard/monitoring/webhooks', [\App\Http\Controllers\Api\V1\Dashboard\MonitoringController::class, 'webhooks']);
        Route::get('dashboard/monitoring/gateways', [\App\Http\Controllers\Api\V1\Dashboard\MonitoringController::class, 'gateways']);
        Route::get('dashboard/monitoring/checkouts', [\App\Http\Controllers\Api\V1\Dashboard\MonitoringController::class, 'checkouts']);
        Route::post('dashboard/monitoring/evaluate', [\App\Http\Controllers\Api\V1\Dashboard\MonitoringController::class, 'evaluate']);

        // Sensitive actions (Require 2FA)
        Route::middleware('2fa')->group(function () {
            Route::get('dashboard/gateways', [\App\Http\Controllers\Api\V1\Dashboard\GatewayController::class, 'index']);
            Route::get('dashboard/gateways/capabilities', [\App\Http\Controllers\Api\V1\Dashboard\GatewayController::class, 'capabilities']);
            Route::get('dashboard/gateways/{uuid}', [\App\Http\Controllers\Api\V1\Dashboard\GatewayController::class, 'show']);
            Route::put('dashboard/gateways/{uuid}', [\App\Http\Controllers\Api\V1\Dashboard\GatewayController::class, 'update']);
            Route::delete('dashboard/gateways/{uuid}', [\App\Http\Controllers\Api\V1\Dashboard\GatewayController::class, 'destroy']);
            Route::get('dashboard/gateways/{uuid}/health', [\App\Http\Controllers\Api\V1\Dashboard\GatewayController::class, 'health']);
            
            // Webhook CRUD
            Route::get('dashboard/webhooks/endpoints', [\App\Http\Controllers\Api\V1\Dashboard\WebhookEndpointController::class, 'index']);
            Route::post('dashboard/webhooks/endpoints', [\App\Http\Controllers\Api\V1\Dashboard\WebhookEndpointController::class, 'store']);
            Route::get('dashboard/webhooks/endpoints/{uuid}', [\App\Http\Controllers\Api\V1\Dashboard\WebhookEndpointController::class, 'show']);
            Route::patch('dashboard/webhooks/endpoints/{uuid}', [\App\Http\Controllers\Api\V1\Dashboard\WebhookEndpointController::class, 'update']);
            Route::delete('dashboard/webhooks/endpoints/{uuid}', [\App\Http\Controllers\Api\V1\Dashboard\WebhookEndpointController::class, 'destroy']);
            Route::post('dashboard/webhooks/endpoints/{uuid}/rotate-secret', [\App\Http\Controllers\Api\V1\Dashboard\WebhookEndpointController::class, 'rotateSecret']);

            Route::get('dashboard/company', [\App\Http\Controllers\Api\V1\Dashboard\CompanySettingsController::class, 'show']);
            Route::patch('dashboard/company', [\App\Http\Controllers\Api\V1\Dashboard\CompanySettingsController::class, 'update']);
            
            // Company Switching
            Route::get('dashboard/companies', [\App\Http\Controllers\Api\V1\Dashboard\SelectCompanyController::class, 'list']);
            Route::post('dashboard/companies/select', [\App\Http\Controllers\Api\V1\Dashboard\SelectCompanyController::class, 'switch']);
            
            Route::get('dashboard/api-keys', [\App\Http\Controllers\Api\V1\Dashboard\ApiKeyController::class, 'index']);
            Route::post('dashboard/api-keys', [\App\Http\Controllers\Api\V1\Dashboard\ApiKeyController::class, 'store']);
            Route::get('dashboard/audit', [\App\Http\Controllers\Api\V1\Dashboard\AuditController::class, 'index']);
            Route::get('dashboard/audit/{uuid}', [\App\Http\Controllers\Api\V1\Dashboard\AuditController::class, 'show']);

            // Super Admin (role check via closure)
            Route::prefix('super-admin')->middleware('super.admin')->group(function () {
                Route::get('companies', [\App\Http\Controllers\Api\V1\SuperAdminController::class, 'companies']);
                Route::get('companies/{companyId}/users', [\App\Http\Controllers\Api\V1\SuperAdminController::class, 'companyUsers']);
                Route::post('impersonate/start', [\App\Http\Controllers\Api\V1\SuperAdminController::class, 'startImpersonation']);
                Route::post('impersonate/stop', [\App\Http\Controllers\Api\V1\SuperAdminController::class, 'stopImpersonation']);
                Route::get('impersonate/status', [\App\Http\Controllers\Api\V1\SuperAdminController::class, 'impersonationStatus']);
                Route::get('impersonate/history', [\App\Http\Controllers\Api\V1\SuperAdminController::class, 'impersonationHistory']);
            });

            // User Management
            Route::get('dashboard/users', [\App\Http\Controllers\Api\V1\Dashboard\UserManagementController::class, 'index']);
            Route::post('dashboard/users', [\App\Http\Controllers\Api\V1\Dashboard\UserManagementController::class, 'store']);
            Route::patch('dashboard/users/{uuid}', [\App\Http\Controllers\Api\V1\Dashboard\UserManagementController::class, 'update']);
            Route::delete('dashboard/users/{uuid}', [\App\Http\Controllers\Api\V1\Dashboard\UserManagementController::class, 'destroy']);
            Route::post('dashboard/users/{uuid}/reset-2fa', [\App\Http\Controllers\Api\V1\Dashboard\UserManagementController::class, 'reset2fa']);

            // Role Management
            Route::get('dashboard/roles/permissions', [\App\Http\Controllers\Api\V1\Dashboard\RoleController::class, 'permissions']);
            Route::get('dashboard/roles', [\App\Http\Controllers\Api\V1\Dashboard\RoleController::class, 'index']);
            Route::post('dashboard/roles', [\App\Http\Controllers\Api\V1\Dashboard\RoleController::class, 'store']);
            Route::patch('dashboard/roles/{id}', [\App\Http\Controllers\Api\V1\Dashboard\RoleController::class, 'update']);
            Route::delete('dashboard/roles/{id}', [\App\Http\Controllers\Api\V1\Dashboard\RoleController::class, 'destroy']);

            // Security & Sessions
            Route::get('dashboard/security/status', [\App\Http\Controllers\Api\V1\Dashboard\SecuritySettingsController::class, 'status']);
            Route::get('dashboard/security/sessions', [\App\Http\Controllers\Api\V1\Dashboard\SecuritySettingsController::class, 'sessions']);
            Route::delete('dashboard/security/sessions/{tokenId}', [\App\Http\Controllers\Api\V1\Dashboard\SecuritySettingsController::class, 'revokeSession']);

            // ═══════════════════════════════════════════════════════════════
            // Fase 5 — Routing & Trust (2FA required)
            // ═══════════════════════════════════════════════════════════════
            Route::get('dashboard/routing', [\App\Http\Controllers\Api\V1\Dashboard\RoutingController::class, 'index']);
            Route::post('dashboard/routing/simulate', [\App\Http\Controllers\Api\V1\Dashboard\RoutingController::class, 'simulate']);
            Route::post('dashboard/routing/rules', [\App\Http\Controllers\Api\V1\Dashboard\RoutingController::class, 'storeRule']);
            Route::get('dashboard/routing/decisions', [\App\Http\Controllers\Api\V1\Dashboard\RoutingController::class, 'decisions']);

            Route::get('dashboard/trust-layer', [\App\Http\Controllers\Api\V1\Dashboard\TrustLayerController::class, 'index']);
            Route::post('dashboard/trust-layer/evaluate', [\App\Http\Controllers\Api\V1\Dashboard\TrustLayerController::class, 'evaluate']);
        });

        // Onboarding — Gateway (fora de 2fa para permitir fluxo inicial)
        Route::post('dashboard/gateways', [\App\Http\Controllers\Api\V1\Dashboard\GatewayController::class, 'store']);
        Route::post('dashboard/gateways/{uuid}/test', [\App\Http\Controllers\Api\V1\Dashboard\GatewayController::class, 'test']);
        
        Route::get('dashboard/webhook-events', [\App\Http\Controllers\Api\V1\Dashboard\WebhookEventController::class, 'index']);

        // ═══════════════════════════════════════════════════════════════════
        // Studio / Checkouts
        // ═══════════════════════════════════════════════════════════════════
        Route::get('dashboard/checkouts/studio/session', [\App\Http\Controllers\Api\V1\Dashboard\CheckoutStudioController::class, 'getSessionToken']);
        
        Route::apiResource('checkouts', \App\Http\Controllers\Api\V1\CheckoutController::class);
        Route::post('checkouts/{id}/publish', [\App\Http\Controllers\Api\V1\CheckoutController::class, 'publish']);

        // Basileia Studio (Visual Editor)
        Route::get('studio/blocks', [\App\Http\Controllers\Api\V1\Dashboard\CheckoutStudioController::class, 'blocks']);
        Route::post('studio/checkouts/{id}/canvas', [\App\Http\Controllers\Api\V1\Dashboard\CheckoutStudioController::class, 'saveCanvas']);

        // ═══════════════════════════════════════════════════════════════════
        // Fase 5 — Studio AI, Preview, Publication, Versions
        // ═══════════════════════════════════════════════════════════════════
        Route::post('studio/ai/generate', [\App\Http\Controllers\Api\V1\Studio\AiCheckoutController::class, 'generate']);
        Route::post('studio/ai/save-draft', [\App\Http\Controllers\Api\V1\Studio\AiCheckoutController::class, 'saveDraft']);

        Route::get('studio/checkouts/{id}/preview', [\App\Http\Controllers\Api\V1\Studio\CheckoutPreviewController::class, 'show']);
        Route::get('studio/checkouts/{id}/preview-url', [\App\Http\Controllers\Api\V1\Studio\CheckoutPreviewController::class, 'url']);

        Route::get('studio/checkouts/{id}/validate', [\App\Http\Controllers\Api\V1\Studio\CheckoutPublicationController::class, 'validateCheckout']);
        Route::post('studio/checkouts/{id}/publish', [\App\Http\Controllers\Api\V1\Studio\CheckoutPublicationController::class, 'publish'])->middleware('2fa');

        Route::get('studio/checkouts/{checkoutId}/versions', [\App\Http\Controllers\Api\V1\Studio\CheckoutVersionController::class, 'index']);
        Route::post('studio/checkouts/{checkoutId}/versions', [\App\Http\Controllers\Api\V1\Studio\CheckoutVersionController::class, 'store']);
        Route::post('studio/checkouts/{checkoutId}/versions/{versionId}/restore', [\App\Http\Controllers\Api\V1\Studio\CheckoutVersionController::class, 'restore']);
        Route::post('studio/checkouts/{checkoutId}/versions/{versionId}/duplicate', [\App\Http\Controllers\Api\V1\Studio\CheckoutVersionController::class, 'duplicate']);

        // Pix Automático (Assinaturas)
        Route::get('subscriptions', [\App\Http\Controllers\Api\V1\PixSubscriptionController::class, 'index']);
        Route::post('subscriptions', [\App\Http\Controllers\Api\V1\PixSubscriptionController::class, 'store']);
        Route::get('subscriptions/{uuid}', [\App\Http\Controllers\Api\V1\PixSubscriptionController::class, 'show']);
        Route::post('subscriptions/{uuid}/cancel', [\App\Http\Controllers\Api\V1\PixSubscriptionController::class, 'cancel']);

        // Legacy / Integration Support
        Route::post('payments/process', [\App\Http\Controllers\Api\V1\PaymentController::class, 'process']);
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
// API v2 — Next.js Frontend Integration
// ═══════════════════════════════════════════════════════════════════════════════
Route::prefix('v2')->name('api.v2.')->group(function () {
    Route::post('auth/login', [\App\Http\Controllers\Api\V2\AuthController::class, 'login'])->middleware('throttle:auth_login');
    Route::post('auth/register', [\App\Http\Controllers\Api\V2\AuthController::class, 'register'])->middleware('throttle:auth_register');
    Route::post('auth/refresh', [\App\Http\Controllers\Api\V2\AuthController::class, 'refresh'])->middleware(['auth:sanctum', 'throttle:auth_login']);

    // 2FA verify FORA do middleware auth:sanctum para evitar redirect 302 que
    // converte POST em GET. A autenticação é validada no próprio controller.
    Route::match(['get', 'post'], 'auth/2fa/verify', [\App\Http\Controllers\Api\V2\AuthController::class, 'verify2fa']);

    Route::middleware(['auth:sanctum'])->group(function () {
        Route::get('auth/me', [\App\Http\Controllers\Api\V2\AuthController::class, 'me']);
        Route::post('auth/2fa/setup', [\App\Http\Controllers\Api\V2\AuthController::class, 'setup2fa']);
        Route::post('auth/2fa/enable', [\App\Http\Controllers\Api\V2\AuthController::class, 'enable2fa']);
        Route::post('auth/logout', [\App\Http\Controllers\Api\V2\AuthController::class, 'logout']);
    });
    
    Route::middleware(['auth:sanctum', 'zero.trust'])->group(function () {
        Route::get('dashboard/stats', [\App\Http\Controllers\Api\V2\DashboardController::class, 'stats']);
    });
});
