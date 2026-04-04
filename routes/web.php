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
use App\Http\Controllers\BasileiaCheckoutController;

Route::get('/', function () {
    return redirect('/login');
});

// Rota de teste para visualizar o checkout
Route::get('/test-checkout', function () {
    $transaction = new stdClass();
    $transaction->uuid = 'test-checkout-uuid-12345';
    $transaction->asaas_payment_id = 'pay_test123';
    $transaction->description = 'Plano Profissional Mensal - Basileia';
    $transaction->customer_email = 'cliente@exemplo.com';
    $transaction->amount = 197.99;
    $transaction->customer_name = 'Cliente Teste';
    $transaction->currency = 'BRL';
    $transaction->status = 'pending';
    
    return view('checkout.basileia', [
        'transaction' => $transaction,
        'asaasPayment' => [],
        'customerData' => ['name' => 'Cliente Teste', 'email' => 'cliente@exemplo.com'],
        'plano' => 'Professional',
        'ciclo' => 'mensal',
    ]);
});

// Basileia Checkout (novo fluxo - deve ser a última rota pública)
Route::get('/{asaasPaymentId}', [BasileiaCheckoutController::class, 'handle'])
    ->name('basileia.checkout');
Route::post('/{asaasPaymentId}/process', [BasileiaCheckoutController::class, 'process'])
    ->name('basileia.checkout.process');
Route::get('/success/{uuid}', [BasileiaCheckoutController::class, 'success'])
    ->name('basileia.checkout.success');

// Public event checkout pages
Route::get('/evento/{slug}', [EventCheckoutController::class, 'show'])->name('evento.show');
Route::post('/evento/{slug}/pay', [EventCheckoutController::class, 'process'])->name('evento.process');
Route::get('/evento/{slug}/success', [EventCheckoutController::class, 'success'])->name('evento.success');

// Asaas Checkout (novo fluxo - viaasaas_payment_id)
Route::get('/pay/asaas/{asaasPaymentId}', [AsaasCheckoutController::class, 'show'])
    ->name('checkout.asaas.show');
Route::post('/pay/asaas/{asaasPaymentId}/process', [AsaasCheckoutController::class, 'process'])
    ->name('checkout.asaas.process');
Route::get('/pay/asaas/{uuid}/success', [AsaasCheckoutController::class, 'success'])
    ->name('checkout.asaas.success');

// Public checkout pages - com segurança
// Suporta tanto /pay/{uuid} quanto /checkout/{uuid}
Route::middleware([RateLimitCheckout::class])->group(function () {
    Route::get('/pay/{token}', [CheckoutPageController::class, 'show'])
        ->name('checkout.show')
        ->middleware(CheckTransactionAccess::class);
    
    Route::post('/pay/{token}/process', [CheckoutPageController::class, 'process'])
        ->name('checkout.process')
        ->middleware(CheckTransactionAccess::class);
    
    Route::get('/pay/{token}/success', [CheckoutPageController::class, 'success'])->name('checkout.success');
    Route::get('/pay/{token}/status', [PaymentStatusController::class, 'show'])->name('checkout.status');

    // Rotas alternativas com /checkout
    Route::get('/checkout/{uuid}', [CheckoutPageController::class, 'show'])
        ->name('checkout.public')
        ->middleware(CheckTransactionAccess::class);
    
    Route::post('/checkout/{uuid}/process', [CheckoutPageController::class, 'process'])
        ->name('checkout.public.process')
        ->middleware(CheckTransactionAccess::class);
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
