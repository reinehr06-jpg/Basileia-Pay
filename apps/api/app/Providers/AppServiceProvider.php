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
            if ($user->isSuperAdmin()) {
                return true;
            }
        });

        // Generic permission check gate
        Gate::define('permission', function (User $user, string $permission) {
            return RolePermissions::can($user, $permission);
        });

        // ── Rate Limiters ──────────────────────────────────────────────────
        
        // 1. Login (10 tentativas por email/IP em 10 minutos)
        \Illuminate\Support\Facades\RateLimiter::for('auth_login', function (\Illuminate\Http\Request $request) {
            $email = strtolower(trim((string) $request->input('email', '')));
            $key = $email ? hash('sha256', $email) . '|' . $request->ip() : $request->ip();
            return \Illuminate\Cache\RateLimiting\Limit::perMinutes(10, 10)->by($key);
        });

        // 2. Register (3 tentativas por IP/hora — anti-spam)
        \Illuminate\Support\Facades\RateLimiter::for('auth_register', function (\Illuminate\Http\Request $request) {
            return \Illuminate\Cache\RateLimiting\Limit::perHour(3)->by($request->ip());
        });

        // 3. Password Recovery (5 tentativas por email em 30 minutos)
        \Illuminate\Support\Facades\RateLimiter::for('auth_password', function (\Illuminate\Http\Request $request) {
            return \Illuminate\Cache\RateLimiting\Limit::perMinutes(30, 5)->by($request->input('email', $request->ip()));
        });

        // 4. 2FA Verify & Setup (5 tentativas em 10 minutos)
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
