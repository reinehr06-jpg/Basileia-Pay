<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Public\CheckoutPageController;
use App\Http\Controllers\Public\PaymentStatusController;
use App\Http\Controllers\Dashboard\AuthController;
use App\Http\Controllers\Dashboard\DashboardController;
use App\Http\Controllers\Dashboard\TransactionDashboardController;
use App\Http\Controllers\Dashboard\IntegrationController;
use App\Http\Controllers\Dashboard\WebhookLogController;
use App\Http\Controllers\Dashboard\GatewayController;
use App\Http\Controllers\Dashboard\CompanyController;
use App\Http\Controllers\Dashboard\ReportController;
use App\Http\Controllers\Dashboard\EventController;
use App\Http\Controllers\Public\EventCheckoutController;
use App\Http\Controllers\AsaasCheckoutController;
use App\Http\Controllers\Dashboard\SourceConfigController;
use App\Http\Controllers\Dashboard\PasswordController;
use App\Http\Middleware\RateLimitCheckout;
use App\Http\Middleware\CheckTransactionAccess;

Route::get('/', function (\Illuminate\Http\Request $request) {
    if ($request->has('asaas_payment_id')) {
        return redirect()->route('checkout.asaas.show', [
            'asaasPaymentId' => $request->get('asaas_payment_id')
        ] + $request->all());
    }
    return redirect('/login');
});

// Public event checkout pages
Route::get('/evento/{slug}', [EventCheckoutController::class, 'show'])->name('evento.show');
Route::post('/evento/{slug}/pay', [EventCheckoutController::class, 'process'])->name('evento.process');
Route::get('/evento/{slug}/success', [EventCheckoutController::class, 'success'])->name('evento.success');

// Elite Checkout Flow (Basileia Secure)
Route::prefix('pay')->group(function () {
    Route::get('/{uuid}', [CheckoutController::class, 'show'])->name('checkout.pay');
    Route::post('/{uuid}/process', [CheckoutController::class, 'process'])->name('checkout.process');
    Route::get('/{uuid}/success', [CheckoutController::class, 'success'])->name('checkout.success');
    Route::get('/{uuid}/receipt', [CheckoutController::class, 'receipt'])->name('checkout.receipt');
});

// Suporte para links antigos de /checkout
Route::get('/checkout/{uuid}', function($uuid) {
    return redirect()->route('checkout.pay', $uuid);
});

// Auth
Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
Route::post('/login', [AuthController::class, 'login'])->name('login.post');
Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

// Password
Route::get('/password/change', [PasswordController::class, 'showChangeForm'])->name('password.change')->middleware('auth');
Route::post('/password/change', [PasswordController::class, 'changePassword'])->middleware('auth');

// Dashboard (authenticated)
Route::prefix('/dashboard')->middleware(['auth'])->group(function () {
    Route::get('/', [DashboardController::class, 'index'])->name('dashboard.index');

    // Transactions
    Route::get('/transactions', [TransactionDashboardController::class, 'index'])->name('dashboard.transactions');
    Route::get('/transactions/{id}', [TransactionDashboardController::class, 'show'])->name('dashboard.transactions.show');
    Route::get('/transactions-export', [TransactionDashboardController::class, 'export'])->name('dashboard.transactions.export');

    // Integrations
    Route::resource('integrations', IntegrationController::class)->names('dashboard.integrations');
    Route::post('/integrations/{id}/toggle', [IntegrationController::class, 'toggle'])->name('dashboard.integrations.toggle');
    Route::post('/integrations/{id}/regenerate-key', [IntegrationController::class, 'regenerateKey'])->name('dashboard.integrations.regenerate-key');

    // Webhook logs
    Route::get('/webhooks', [WebhookLogController::class, 'index'])->name('dashboard.webhooks');
    Route::get('/webhooks/{id}', [WebhookLogController::class, 'show'])->name('dashboard.webhooks.show');
    Route::post('/webhooks/{id}/retry', [WebhookLogController::class, 'retry'])->name('dashboard.webhooks.retry');

    // Gateways
    Route::resource('gateways', GatewayController::class)->names('dashboard.gateways');
    Route::post('/gateways/{id}/toggle', [GatewayController::class, 'toggle'])->name('dashboard.gateways.toggle');

    // Companies (super admin)
    Route::resource('companies', CompanyController::class)->names('dashboard.companies');
    Route::post('/companies/{id}/toggle', [CompanyController::class, 'toggle'])->name('dashboard.companies.toggle');

    // Reports
    Route::get('/reports', [ReportController::class, 'index'])->name('dashboard.reports');
    Route::get('/reports/summary', [ReportController::class, 'summary'])->name('dashboard.reports.summary');
    Route::get('/reports/export', [ReportController::class, 'export'])->name('dashboard.reports.export');

    // Configurações do Sistema
    Route::get('/settings/receipt', [\App\Http\Controllers\Dashboard\ReceiptController::class, 'index'])->name('dashboard.settings.receipt');
    Route::put('/settings/receipt', [\App\Http\Controllers\Dashboard\ReceiptController::class, 'update'])->name('dashboard.settings.receipt.update');

    // Events / Links
    Route::get('/events', [EventController::class, 'index'])->name('dashboard.events.index');
    Route::post('/events', [EventController::class, 'store'])->name('dashboard.events.store');
    Route::post('/events/{event}/toggle', [EventController::class, 'toggle'])->name('dashboard.events.toggle');
    Route::delete('/events/{event}', [EventController::class, 'destroy'])->name('dashboard.events.destroy');

    // Source Configs (Sistemas de Origem)
    Route::get('/sources', [SourceConfigController::class, 'index'])->name('dashboard.sources.index');
    Route::post('/sources', [SourceConfigController::class, 'store'])->name('dashboard.sources.store');
    Route::put('/sources/{source}', [SourceConfigController::class, 'update'])->name('dashboard.sources.update');
    Route::patch('/sources/{source}/toggle', [SourceConfigController::class, 'toggle'])->name('dashboard.sources.toggle');
    Route::delete('/sources/{source}', [SourceConfigController::class, 'destroy'])->name('dashboard.sources.destroy');
});
