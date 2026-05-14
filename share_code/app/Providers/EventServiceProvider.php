<?php

namespace App\Providers;

use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;

class EventServiceProvider extends ServiceProvider
{
    protected $listen = [
        \App\Events\PaymentApproved::class => [
            \App\Listeners\UpdateTransactionOnPaymentApproved::class,
            \App\Listeners\DispatchWebhookOnPaymentApproved::class,
            \App\Listeners\LogAuditOnPaymentStatusChange::class,
        ],
        \App\Events\PaymentRefused::class => [
            \App\Listeners\DispatchWebhookOnPaymentRefused::class,
            \App\Listeners\LogAuditOnPaymentStatusChange::class,
        ],
        \App\Events\PaymentOverdue::class => [
            \App\Listeners\DispatchWebhookOnPaymentOverdue::class,
            \App\Listeners\LogAuditOnPaymentStatusChange::class,
        ],
        \App\Events\PaymentRefunded::class => [
            \App\Listeners\DispatchWebhookOnPaymentRefunded::class,
            \App\Listeners\LogAuditOnPaymentStatusChange::class,
        ],
    ];

    public function boot(): void
    {
        parent::boot();
    }
}
