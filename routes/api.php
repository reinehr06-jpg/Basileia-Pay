<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\TransactionController;
use App\Http\Controllers\Api\V1\PaymentController;
use App\Http\Controllers\Api\V1\CustomerController;
use App\Http\Controllers\Api\V1\SubscriptionController;
use App\Http\Controllers\Api\V1\ReportController;
use App\Http\Controllers\Api\V1\CheckoutWebhookController;
use App\Http\Controllers\Api\V1\WebhookController;
use App\Http\Controllers\AsaasWebhookController;
use App\Http\Controllers\Dashboard\CheckoutConfigController;
use App\Http\Controllers\Dashboard\CheckoutVersionController;
use App\Http\Controllers\Dashboard\CheckoutAbTestController;
use App\Http\Controllers\Dashboard\CheckoutAuditController;
use App\Http\Controllers\Dashboard\CheckoutApprovalController;
use App\Http\Controllers\Dashboard\CheckoutWhiteLabelController;

// ─── Lab / Checkout Editor (API REST para o frontend Next.js) ───
Route::middleware(['auth:sanctum'])->prefix('dashboard')->group(function () {
    // Checkout configs CRUD
    Route::get   ('checkout-configs',              [CheckoutConfigController::class, 'index']);
    Route::get   ('checkout-configs/{id}',         [CheckoutConfigController::class, 'show']);
    Route::post  ('checkout-configs',              [CheckoutConfigController::class, 'store']);
    Route::put   ('checkout-configs/{id}',         [CheckoutConfigController::class, 'update']);
    Route::delete('checkout-configs/{id}',         [CheckoutConfigController::class, 'destroy']);
    Route::post  ('checkout-configs/{id}/publish', [CheckoutConfigController::class, 'publish']);
    Route::post  ('upload',                        [CheckoutConfigController::class, 'upload']);
    Route::post  ('checkout-configs/import-url',   [\App\Http\Controllers\Dashboard\CheckoutImportController::class, 'fromUrl']);
    
    // AI Import
    Route::post('checkout-configs/import-image',          [\App\Http\Controllers\Dashboard\CheckoutAiImportController::class, 'fromImage']);
    Route::post('checkout-configs/import-html',           [\App\Http\Controllers\Dashboard\CheckoutAiImportController::class, 'fromHtml']);
    Route::post('checkout-configs/import-url-screenshot', [\App\Http\Controllers\Dashboard\CheckoutAiImportController::class, 'fromUrlScreenshot']);

    // Histórico de versões
    Route::get ('checkout-configs/{id}/versions',                [CheckoutVersionController::class, 'index']);
    Route::post('checkout-configs/{id}/versions/{vid}/restore',  [CheckoutVersionController::class, 'restore']);

    // Link de teste temporário
    Route::post('checkout-configs/{id}/test-link',               [CheckoutConfigController::class, 'generateTestLink']);

    // A/B Test
    Route::get ('ab-test',              [CheckoutAbTestController::class, 'show']);
    Route::post('ab-test',              [CheckoutAbTestController::class, 'store']);
    Route::put ('ab-test',              [CheckoutAbTestController::class, 'update']);
    Route::post('ab-test/{id}/toggle',  [CheckoutAbTestController::class, 'toggle']);

    // RBAC
    Route::get('me/lab-role', function(\Illuminate\Http\Request $req) {
        $u = $req->user(); $r = 'viewer';
        if ($u->isSuperAdmin()) $r = 'owner';
        elseif ($u->isAdmin()) $r = 'admin';
        elseif ($u->isOperator()) $r = 'editor';
        return response()->json(['role' => $r]);
    });

    // Auditoria
    Route::get('audit', [CheckoutAuditController::class, 'index']);
    Route::get('checkout-configs/{id}/audit', [CheckoutAuditController::class, 'forConfig']);

    // White Label
    Route::get('white-label', [CheckoutWhiteLabelController::class, 'show']);
    Route::put('white-label', [CheckoutWhiteLabelController::class, 'update']);

    // Aprovações
    Route::get('approvals', [CheckoutApprovalController::class, 'queue']);
    Route::post('checkout-configs/{id}/request-publish', [CheckoutApprovalController::class, 'request']);
    Route::post('approvals/{id}/approve', [CheckoutApprovalController::class, 'approve']);
    Route::post('approvals/{id}/reject', [CheckoutApprovalController::class, 'reject']);
});

// Rota pública para checkout de teste (sem auth)
Route::get('checkout/test/{token}', [CheckoutConfigController::class, 'showTestLink']);

Route::get('diag-check', function() {
    return response()->json([
        'status' => 'OK',
        'server' => 'CheckOut-Production',
        'version' => 'NUCLEAR_DIAG_999',
        'timestamp' => now()->toIso8601String(),
    ]);
});

// Webhook do Asaas (Rota pública oficial)
Route::post('webhooks/asaas', [AsaasWebhookController::class, 'handle'])->name('webhook.asaas');

Route::prefix('v1')->group(function () {
    // Ingestão de pagamentos do Vendas/Sistemas Externos
    Route::post('payments/receive', [\App\Http\Controllers\Api\PaymentApiController::class, 'receive']);

    // Auth
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
    });
});
