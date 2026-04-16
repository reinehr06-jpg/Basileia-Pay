<?php

use Illuminate\Support\Facades\Route;

function crc16(string $data): int
{
    $crc = 0xFFFF;
    for ($i = 0; $i < strlen($data); $i++) {
        $crc ^= ord($data[$i]);
        for ($j = 0; $j < 8; $j++) {
            if (($crc & 0x0001) !== 0) {
                $crc = ($crc >> 1) ^ 0x1021;
            } else {
                $crc = $crc >> 1;
            }
        }
    }

    return $crc;
}

use App\Http\Controllers\AsaasCheckoutController;
use App\Http\Controllers\CheckoutController;
use App\Http\Controllers\Dashboard\AuthController;
use App\Http\Controllers\Dashboard\CheckoutConfigController;
use App\Http\Controllers\Dashboard\CompanyController;
use App\Http\Controllers\Dashboard\DashboardController;
use App\Http\Controllers\Dashboard\EventController;
use App\Http\Controllers\Dashboard\GatewayController;
use App\Http\Controllers\Dashboard\IntegrationController;
use App\Http\Controllers\Dashboard\PasswordController;
use App\Http\Controllers\Dashboard\ProfileController;
use App\Http\Controllers\Dashboard\ReceiptController;
use App\Http\Controllers\Dashboard\ReportController;
use App\Http\Controllers\Dashboard\SourceConfigController;
use App\Http\Controllers\Dashboard\TransactionDashboardController;
use App\Http\Controllers\Dashboard\WebhookLogController;
use App\Http\Controllers\Public\EventCheckoutController;
use App\Http\Controllers\Public\HomeController;
use App\Models\Company;
use App\Models\Customer;
use App\Models\Transaction;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Str;

Route::get('/', [HomeController::class, 'index']);

Route::get('/checkout/asaas/{asaasPaymentId}', [AsaasCheckoutController::class, 'show'])->name('checkout.asaas.show');
Route::post('/checkout/asaas/process/{asaasPaymentId}', [AsaasCheckoutController::class, 'process'])->name('checkout.asaas.process');
Route::get('/checkout/asaas/success/{uuid}', [AsaasCheckoutController::class, 'success'])->name('checkout.asaas.success');

// Public event checkout pages
Route::get('/evento/{slug}', [EventCheckoutController::class, 'show'])->name('evento.show');
Route::post('/evento/{slug}/pay', [EventCheckoutController::class, 'process'])->name('evento.process');
Route::get('/evento/{slug}/success', [EventCheckoutController::class, 'success'])->name('evento.success');

// Auth
Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
Route::post('/login', [AuthController::class, 'login'])->name('login.post');
Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

// Password
Route::get('/password/change', [PasswordController::class, 'showChangeForm'])->name('password.change')->middleware('auth');
Route::post('/password/change', [PasswordController::class, 'changePassword'])->middleware('auth');

// 2FA
Route::get('/profile/2fa/setup', [ProfileController::class, 'show2FASetup'])->name('profile.2fa.setup')->middleware('auth');
Route::post('/profile/2fa/enable', [ProfileController::class, 'enable2FA'])->name('profile.2fa.enable')->middleware('auth');
Route::get('/profile/2fa/verify', [ProfileController::class, 'show2FAVerify'])->name('profile.2fa.verify')->middleware('auth');
Route::post('/profile/2fa/verify', [ProfileController::class, 'verify2FA'])->name('profile.2fa.verify.post')->middleware('auth');
Route::get('/profile/2fa/disable', [ProfileController::class, 'show2FADisable'])->name('profile.2fa.disable')->middleware('auth');
Route::post('/profile/2fa/disable', [ProfileController::class, 'disable2FA'])->name('profile.2fa.disable.post')->middleware('auth');

// Dashboard (authenticated)
Route::prefix('/dashboard')->middleware(['auth', 'password.expiry', 'enforce.2fa', '2fa'])->group(function () {
    Route::get('/', [DashboardController::class, 'index'])->name('dashboard.index');

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

// --- CATCH-ALL CHECKOUT ROUTES (KEEP AT BOTTOM) ---

// Minimalist Checkout Links (secure.basileia.global/{uuid})
Route::get('/{uuid}', [CheckoutController::class, 'show'])
    ->where('uuid', '[a-zA-Z0-9-]+')
    ->name('checkout.pay');

Route::prefix('pay')->group(function () {
    Route::post('/{uuid}/process', [CheckoutController::class, 'process'])->name('checkout.process');
    Route::get('/{uuid}/success', [CheckoutController::class, 'success'])->name('checkout.success');
    Route::get('/{uuid}/receipt', [CheckoutController::class, 'receipt'])->name('checkout.receipt');
});

// Suporte para links antigos de /checkout e /pay
Route::get('/checkout/{uuid}', fn ($uuid) => redirect()->route('checkout.pay', $uuid));
Route::get('/pay/{uuid}', fn ($uuid) => redirect()->route('checkout.pay', $uuid));

Route::get('/clear-views', function () {
    Artisan::call('view:clear');
    Artisan::call('optimize:clear');

    $path = resource_path('views/dashboard/gateways/create.blade.php');
    $content = file_exists($path) ? 'FILE EXISTS: '.substr(file_get_contents($path), 0, 500) : 'FILE NOT FOUND';
    $git = shell_exec('git log -n 1 --oneline 2>&1');

    return [
        'message' => 'Cache limpo!',
        'git_status' => $git,
        'path' => $path,
        'first_500_chars' => $content,
    ];
});

// --- ROTAS DE DEMONSTRAÇÃO (TEMPORÁRIAS) ---

// Criar transação de teste automaticamente
Route::get('/demo-criar/{metodo}', function ($metodo) {
    $company = Company::first();
    if (! $company) {
        return response('Empresa não encontrada', 404);
    }

    $customer = Customer::firstOrCreate(
        ['email' => 'teste@demo.com'],
        [
            'name' => 'Cliente Teste Demo',
            'company_id' => $company->id,
            'phone' => '11999999999',
        ]
    );

    $uuid = 'demo-'.$metodo.'-'.Str::uuid();
    $asaasId = 'pay_demo_'.time();

    $metodoMap = [
        'pix' => 'pix',
        'cartao' => 'credit_card',
        'boleto' => 'boleto',
    ];
    $paymentMethod = $metodoMap[$metodo] ?? 'credit_card';

    $metodoMap = [
        'pix' => 'pix',
        'cartao' => 'credit_card',
        'boleto' => 'boleto',
    ];
    $paymentMethod = $metodoMap[$metodo] ?? 'credit_card';

    $tx = Transaction::create([
        'uuid' => $uuid,
        'company_id' => $company->id,
        'customer_id' => $customer->id,
        'description' => 'Plano Premium - Teste '.strtoupper($metodo),
        'amount' => 97.00,
        'currency' => 'BRL',
        'status' => 'pending',
        'asaas_payment_id' => $asaasId,
        'payment_method' => $paymentMethod,
    ]);

    return redirect('/demo/'.$metodo.'/'.$uuid);
})->name('demo.criar');

Route::get('/demo/pix/{uuid}', function ($uuid) {
    $resource = Transaction::where('uuid', $uuid)->firstOrFail();

    $amount = number_format($resource->amount, 2, '.', '');
    $txId = 'TX'.$resource->id.time();
    $merchantName = 'Basileia';
    $merchantCity = 'SAOPAULO';

    $payload = '000201'
        .'01021226'.str_pad($txId, 26, '0', STR_PAD_RIGHT)
        .'52040000'
        .'5303986'
        .'54'.str_pad($amount, 2, '0', STR_PAD_LEFT)
        .'5802BR'
        .'59'.str_pad($merchantName, 25, ' ', STR_PAD_RIGHT)
        .'60'.str_pad($merchantCity, 15, ' ', STR_PAD_RIGHT)
        .'62140510'.$txId
        .'6304';

    $crc = strtoupper(dechex(crc16($payload)));
    $payload .= str_pad($crc, 4, '0', STR_PAD_LEFT);

    $pixData = [
        'encodedImage' => '',
        'payload' => $payload,
    ];

    return view('checkout.index-pix', [
        'transaction' => $resource,
        'pixData' => $pixData,
    ]);
})->name('demo.pix');

Route::get('/demo/cartao/{uuid}', function ($uuid) {
    $resource = Transaction::where('uuid', $uuid)->firstOrFail();

    return view('checkout.index-card', [
        'transaction' => $resource,
        'billingType' => 'CREDIT_CARD',
    ]);
})->name('demo.cartao');

Route::get('/demo/boleto/{uuid}', function ($uuid) {
    $resource = Transaction::where('uuid', $uuid)->firstOrFail();

    $asaasData = [
        'billingType' => 'BOLETO',
        'value' => $resource->amount,
        'description' => $resource->description,
        'boletoUrl' => 'https://www.asaas.com/boleto/test',
        'installmentCount' => 1,
    ];
    $pixData = [];

    return view('checkout.pay', [
        'transaction' => $resource,
        'asaasData' => $asaasData,
        'pixData' => $pixData,
        'isSubscription' => false,
    ]);
})->name('demo.boleto');

// Rota original de demonstração
Route::get('/demo-checkout/{type}/{uuid}', function ($type, $uuid) {
    $resource = Transaction::where('uuid', $uuid)->firstOrFail();
    $asaasData = [
        'billingType' => 'CREDIT_CARD',
        'value' => $resource->amount,
        'installmentCount' => 12,
        'description' => $resource->description,
    ];
    $customerData = [
        'name' => $resource->customer->name,
        'email' => $resource->customer->email,
        'phone' => $resource->customer->phone,
        'address' => [
            'endereco' => 'Av. Paulista',
            'numero' => '1000',
            'bairro' => 'Bela Vista',
            'cidade' => 'São Paulo',
            'estado' => 'SP',
            'cep' => '01310-100',
        ],
    ];

    $view = match ($type) {
        'premium' => 'checkout.index',
        'basileia' => 'checkout.basileia',
        default => 'checkout.pay',
    };

    return view($view, [
        'transaction' => $resource,
        'asaasData' => $asaasData,
        'customerData' => $customerData,
        'pixData' => [],
        'plano' => 'Plano Mensal',
        'ciclo' => 'mensal',
        'features' => [
            ['t' => 'Pagamento Seguro', 'd' => 'Dados protegidos com criptografia SSL.'],
            ['t' => 'Processamento Instantâneo', 'd' => 'Confirmação rápida para liberação.'],
            ['t' => 'Suporte ao Cliente', 'd' => 'Assistência dedicada 24h.'],
        ],
    ]);
});

Route::post('/demo-checkout/basileia/process/{id}', [CheckoutController::class, 'process'])->name('basileia.checkout.process');
