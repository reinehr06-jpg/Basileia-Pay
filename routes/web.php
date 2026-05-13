<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Public\HomeController;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
| Este arquivo contém apenas a rota principal e carrega os módulos
| de rotas separados. Cada domínio funcional tem seu próprio arquivo.
|
| Módulos:
|   routes/dashboard.php  — Auth, 2FA, Dashboard admin
|   routes/checkout.php   — Checkout público (PIX, Cartão, Boleto, Asaas)
|   routes/demo.php       — Rotas de demonstração e debug
|--------------------------------------------------------------------------
*/

// ── Home ────────────────────────────────────────────────────────────────
Route::get('/', [HomeController::class, 'index'])->middleware('secure.token');
