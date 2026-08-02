<?php

namespace App\Jobs;

use Illuminate\Support\Facades\Log;

use App\Models\PixSubscriptionCycle;
use App\Models\PixSubscriptionEvent;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Mail;
use App\Mail\SubscriptionReminderMail;

class SendSubscriptionReminderJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $queue = 'notifications';
    public $tries = 3;
    public $timeout = 15;
    public $backoff = [10, 60, 300, 1800, 3600];



    public function handle(): void
    {
        $cycles = PixSubscriptionCycle::where('status', 'scheduled')
            ->whereDate('due_date', today()->addDays(3))
            ->with(['subscription.customer'])
            ->get();

        foreach ($cycles as $cycle) {
            $customer = $cycle->subscription->customer;
            if (!$customer?->email) continue;

            Mail::to($customer->email)->send(new SubscriptionReminderMail(['cycle' => $cycle]));

            PixSubscriptionEvent::create([
                'subscription_id' => $cycle->subscription_id,
                'company_id'      => $cycle->subscription->company_id,
                'event_type'      => 'reminder.sent',
                'metadata'        => ['channel' => 'email', 'days_before' => 3],
                'occurred_at'     => now(),
            ]);
        }
    }

    public function failed(?\Throwable $exception): void
    {
        Log::error('Job failed permanently', [
            'job' => static::class,
            'error' => $exception?->getMessage(),
        ]);
    }
}