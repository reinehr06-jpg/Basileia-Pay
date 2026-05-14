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
