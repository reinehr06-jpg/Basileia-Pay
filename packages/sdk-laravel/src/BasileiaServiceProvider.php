<?php

namespace Basileia\Laravel;

use Illuminate\Support\ServiceProvider;
use Basileia\BasileiaClient;

class BasileiaServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->singleton(BasileiaClient::class, function () {
            return new BasileiaClient([
                'api_key'     => config('basileia.api_key'),
                'environment' => config('basileia.environment', 'sandbox'),
                'base_url'    => config('basileia.base_url'),
            ]);
        });

        $this->app->alias(BasileiaClient::class, 'basileia');
    }

    public function boot(): void
    {
        if ($this->app->runningInConsole()) {
            $this->publishes([
                __DIR__ . '/../config/basileia.php' => config_path('basileia.php'),
            ], 'basileia-config');
        }
    }
}
