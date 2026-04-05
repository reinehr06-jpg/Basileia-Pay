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

Route::prefix('v1')->group(function () {
    // Ingestão de pagamentos do Vendas/Sistemas Externos
    Route::post('payments/receive', [\App\Http\Controllers\Api\PaymentApiController::class, 'receive']);

    // Webhook do Asaas (recebe do gateway)
    Route::post('webhooks/asaas', [WebhookController::class, 'asaas']);
    
    // Webhook do Asaas (novo - viaasaas_payment_id)
    Route::post('webhook/asaas', [AsaasWebhookController::class, 'handle'])
        ->name('webhook.asaas');
    
    // Webhook do Checkout (envia para sistemas externos como Basileia Vendas)
    Route::post('webhooks/checkout', [CheckoutWebhookController::class, 'handle']);

    // Auth
    Route::post('auth/login', [AuthController::class, 'login']);
    Route::post('auth/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
    Route::post('auth/refresh', [AuthController::class, 'refresh'])->middleware('auth:sanctum');

    // Protected routes
    Route::middleware('auth:sanctum')->group(function () {
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
