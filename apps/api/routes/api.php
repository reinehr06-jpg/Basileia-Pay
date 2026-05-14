<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\TransactionController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\CustomerController;
use App\Http\Controllers\Api\SubscriptionController;
use App\Http\Controllers\Api\ReportController;
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
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// Basileia Pay v1 API
Route::prefix('v1')->group(function () {
    // Checkout Sessions (Sistemas Conectados)
    Route::post('checkout-sessions', [\App\Http\Controllers\Api\V1\CheckoutSessionController::class, 'store']);
    Route::get('checkout-sessions/{id}', [\App\Http\Controllers\Api\V1\CheckoutSessionController::class, 'show']);
    
    // Auth (Legacy)
    Route::post('auth/login', [AuthController::class, 'login'])->middleware('throttle:5,1');
    Route::post('auth/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
    Route::post('auth/refresh', [AuthController::class, 'refresh'])->middleware('auth:sanctum');

    // Protected routes (via integration ck_live_... keys)
    Route::middleware('api.auth')->group(function () {
        // Transactions
        Route::apiResource('transactions', TransactionController::class);
        Route::post('transactions/{id}/cancel', [TransactionController::class, 'cancel']);
        Route::post('transactions/{id}/refund', [TransactionController::class, 'refund']);

        // Payments
        Route::post('payments/process', [PaymentController::class, 'process']);
        Route::get('payments/{id}/status', [PaymentController::class, 'status']);
        Route::get('payments/{id}/pix', [PaymentController::class, 'pix']);
        Route::get('payments/{id}/boleto', [PaymentController::class, 'boleto']);

        // Customers
        Route::apiResource('customers', CustomerController::class);

        // Subscriptions
        Route::apiResource('subscriptions', SubscriptionController::class);
        Route::post('subscriptions/{id}/pause', [SubscriptionController::class, 'pause']);
        Route::post('subscriptions/{id}/resume', [SubscriptionController::class, 'resume']);

        // Reports
        Route::get('reports/summary', [ReportController::class, 'summary']);
        Route::get('reports/transactions', [ReportController::class, 'transactions']);
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// API v2 — para o frontend Next.js (migração incremental)
// Blade continua funcionando normalmente
// ─────────────────────────────────────────────────────────────────────────────
Route::prefix('v2')->name('api.v2.')->group(function () {

    // ── Auth (sem middleware — é o login) ─────────────────────────────────────
    Route::post('auth/login',  [\App\Http\Controllers\Api\V2\AuthController::class, 'login']);
    Route::post('auth/logout', [\App\Http\Controllers\Api\V2\AuthController::class, 'logout'])
        ->middleware('auth:sanctum');
    Route::get('auth/me',      [\App\Http\Controllers\Api\V2\AuthController::class, 'me'])
        ->middleware('auth:sanctum');

    // ── Checkout público (sem auth) ───────────────────────────────────────────
    Route::prefix('checkout')->name('checkout.')->group(function () {
        Route::get('{uuid}',         [\App\Http\Controllers\Api\V2\CheckoutController::class, 'show']);
        Route::post('{uuid}/process',[\App\Http\Controllers\Api\V2\CheckoutController::class, 'process']);
        Route::get('{uuid}/status',  [\App\Http\Controllers\Api\V2\CheckoutController::class, 'status']);
        Route::get('{uuid}/receipt', [\App\Http\Controllers\Api\V2\CheckoutController::class, 'receipt']);
    });

    // ── Eventos público (sem auth) ────────────────────────────────────────────
    Route::prefix('events')->name('events.')->group(function () {
        Route::get('{slug}',         [\App\Http\Controllers\Api\V2\EventCheckoutController::class, 'show']);
        Route::post('{slug}/process',[\App\Http\Controllers\Api\V2\EventCheckoutController::class, 'process']);
        Route::get('{slug}/status',  [\App\Http\Controllers\Api\V2\EventCheckoutController::class, 'status']);
    });

    // ── Dashboard (autenticado via Sanctum) ───────────────────────────────────
    Route::middleware('auth:sanctum')->prefix('dashboard')->name('dashboard.')->group(function () {

        // KPIs + gráfico
        Route::get('stats',          [\App\Http\Controllers\Api\V2\DashboardController::class, 'stats']);

        // Transações
        Route::get('transactions',           [\App\Http\Controllers\Api\V2\TransactionController::class, 'index']);
        Route::get('transactions/export',    [\App\Http\Controllers\Api\V2\TransactionController::class, 'export']);
        Route::get('transactions/{id}',      [\App\Http\Controllers\Api\V2\TransactionController::class, 'show']);
        Route::post('transactions/{id}/cancel',[\App\Http\Controllers\Api\V2\TransactionController::class, 'cancel']);
        Route::post('transactions/{id}/refund',[\App\Http\Controllers\Api\V2\TransactionController::class, 'refund']);

        // Gateways
        Route::get('gateways',           [\App\Http\Controllers\Api\V2\GatewayController::class, 'index']);
        Route::post('gateways',          [\App\Http\Controllers\Api\V2\GatewayController::class, 'store']);
        Route::get('gateways/{id}',      [\App\Http\Controllers\Api\V2\GatewayController::class, 'show']);
        Route::put('gateways/{id}',      [\App\Http\Controllers\Api\V2\GatewayController::class, 'update']);
        Route::delete('gateways/{id}',   [\App\Http\Controllers\Api\V2\GatewayController::class, 'destroy']);
        Route::post('gateways/{id}/toggle',[\App\Http\Controllers\Api\V2\GatewayController::class, 'toggle']);
        Route::post('gateways/{id}/test',  [\App\Http\Controllers\Api\V2\GatewayController::class, 'test']);

        // Eventos (painel)
        Route::get('events',             [\App\Http\Controllers\Api\V2\EventController::class, 'index']);
        Route::post('events',            [\App\Http\Controllers\Api\V2\EventController::class, 'store']);
        Route::post('events/{id}/toggle',[\App\Http\Controllers\Api\V2\EventController::class, 'toggle']);
        Route::delete('events/{id}',     [\App\Http\Controllers\Api\V2\EventController::class, 'destroy']);

        // Relatórios
        Route::get('reports/summary',    [\App\Http\Controllers\Api\V2\ReportController::class, 'summary']);
        Route::get('reports/export',     [\App\Http\Controllers\Api\V2\ReportController::class, 'export']);

        // Webhooks
        Route::get('webhooks',           [\App\Http\Controllers\Api\V2\WebhookController::class, 'index']);
        Route::get('webhooks/{id}',      [\App\Http\Controllers\Api\V2\WebhookController::class, 'show']);
        Route::post('webhooks/{id}/retry',[\App\Http\Controllers\Api\V2\WebhookController::class, 'retry']);

        // Integrações
        Route::get('integrations',           [\App\Http\Controllers\Api\V2\IntegrationController::class, 'index']);
        Route::post('integrations',          [\App\Http\Controllers\Api\V2\IntegrationController::class, 'store']);
        Route::put('integrations/{id}',      [\App\Http\Controllers\Api\V2\IntegrationController::class, 'update']);
        Route::post('integrations/{id}/toggle',[\App\Http\Controllers\Api\V2\IntegrationController::class, 'toggle']);
        Route::delete('integrations/{id}',   [\App\Http\Controllers\Api\V2\IntegrationController::class, 'destroy']);

        // Sources
        Route::get('sources',            [\App\Http\Controllers\Api\V2\SourceController::class, 'index']);
        Route::post('sources',           [\App\Http\Controllers\Api\V2\SourceController::class, 'store']);
        Route::put('sources/{id}',       [\App\Http\Controllers\Api\V2\SourceController::class, 'update']);
        Route::patch('sources/{id}/toggle',[\App\Http\Controllers\Api\V2\SourceController::class, 'toggle']);
        Route::delete('sources/{id}',    [\App\Http\Controllers\Api\V2\SourceController::class, 'destroy']);

        // Settings
        Route::get('settings/receipt',   [\App\Http\Controllers\Api\V2\SettingsController::class, 'receipt']);
        Route::put('settings/receipt',   [\App\Http\Controllers\Api\V2\SettingsController::class, 'updateReceipt']);

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

// ─── Internal Vault (Serviço próprio de Tokenização) ───
// ATENÇÃO: Em produção, estas rotas devem estar sob firewall interno (mTLS) ou API Key forte.
// Elas NÃO devem ser expostas para acesso irrestrito externo.
Route::prefix('vault')->group(function () {
    Route::post('tokenize-card', [\App\Http\Controllers\Api\VaultController::class, 'tokenize']);
    Route::post('resolve-token', [\App\Http\Controllers\Api\VaultController::class, 'resolve']);
});
