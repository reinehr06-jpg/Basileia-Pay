<?php

declare(strict_types=1);

namespace App\Providers;

use App\Models\Payment;
use App\Models\Transaction;
use App\Models\User;
use App\Observers\PaymentObserver;
use App\Observers\TransactionObserver;
use App\Security\Authorization\RolePermissions;
use App\Security\Encryption\EncryptionService;
use App\Services\Audit\AuditService;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        // Singleton registrations — security services
        $this->app->singleton(EncryptionService::class, function () {
            return new EncryptionService();
        });

        $this->app->singleton(AuditService::class, function () {
            return new AuditService();
        });

        $this->app->singleton(\App\Services\Security\SensitiveDataMasker::class, function () {
            return new \App\Services\Security\SensitiveDataMasker();
        });
    }

    public function boot(): void
    {
        // Model observers
        Transaction::observe(TransactionObserver::class);
        Payment::observe(PaymentObserver::class);

        // ── Authorization Gates ──────────────────────────────────────────

        // Owner bypasses all permission checks
        Gate::before(function (User $user, string $ability) {
            if ($user->role === 'owner') {
                return true;
            }
        });

        // Generic permission check gate
        Gate::define('permission', function (User $user, string $permission) {
            return RolePermissions::can($user, $permission);
        });

        // ── Rate Limiters ──────────────────────────────────────────────────
        
        // 1. Login & Auth (5 tentativas por IP/E-mail em 10 minutos)
        \Illuminate\Support\Facades\RateLimiter::for('auth', function (\Illuminate\Http\Request $request) {
            return \Illuminate\Cache\RateLimiting\Limit::perMinutes(10, 5)->by($request->input('email', $request->ip()));
        });

        // 2. 2FA Verification (5 tentativas em 10 minutos)
        \Illuminate\Support\Facades\RateLimiter::for('2fa', function (\Illuminate\Http\Request $request) {
            return \Illuminate\Cache\RateLimiting\Limit::perMinutes(10, 5)->by($request->user()?->id ?: $request->ip());
        });

        // 3. Checkout Pay (Limite rígido: 10 tentativas por session_token em 10 minutos)
        \Illuminate\Support\Facades\RateLimiter::for('checkout_pay', function (\Illuminate\Http\Request $request) {
            $token = $request->route('sessionToken') ?: $request->ip();
            return \Illuminate\Cache\RateLimiting\Limit::perMinutes(10, 10)->by($token);
        });

        // 4. Checkout Status (Polling: 60 requests por minuto)
        \Illuminate\Support\Facades\RateLimiter::for('checkout_status', function (\Illuminate\Http\Request $request) {
            $token = $request->route('sessionToken') ?: $request->ip();
            return \Illuminate\Cache\RateLimiting\Limit::perMinute(60)->by($token);
        });

        // 5. API Externa (Por Company/Key: 120/min)
        \Illuminate\Support\Facades\RateLimiter::for('api_external', function (\Illuminate\Http\Request $request) {
            $key = $request->header('X-API-Key') ?: $request->ip();
            return \Illuminate\Cache\RateLimiting\Limit::perMinute(120)->by($key);
        });

        // 6. Webhooks Inbound (Por Provider/IP)
        \Illuminate\Support\Facades\RateLimiter::for('webhooks', function (\Illuminate\Http\Request $request) {
            return \Illuminate\Cache\RateLimiting\Limit::perMinute(300)->by($request->ip());
        });

        // 7. Dashboard API
        \Illuminate\Support\Facades\RateLimiter::for('dashboard', function (\Illuminate\Http\Request $request) {
            return \Illuminate\Cache\RateLimiting\Limit::perMinute(200)->by($request->user()?->id ?: $request->ip());
        });
    }
}
