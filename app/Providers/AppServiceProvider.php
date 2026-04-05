<?php

namespace App\Providers;

use Illuminate\Support\Facades\URL;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Force HTTPS in production to avoid browser "Not Secure" warnings
        if (config('app.env') === 'production' || !app()->isLocal()) {
            URL::forceScheme('https');
        }

        // Trust all proxies for environments like Easypanel / Docker / Nginx
        \Illuminate\Support\Facades\Request::setTrustedProxies(
            ['0.0.0.0/0', '::/0'], 
            \Illuminate\Http\Request::HEADER_X_FORWARDED_FOR | 
            \Illuminate\Http\Request::HEADER_X_FORWARDED_HOST | 
            \Illuminate\Http\Request::HEADER_X_FORWARDED_PORT | 
            \Illuminate\Http\Request::HEADER_X_FORWARDED_PROTO | 
            \Illuminate\Http\Request::HEADER_X_FORWARDED_AWS_ELB
        );
    }
}
