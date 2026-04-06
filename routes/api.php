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

Route::get('diag-check', function() {
    return response()->json([
        'status' => 'OK',
        'server' => 'CheckOut-Production',
        'version' => 'NUCLEAR_DIAG_999',
        'timestamp' => now()->toIso8601String(),
    ]);
});

Route::prefix('v1')->group(function () {
    // Ingestão de pagamentos do Vendas/Sistemas Externos
    Route::post('payments/receive', [\App\Http\Controllers\Api\PaymentApiController::class, 'receive']);

    // Webhook do Asaas (recebe do gateway)
    Route::post('webhooks/asaas', [WebhookController::class, 'asaas']);
    
    // Webhook do Asaas (novo - viaasaas_payment_id)
    Route::post('webhook/asaas', [AsaasWebhookController::class, 'handle'])
        ->name('webhook.asaas');

    // Auth
    Route::post('auth/login', [AuthController::class, 'login']);
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

    // --- DIAGNOSTIC ROUTES ---
    
    // Webhook Sync Diagnostic (Incoming from Vendas)
    Route::post('webhook-sync-v100', [\App\Http\Controllers\Api\V1\VendasWebhookController::class, 'handle']);

    // Log Audit (View logs in browser)
    Route::get('audit-webhook-logs', function (\Illuminate\Http\Request $request) {
        if ($request->query('token') !== 'basileia_debug_99') {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $logPath = storage_path('logs/laravel.log');
        if (!file_exists($logPath)) {
            return response()->json(['message' => 'Log file not found at ' . $logPath]);
        }

        // Return last 100 lines for analysis
        $file = file($logPath);
        $lines = array_slice($file, -100);
        return response(implode('', $lines), 200, ['Content-Type' => 'text/plain']);
    });

    // --- EMERGENCY TEST ROUTES ---
    
    // Heartbeat for connectivity test (Bypasses signature and auth)
    Route::match(['get', 'post'], 'vendas-emergency-test-999', function () {
        return response()->json([
            'status' => 'ESTOU VIVO',
            'server' => 'CheckOut-Internal-Emergency-v999',
            'timestamp' => now()->toIso8601String()
        ]);
    });
});
