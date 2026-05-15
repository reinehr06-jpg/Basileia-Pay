<?php

namespace App\Jobs;

use App\Models\PixSubscriptionCycle;
use App\Models\PixSubscriptionEvent;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Mail;

class SendSubscriptionReminderJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $queue = 'notifications';

    public function handle(): void
    {
        $cycles = PixSubscriptionCycle::where('status', 'scheduled')
            ->whereDate('due_date', today()->addDays(3))
            ->with(['subscription.customer'])
            ->get();

        foreach ($cycles as $cycle) {
            $customer = $cycle->subscription->customer;
            if (!$customer?->email) continue;

            // In a real scenario: Mail::to($customer->email)->send(new SubscriptionBillingReminderMail($cycle));

            PixSubscriptionEvent::create([
                'subscription_id' => $cycle->subscription_id,
                'company_id'      => $cycle->subscription->company_id,
                'event_type'      => 'reminder.sent',
                'metadata'        => ['channel' => 'email', 'days_before' => 3],
                'occurred_at'     => now(),
            ]);
        }
    }
}
