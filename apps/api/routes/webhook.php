<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\V1\WebhookController;
use App\Http\Controllers\Api\V1\CheckoutWebhookController;

// Webhooks from external gateways
Route::prefix('/webhooks/gateway')->group(function () {
    Route::post('/stripe', [WebhookController::class, 'stripe'])->name('webhooks.stripe');
    Route::post('/pagseguro', [WebhookController::class, 'pagseguro'])->name('webhooks.pagseguro');
});

// Webhook que o Checkout recebe de sistemas externos (ex: Basileia Vendas)
// Rota pública protegida por token de integração (ck_live_...) e assinatura X-Checkout-Signature
Route::middleware('api.auth')
    ->post('/webhooks/checkout', [\App\Http\Controllers\Api\V1\VendasWebhookController::class, 'handle'])
    ->name('webhooks.vendas');
