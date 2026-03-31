<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\V1\WebhookController;
use App\Http\Controllers\Api\V1\CheckoutWebhookController;

// Webhooks from external gateways
Route::prefix('/webhooks/gateway')->group(function () {
    Route::post('/asaas', [WebhookController::class, 'asaas'])->name('webhooks.asaas');
    Route::post('/stripe', [WebhookController::class, 'stripe'])->name('webhooks.stripe');
    Route::post('/pagseguro', [WebhookController::class, 'pagseguro'])->name('webhooks.pagseguro');
});

// Webhook que o Checkout envia para sistemas externos (ex: Basileia Vendas)
// Rota pública que recebe webhooks do gateway e repassa para integrações configuradas
Route::post('/webhooks/checkout', [CheckoutWebhookController::class, 'handle'])->name('webhooks.checkout');
