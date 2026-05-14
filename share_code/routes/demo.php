<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Artisan;
use App\Models\Company;
use App\Models\Customer;
use App\Models\Transaction;
use Illuminate\Support\Str;

/*
|--------------------------------------------------------------------------
| Demo & Debug Routes
|--------------------------------------------------------------------------
| Rotas de demonstração e depuração. Carregadas apenas em ambiente local.
|--------------------------------------------------------------------------
*/

if (!function_exists('crc16')) {
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
}

// ── Debug Routes ────────────────────────────────────────────────────────
Route::get('/clear-views', function () {
    Artisan::call('view:clear');
    Artisan::call('optimize:clear');

    $path = resource_path('views/dashboard/gateways/create.blade.php');
    $content = file_exists($path) ? 'FILE EXISTS: ' . substr(file_get_contents($path), 0, 500) : 'FILE NOT FOUND';
    $git = shell_exec('git log -n 1 --oneline 2>&1');

    return [
        'message' => 'Cache limpo!',
        'git_status' => $git,
        'path' => $path,
        'first_500_chars' => $content,
    ];
});

Route::get('/test-db', function () {
    try {
        \DB::connection()->getPdo();
        return "Conexão com o Banco de Dados: OK!";
    } catch (\Exception $e) {
        return "Erro de Conexão: " . $e->getMessage();
    }
});

// ── Demo: Criar transações de teste ─────────────────────────────────────
Route::get('/demo-criar/{metodo}', function ($metodo) {
    $company = Company::first();
    if (!$company) {
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

    $uuid = (string) Str::uuid();
    $asaasId = 'pay_demo_' . time();

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
        'description' => 'Plano Premium - Teste ' . strtoupper($metodo),
        'amount' => 97.00,
        'currency' => 'BRL',
        'status' => 'pending',
        'asaas_payment_id' => $asaasId,
        'payment_method' => $paymentMethod,
    ]);

    return redirect('/demo/' . $metodo . '/' . $uuid);
})->name('demo.criar');

// ── Demo: PIX ───────────────────────────────────────────────────────────
Route::get('/demo/pix/{uuid}', function ($uuid) {
    $resource = Transaction::where('uuid', $uuid)->firstOrFail();

    $amount = number_format($resource->amount, 2, '.', '');
    $txId = 'TX' . $resource->id . time();
    $merchantName = 'Basileia';
    $merchantCity = 'SAOPAULO';

    $payload = '000201'
        . '01021226' . str_pad($txId, 26, '0', STR_PAD_RIGHT)
        . '52040000'
        . '5303986'
        . '54' . str_pad($amount, 2, '0', STR_PAD_LEFT)
        . '5802BR'
        . '59' . str_pad($merchantName, 25, ' ', STR_PAD_RIGHT)
        . '60' . str_pad($merchantCity, 15, ' ', STR_PAD_RIGHT)
        . '62140510' . $txId
        . '6304';

    $crc = strtoupper(dechex(crc16($payload)));
    $payload .= str_pad($crc, 4, '0', STR_PAD_LEFT);

    $pixData = [
        'encodedImage' => '',
        'payload' => $payload,
    ];

    return view('checkout.pix.pagamento', [
        'transaction' => $resource,
        'pixData' => $pixData,
        'customerData' => [],
    ]);
})->name('demo.pix');

// ── Demo: Cartão ────────────────────────────────────────────────────────
Route::get('/demo/cartao/{uuid}', function ($uuid) {
    $resource = Transaction::where('uuid', $uuid)->firstOrFail();

    return view('checkout.card.pagamento', [
        'transaction' => $resource,
        'customerData' => [
            'name' => $resource->customer_name ?? '',
            'email' => $resource->customer_email ?? '',
            'document' => $resource->customer_document ?? '',
        ],
        'plano' => $resource->description,
        'ciclo' => 'mensal',
    ]);
})->name('demo.cartao');

// ── Demo: Boleto ────────────────────────────────────────────────────────
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

    return view('checkout.boleto.pagamento', [
        'transaction' => $resource,
        'asaasData' => $asaasData,
        'pixData' => $pixData,
        'customerData' => [],
        'plano' => $resource->description,
        'ciclo' => 'mensal',
    ]);
})->name('demo.boleto');

// ── Demo: Checkout multi-tipo ───────────────────────────────────────────
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
        'basileia' => 'checkout.asaas',
        'pix' => 'checkout.pix.front.pagamento',
        'boleto' => 'checkout.boleto.front.pagamento',
        default => 'checkout.index',
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
