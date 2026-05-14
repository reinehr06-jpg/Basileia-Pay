<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\AsaasCheckoutController;
use App\Http\Controllers\BasileiaCheckoutController;
use App\Http\Controllers\CheckoutController;
use App\Http\Controllers\Checkout\Boleto\BoletoController;
use App\Http\Controllers\Checkout\Card\CardController;
use App\Http\Controllers\Checkout\EventCheckoutController;
use App\Http\Controllers\Checkout\Pix\PixController;

/*
|--------------------------------------------------------------------------
| Checkout Routes (Modularized)
|--------------------------------------------------------------------------
*/

// ── Asaas Direct Checkout (Legacy) ───────────────────────────────────────
Route::get('/checkout/asaas/{asaasPaymentId}', [AsaasCheckoutController::class, 'show'])->name('checkout.asaas.show');
Route::post('/checkout/asaas/process/{asaasPaymentId}', [AsaasCheckoutController::class, 'process'])->name('checkout.asaas.process');
Route::get('/checkout/asaas/success/{uuid}', [AsaasCheckoutController::class, 'success'])->name('checkout.asaas.success');

// ── Eventos ─────────────────────────────────────────────────────────────
Route::get('/evento/{slug}', [EventCheckoutController::class, 'show'])->name('evento.show');
Route::post('/evento/{slug}/pay', [EventCheckoutController::class, 'process'])->name('evento.process');
Route::get('/evento/{slug}/success', [EventCheckoutController::class, 'success'])->name('evento.success');

// ── PIX (Modular) ───────────────────────────────────────────────────────
Route::prefix('checkout/pix')->name('checkout.pix.')->group(function () {
    Route::get('/{uuid}', [PixController::class, 'show'])->name('show');
    Route::post('/process/{uuid}', [PixController::class, 'process'])->name('process');
    Route::get('/status/{uuid}', [PixController::class, 'status'])->name('status');
    Route::get('/success/{uuid}', [PixController::class, 'success'])->name('success');
});

// ── Boleto (Modular) ────────────────────────────────────────────────────
Route::prefix('checkout/boleto')->name('checkout.boleto.')->group(function () {
    Route::get('/{uuid}', [BoletoController::class, 'show'])->name('show');
    Route::post('/process/{uuid}', [BoletoController::class, 'process'])->name('process');
    Route::get('/status/{uuid}', [BoletoController::class, 'status'])->name('status');
    Route::get('/success/{uuid}', [BoletoController::class, 'success'])->name('success');
});

// ── Card / Default (Modular) ────────────────────────────────────────────
Route::prefix('checkout')->group(function () {
    Route::get('/{uuid}', [CardController::class, 'show'])
        ->name('checkout.show')
        ->where('uuid', '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}');

    Route::post('/process/{uuid}', [CardController::class, 'process'])->name('checkout.process');
    Route::get('/status/{uuid}', [CardController::class, 'status'])->name('checkout.status');
    Route::get('/success/{uuid}', [CardController::class, 'success'])->name('checkout.card.success');
});

// ── Short URL Support ───────────────────────────────────────────────────
Route::get('/c/{asaasPaymentId}', [BasileiaCheckoutController::class, 'handle'])
    ->name('checkout.short')
    ->middleware('secure.token');

// ── Legacy Pay Routes ───────────────────────────────────────────────────
Route::prefix('pay')->group(function () {
    Route::post('/{uuid}/process', [CheckoutController::class, 'process'])->name('checkout.legacy.process');
    Route::get('/{uuid}/success', [CheckoutController::class, 'success'])->name('checkout.legacy.success');
    Route::get('/{uuid}/receipt', [CheckoutController::class, 'receipt'])->name('checkout.receipt');
});

// ── Catch-All ───────────────────────────────────────────────────────────
Route::get('/{uuid}', [CheckoutController::class, 'show'])
    ->where('uuid', '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}')
    ->name('checkout.pay');
