<?php

namespace App\Domain\Subscriptions\Services;

use App\Models\Company;
use App\Models\PixSubscription;
use App\Models\PixSubscriptionCycle;
use App\Models\PixSubscriptionEvent;
use App\Models\PixSubscriptionMandate;
use App\Models\User;
use Illuminate\Support\Str;
use Carbon\Carbon;

class PixSubscriptionService
{
    public function create(array $input, Company $company): PixSubscription
    {
        return PixSubscription::create([
            'uuid'               => Str::uuid(),
            'company_id'         => $company->id,
            'system_id'          => $input['system_id'],
            'gateway_account_id' => $input['gateway_account_id'],
            'customer_email'     => $input['customer']['email'],
            'customer_name'      => $input['customer']['name'],
            'customer_document'  => $input['customer']['document'] ?? null,
            'customer_phone'     => $input['customer']['phone'] ?? null,
            'plan_name'          => $input['plan']['name'],
            'amount'             => $input['amount'],
            'interval_type'      => $input['interval']['type'],
            'interval_count'     => $input['interval']['count'] ?? 1,
            'billing_day'        => $input['billing_day'] ?? null,
            'first_billing_at'   => $input['first_billing_at'] ?? now()->addDay(),
            'next_billing_at'    => $input['first_billing_at'] ?? now()->addDay(),
            'status'             => 'pending_mandate',
            'max_retries'        => $input['max_retries'] ?? 3,
        ]);
    }

    public function cancel(PixSubscription $subscription, string $reason, User $user): void
    {
        $subscription->update([
            'status'        => 'cancelled',
            'cancelled_at'  => now(),
            'cancel_reason' => $reason,
        ]);

        $this->recordEvent($subscription, 'cancelled', [
            'reason'  => $reason,
            'user_id' => $user->id,
        ]);
    }

    public function pause(PixSubscription $subscription, Carbon $until): void
    {
        $subscription->update([
            'status'      => 'paused',
            'pause_until' => $until,
        ]);

        $this->recordEvent($subscription, 'paused', ['until' => $until->toIso8601String()]);
    }

    public function resume(PixSubscription $subscription): void
    {
        $subscription->update([
            'status'      => 'active',
            'pause_until' => null,
        ]);

        $this->recordEvent($subscription, 'resumed');
    }

    private function recordEvent(PixSubscription $sub, string $type, array $payload = []): void
    {
        PixSubscriptionEvent::create([
            'subscription_id' => $sub->id,
            'company_id'      => $sub->company_id,
            'event_type'      => $type,
            'payload'         => $payload,
            'triggered_by'    => 'system',
            'occurred_at'     => now(),
        ]);
    }
}
