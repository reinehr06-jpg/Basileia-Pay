<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return redirect(config('app.frontend_url', env('FRONTEND_URL', 'http://localhost:3000')));
});

// /health behind IP allowlist if enabled; no sensitive info leaked
Route::get('/health', function () {
    return response()->json([
        'status'  => 'ok',
        'time'    => now()->toIso8601String(),
    ]);
})->middleware('ip.allowlist');

Route::get('/login', function () {
    return response()->json([
        'message' => 'Please access the dashboard at the frontend URL.',
        'frontend_url' => config('app.frontend_url', env('FRONTEND_URL', 'http://localhost:3000')),
    ]);
});

// ── Prometheus-style metrics ──
Route::get('/metrics', function (\Illuminate\Http\Request $request) {
    if (config('app.env') === 'production') {
        $token = $request->bearerToken();
        if ($token !== env('METRICS_TOKEN')) {
            abort(401, 'Unauthorized');
        }
    }
    
    $startTime = $_SERVER['REQUEST_TIME_FLOAT'] ?? microtime(true);
    $uptime = microtime(true) - $startTime;

    $metrics = [
        '# HELP basileia_up 1 if API is accepting requests',
        '# TYPE basileia_up gauge',
        'basileia_up 1',
        '',
        '# HELP basileia_uptime_seconds API uptime in seconds',
        '# TYPE basileia_uptime_seconds gauge',
        "basileia_uptime_seconds {$uptime}",
        '',
        '# HELP basileia_build_info Build metadata',
        '# TYPE basileia_build_info gauge',
        'basileia_build_info{version="' . config('app.version', '2.0') . '",env="' . app()->environment() . '"} 1',
        '',
        '# HELP basileia_users_total Total registered users',
        '# TYPE basileia_users_total gauge',
        'basileia_users_total ' . \App\Models\User::count(),
        '',
        '# HELP basileia_companies_total Total active companies',
        '# TYPE basileia_companies_total gauge',
        'basileia_companies_total ' . \App\Models\Company::count(),
        '',
        '# HELP basileia_payments_total Total payments processed',
        '# TYPE basileia_payments_total gauge',
        'basileia_payments_total ' . \App\Models\Payment::count(),
    ];

    return response(implode("\n", $metrics) . "\n", 200, [
        'Content-Type' => 'text/plain; version=0.0.4',
    ]);
})->middleware('ip.allowlist');

