<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\AsaasCheckoutController;
// Fallback for modular routes
use App\Http\Controllers\BasileiaCheckoutController;
use App\Http\Controllers\Public\CheckoutBuilderPublicController;

/*
|--------------------------------------------------------------------------
| Checkout Routes (Modularized)
|--------------------------------------------------------------------------
*/

// ── Builder Public Checkout (slug-based) ─────────────────────────────────
Route::get('/ck/{slug}', [CheckoutBuilderPublicController::class, 'show'])->name('checkout.builder.show');

// ── Asaas Direct Checkout (Legacy) ───────────────────────────────────────
Route::get('/checkout/asaas/{asaasPaymentId}', [AsaasCheckoutController::class, 'show'])->name('checkout.asaas.show');
Route::post('/checkout/asaas/process/{asaasPaymentId}', [AsaasCheckoutController::class, 'process'])->name('checkout.asaas.process');
Route::get('/checkout/asaas/success/{uuid}', [AsaasCheckoutController::class, 'success'])->name('checkout.asaas.success');

// ── Eventos ─────────────────────────────────────────────────────────────
Route::get('/evento/{slug}', [BasileiaCheckoutController::class, 'show'])->name('evento.show');
Route::post('/evento/{slug}/pay', [BasileiaCheckoutController::class, 'process'])->name('evento.process');
Route::get('/evento/{slug}/success', [BasileiaCheckoutController::class, 'success'])->name('evento.success');

// ── PIX (Modular) ───────────────────────────────────────────────────────
Route::prefix('checkout/pix')->name('checkout.pix.')->group(function () {
    Route::get('/{uuid}', [BasileiaCheckoutController::class, 'show'])->name('show');
    Route::post('/process/{uuid}', [BasileiaCheckoutController::class, 'process'])->name('process');
    Route::get('/status/{uuid}', [BasileiaCheckoutController::class, 'status'])->name('status');
    Route::get('/success/{uuid}', [BasileiaCheckoutController::class, 'success'])->name('success');
});

// ── Boleto (Modular) ────────────────────────────────────────────────────
Route::prefix('checkout/boleto')->name('checkout.boleto.')->group(function () {
    Route::get('/{uuid}', [BasileiaCheckoutController::class, 'show'])->name('show');
    Route::post('/process/{uuid}', [BasileiaCheckoutController::class, 'process'])->name('process');
    Route::get('/status/{uuid}', [BasileiaCheckoutController::class, 'status'])->name('status');
    Route::get('/success/{uuid}', [BasileiaCheckoutController::class, 'success'])->name('success');
});

// ── Card / Default (Modular) ────────────────────────────────────────────
Route::prefix('checkout')->group(function () {
    Route::get('/{uuid}', [BasileiaCheckoutController::class, 'show'])
        ->name('checkout.show')
        ->where('uuid', '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}');

    Route::post('/process/{uuid}', [BasileiaCheckoutController::class, 'process'])->name('checkout.process');
    Route::get('/status/{uuid}', [BasileiaCheckoutController::class, 'status'])->name('checkout.status');
    Route::get('/success/{uuid}', [BasileiaCheckoutController::class, 'success'])->name('checkout.card.success');
});

// ── Short URL Support ───────────────────────────────────────────────────
Route::get('/c/{asaasPaymentId}', [BasileiaCheckoutController::class, 'handle'])
    ->name('checkout.short')
    ->middleware('secure.token');

// ── Legacy Pay Routes ───────────────────────────────────────────────────
Route::prefix('pay')->group(function () {
    Route::post('/{uuid}/process', [BasileiaCheckoutController::class, 'process'])->name('checkout.legacy.process');
    Route::get('/{uuid}/success', [BasileiaCheckoutController::class, 'success'])->name('checkout.legacy.success');
    Route::get('/{uuid}/receipt', [BasileiaCheckoutController::class, 'receipt'])->name('checkout.receipt');
});

// ── Catch-All ───────────────────────────────────────────────────────────
Route::get('/{uuid}', [BasileiaCheckoutController::class, 'show'])
    ->where('uuid', '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}')
    ->name('checkout.pay');
