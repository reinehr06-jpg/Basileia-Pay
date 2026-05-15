<?php

namespace App\Domain\Subscriptions\Services;

use App\Models\PixSubscription;
use App\Models\PixSubscriptionEvent;
use App\Models\PixSubscriptionCycle;
use App\Models\Company;
use Illuminate\Support\Str;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class PixSubscriptionService
{
    public function create(array $input, Company $company): PixSubscription
    {
        return DB::transaction(function () use ($input, $company) {
            $subscription = PixSubscription::create([
                'uuid'               => Str::uuid(),
                'company_id'         => $company->id,
                'system_id'          => $input['system_id'],
                'customer_id'        => $input['customer_id'],
                'gateway_account_id' => $input['gateway_account_id'],
                'name'               => $input['name'],
                'amount'             => $input['amount'],
                'interval_type'      => $input['interval_type'],
                'interval_count'     => $input['interval_count'] ?? 1,
                'billing_day'        => $input['billing_day'] ?? null,
                'status'             => 'pending_mandate',
                'starts_at'          => $input['starts_at'] ?? now(),
                'trial_days'         => $input['trial_days'] ?? 0,
            ]);

            // Evento
            PixSubscriptionEvent::create([
                'subscription_id' => $subscription->id,
                'company_id'      => $company->id,
                'event_type'      => 'subscription.created',
                'to_status'       => 'pending_mandate',
                'occurred_at'     => now(),
            ]);

            return $subscription;
        });
    }

    public function activate(PixSubscription $subscription): void
    {
        if ($subscription->status !== 'pending_mandate') {
            throw new \Exception('Assinatura não está aguardando mandato.');
        }

        $subscription->update([
            'status'          => 'active',
            'next_billing_at' => $this->calculateNextBilling($subscription),
        ]);

        $this->createNextCycle($subscription);

        PixSubscriptionEvent::create([
            'subscription_id' => $subscription->id,
            'company_id'      => $subscription->company_id,
            'event_type'      => 'subscription.activated',
            'from_status'     => 'pending_mandate',
            'to_status'       => 'active',
            'occurred_at'     => now(),
        ]);
    }

    public function createNextCycle(PixSubscription $subscription): PixSubscriptionCycle
    {
        $cycleNumber = $subscription->current_cycle + 1;
        
        $cycle = PixSubscriptionCycle::create([
            'uuid'            => Str::uuid(),
            'subscription_id' => $subscription->id,
            'company_id'      => $subscription->company_id,
            'cycle_number'    => $cycleNumber,
            'amount'          => $subscription->amount,
            'due_date'        => $subscription->next_billing_at ?? now(),
            'status'          => 'scheduled',
            'scheduled_at'    => now(),
        ]);

        $subscription->update(['current_cycle' => $cycleNumber]);

        return $cycle;
    }

    public function calculateNextBilling(PixSubscription $sub): Carbon
    {
        $base = match($sub->interval_type) {
            'daily'   => now()->addDays($sub->interval_count),
            'weekly'  => now()->addWeeks($sub->interval_count),
            'monthly' => $sub->billing_day
                ? now()->addMonths($sub->interval_count)->setDay($sub->billing_day)
                : now()->addMonths($sub->interval_count),
            'yearly'  => now()->addYears($sub->interval_count),
        };

        while ($base->isWeekend()) {
            $base->addDay();
        }

        return $base;
    }
}
