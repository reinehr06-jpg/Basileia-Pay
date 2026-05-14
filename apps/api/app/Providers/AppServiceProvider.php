<?php

declare(strict_types=1);

namespace App\Providers;

use App\Models\Payment;
use App\Models\Transaction;
use App\Observers\PaymentObserver;
use App\Observers\TransactionObserver;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        Transaction::observe(TransactionObserver::class);
        Payment::observe(PaymentObserver::class);
    }
}
