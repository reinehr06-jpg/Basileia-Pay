<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes — API-only mode
| Frontend migrado para Next.js em checkout.basileia.global
|--------------------------------------------------------------------------
*/

// Redirect raiz para o checkout Next.js
Route::get('/', function () {
    return redirect(config('app.frontend_url', 'https://checkout.basileia.global'));
});

// Rota de saúde para monitoramento
Route::get('/health', function () {
    return response()->json([
        'status'  => 'ok',
        'mode'    => 'api-only',
        'version' => config('app.version', '2.0'),
        'time'    => now()->toIso8601String(),
    ]);
});
