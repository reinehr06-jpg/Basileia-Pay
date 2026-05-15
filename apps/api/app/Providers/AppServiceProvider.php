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
        \Illuminate\Support\Facades\RateLimiter::for('login', function (\Illuminate\Http\Request $request) {
            return \Illuminate\Cache\RateLimiting\Limit::perMinute(5)->by($request->ip());
        });

        \Illuminate\Support\Facades\RateLimiter::for('api', function (\Illuminate\Http\Request $request) {
            $companyId = optional($request->user())->company_id ?? $request->ip();
            return \Illuminate\Cache\RateLimiting\Limit::perMinute(120)->by($companyId);
        });

        \Illuminate\Support\Facades\RateLimiter::for('master_login', function (\Illuminate\Http\Request $request) {
            return \Illuminate\Cache\RateLimiting\Limit::perMinute(3)->by($request->ip());
        });

        \Illuminate\Support\Facades\RateLimiter::for('checkout', function (\Illuminate\Http\Request $request) {
            return \Illuminate\Cache\RateLimiting\Limit::perMinute(60)->by($request->ip());
        });
    }
}
