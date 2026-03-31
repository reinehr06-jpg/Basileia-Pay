<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Events\PaymentApproved;
use App\Events\PaymentRefused;
use App\Events\PaymentOverdue;
use App\Events\PaymentRefunded;
use App\Listeners\DispatchWebhookOnPaymentApproved;
use App\Listeners\DispatchWebhookOnPaymentRefused;
use App\Listeners\DispatchWebhookOnPaymentOverdue;
use App\Listeners\DispatchWebhookOnPaymentRefunded;
use App\Listeners\LogAuditOnPaymentStatusChange;
use App\Listeners\UpdateTransactionOnPaymentApproved;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        //
    }
}
