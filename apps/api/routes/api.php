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
// API v1 — Core Foundation (Fase 1)
// ═══════════════════════════════════════════════════════════════════════════════
Route::prefix('v1')->group(function () {

    // ── Auth (Público) ─────────────────────────────────────────────────────
    Route::post('auth/login', [\App\Http\Controllers\Api\V1\AuthController::class, 'login'])->middleware('throttle:login');

    // ── Checkout Sessions (Sistemas Conectados via API Key) ───────────────
    Route::post('checkout-sessions', [\App\Http\Controllers\Api\V1\CheckoutSessionController::class, 'store']);
    Route::get('checkout-sessions/{id}', [\App\Http\Controllers\Api\V1\CheckoutSessionController::class, 'show']);

    // ── Checkout Público (Next.js) ────────────────────────────────────────
    Route::get('public/checkout-sessions/{sessionToken}', [\App\Http\Controllers\Api\V1\PublicCheckoutController::class, 'show']);
    Route::post('public/checkout-sessions/{sessionToken}/pay', [\App\Http\Controllers\Api\V1\PublicCheckoutController::class, 'pay']);
    Route::get('public/checkout-sessions/{sessionToken}/status', [\App\Http\Controllers\Api\V1\PublicCheckoutController::class, 'status']);
    Route::post('public/checkout-sessions/{sessionToken}/frames', [\App\Http\Controllers\Public\SessionFramesController::class, 'store']);
    Route::post('public/checkout-sessions/{sessionToken}/abandon', [\App\Http\Controllers\Public\SessionFramesController::class, 'abandon']);

    // ── Webhooks de Gateways ──────────────────────────────────────────────
    Route::post('webhooks/gateways/{provider}/{accountUuid?}', [\App\Http\Controllers\Api\V1\GatewayWebhookController::class, 'handle']);

    // ── Rotas Protegidas (Dashboard & Integrações) ────────────────────────
    Route::middleware(['auth:sanctum', 'tracing', 'resolve.api.key'])->group(function () {
        
        // Auth Me
        Route::get('auth/me', [\App\Http\Controllers\Api\V1\AuthController::class, 'me']);

        // Dashboard Stats & Lists
        Route::get('dashboard/stats', [\App\Http\Controllers\Api\V1\Dashboard\StatsController::class, 'index']);
        Route::get('dashboard/payments', [\App\Http\Controllers\Api\V1\PaymentController::class, 'index']);
        Route::get('dashboard/orders', [\App\Http\Controllers\Api\V1\Dashboard\OrderController::class, 'index']);
        Route::get('dashboard/gateways', [\App\Http\Controllers\Api\V1\Dashboard\GatewayController::class, 'index']);
        Route::get('dashboard/systems', [\App\Http\Controllers\Api\V1\Dashboard\SystemController::class, 'index']);
        Route::get('dashboard/webhooks/endpoints', [\App\Http\Controllers\Api\V1\Dashboard\WebhookController::class, 'endpoints']);
        Route::get('dashboard/webhooks/deliveries', [\App\Http\Controllers\Api\V1\Dashboard\WebhookController::class, 'deliveries']);
        Route::post('dashboard/webhooks/endpoints', [\App\Http\Controllers\Api\V1\Dashboard\WebhookController::class, 'storeEndpoint']);
        Route::get('dashboard/audit', [\App\Http\Controllers\Api\V1\Dashboard\AuditController::class, 'index']);
        Route::get('dashboard/company', [\App\Http\Controllers\Api\V1\Dashboard\CompanyController::class, 'show']);
        Route::patch('dashboard/company', [\App\Http\Controllers\Api\V1\Dashboard\CompanyController::class, 'update']);
        Route::get('dashboard/api-keys', [\App\Http\Controllers\Api\V1\Dashboard\ApiKeyController::class, 'index']);
        Route::post('dashboard/api-keys', [\App\Http\Controllers\Api\V1\Dashboard\ApiKeyController::class, 'store']);

        // Studio / Checkouts
        Route::get('checkouts', [\App\Http\Controllers\Api\V1\StudioController::class, 'index']);
        Route::post('checkouts', [\App\Http\Controllers\Api\V1\StudioController::class, 'store']);
        Route::get('checkouts/{id}', [\App\Http\Controllers\Api\V1\StudioController::class, 'show']);
        Route::patch('checkouts/{id}', [\App\Http\Controllers\Api\V1\StudioController::class, 'update']);
        Route::post('checkouts/{id}/publish', [\App\Http\Controllers\Api\V1\StudioController::class, 'publish']);

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
    Route::post('auth/login', [\App\Http\Controllers\Api\V2\AuthController::class, 'login']);
    Route::middleware('auth:sanctum')->group(function () {
        Route::get('auth/me', [\App\Http\Controllers\Api\V2\AuthController::class, 'me']);
        Route::get('dashboard/stats', [\App\Http\Controllers\Api\V2\DashboardController::class, 'stats']);
    });
});
