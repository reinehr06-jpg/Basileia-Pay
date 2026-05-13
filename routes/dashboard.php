<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Dashboard\AuthController;
use App\Http\Controllers\Dashboard\CheckoutConfigController;
use App\Http\Controllers\Dashboard\CompanyController;
use App\Http\Controllers\Dashboard\DashboardController;
use App\Http\Controllers\Dashboard\EventController;
use App\Http\Controllers\Dashboard\GatewayController;
use App\Http\Controllers\Dashboard\IntegrationController;
use App\Http\Controllers\Dashboard\LabController;
use App\Http\Controllers\Dashboard\CheckoutCloneController;
use App\Http\Controllers\Dashboard\PasswordController;
use App\Http\Controllers\Dashboard\ProfileController;
use App\Http\Controllers\Dashboard\ReceiptController;
use App\Http\Controllers\Dashboard\ReportController;
use App\Http\Controllers\Dashboard\SourceConfigController;
use App\Http\Controllers\Dashboard\TransactionDashboardController;
use App\Http\Controllers\Dashboard\WebhookLogController;

/*
|--------------------------------------------------------------------------
| Dashboard Routes
|--------------------------------------------------------------------------
| Todas as rotas do painel administrativo (auth, dashboard, gateways, etc).
| Extraídas do web.php para isolamento modular.
|--------------------------------------------------------------------------
*/

// ── Auth ────────────────────────────────────────────────────────────────
Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
Route::post('/login', [AuthController::class, 'login'])->name('login.post');
Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

// ── Password ────────────────────────────────────────────────────────────
Route::get('/password/change', [PasswordController::class, 'showChangeForm'])->name('password.change')->middleware('auth');
Route::post('/password/change', [PasswordController::class, 'changePassword'])->middleware('auth');

// ── 2FA ─────────────────────────────────────────────────────────────────
Route::get('/profile/2fa/setup', [ProfileController::class, 'show2FASetup'])->name('profile.2fa.setup')->middleware('auth');
Route::post('/profile/2fa/enable', [ProfileController::class, 'enable2FA'])->name('profile.2fa.enable')->middleware('auth');
Route::get('/profile/2fa/verify', [ProfileController::class, 'show2FAVerify'])->name('profile.2fa.verify')->middleware('auth');
Route::post('/profile/2fa/verify', [ProfileController::class, 'verify2FA'])->name('profile.2fa.verify.post')->middleware('auth');
Route::get('/profile/2fa/disable', [ProfileController::class, 'show2FADisable'])->name('profile.2fa.disable')->middleware('auth');
Route::post('/profile/2fa/disable', [ProfileController::class, 'disable2FA'])->name('profile.2fa.disable.post')->middleware('auth');

// ── Dashboard (authenticated) ───────────────────────────────────────────
Route::prefix('/dashboard')->middleware(['auth', 'password.expiry'])->group(function () {
    Route::get('/', [DashboardController::class, 'index'])->name('dashboard.index');

    // Lab
    Route::get('/lab', [LabController::class, 'index'])->name('dashboard.lab');
    Route::post('/lab/checkout/new', [LabController::class, 'createAndEdit'])->name('dashboard.lab.checkout.create');
    Route::post('/lab/checkout/template', [LabController::class, 'createFromTemplate'])->name('dashboard.lab.checkout.template');
    Route::post('/lab/checkout/{id}/duplicate', [LabController::class, 'duplicate'])->name('dashboard.lab.checkout.duplicate');
    Route::delete('/lab/checkout/{id}', [LabController::class, 'destroy'])->name('dashboard.lab.checkout.destroy');
    Route::get('/lab/builder/{id}', [LabController::class, 'builder'])->name('dashboard.lab.builder');

    // Lab Builder API (JSON)
    Route::get('/lab/api/{id}', [LabController::class, 'apiShow'])->name('dashboard.lab.api.show');
    Route::put('/lab/api/{id}', [LabController::class, 'apiUpdate'])->name('dashboard.lab.api.update');
    Route::post('/lab/api/{id}/publish', [LabController::class, 'apiPublish'])->name('dashboard.lab.api.publish');

    // Lab Clone IA
    Route::post('/lab/clone', [CheckoutCloneController::class, 'clone'])->name('dashboard.lab.clone');
    Route::post('/lab/clone/fallback', [CheckoutCloneController::class, 'fallback'])->name('dashboard.lab.clone.fallback');

    // Tokenizer Tool
    Route::get('/tokenizer', [DashboardController::class, 'tokenizer'])->name('dashboard.tokenizer');
    Route::post('/tokenizer', [DashboardController::class, 'tokenize'])->name('dashboard.tokenizer.post');

    // Checkout Builder
    Route::get('/checkout-configs', [CheckoutConfigController::class, 'index'])->name('dashboard.checkout-configs');
    Route::get('/checkout-configs/create', [CheckoutConfigController::class, 'create'])->name('dashboard.checkout-configs.create');
    Route::get('/checkout-configs/{id}/edit', [CheckoutConfigController::class, 'edit'])->name('dashboard.checkout-configs.edit');
    Route::post('/checkout-configs/save', [CheckoutConfigController::class, 'save'])->name('dashboard.checkout-configs.save');
    Route::post('/checkout-configs/{id}/publish', [CheckoutConfigController::class, 'publish'])->name('dashboard.checkout-configs.publish');
    Route::get('/checkout-configs/{id}/preview', [CheckoutConfigController::class, 'preview'])->name('dashboard.checkout-configs.preview');

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
    Route::post('/gateways/{id}/test', [GatewayController::class, 'test'])->name('dashboard.gateways.test');

    // Companies (super admin)
    Route::resource('companies', CompanyController::class)->names('dashboard.companies');
    Route::post('/companies/{id}/toggle', [CompanyController::class, 'toggle'])->name('dashboard.companies.toggle');

    // Reports
    Route::get('/reports', [ReportController::class, 'index'])->name('dashboard.reports');
    Route::get('/reports/summary', [ReportController::class, 'summary'])->name('dashboard.reports.summary');
    Route::get('/reports/export', [ReportController::class, 'export'])->name('dashboard.reports.export');

    // Configurações do Sistema
    Route::get('/settings/receipt', [ReceiptController::class, 'index'])->name('dashboard.settings.receipt');
    Route::put('/settings/receipt', [ReceiptController::class, 'update'])->name('dashboard.settings.receipt.update');

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
