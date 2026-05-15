<?php

namespace App\Domain\Recovery\Services;

use App\Models\CheckoutSession;
use App\Models\RecoveryCampaign;
use App\Models\RecoveryAttempt;
use Illuminate\Support\Str;

class RecoveryService
{
    public function initiate(CheckoutSession $session, string $trigger): void
    {
        $campaign = RecoveryCampaign::where('system_id', $session->system_id)
            ->where('trigger_event', $trigger)
            ->where('status', 'active')
            ->first();

        if (!$campaign || !$session->customer_email) return;

        $existing = RecoveryAttempt::where('checkout_session_id', $session->id)
            ->where('status', '!=', 'expired')
            ->count();

        if ($existing >= $campaign->max_recovery_attempts) return;

        $relinkToken = Str::random(48);
        $discount = $this->calculateDiscount($campaign, $session);

        $attempt = RecoveryAttempt::create([
            'uuid'                => Str::uuid(),
            'company_id'          => $session->company_id,
            'system_id'           => $session->system_id,
            'campaign_id'         => $campaign->id,
            'checkout_session_id' => $session->id,
            'customer_email'      => $session->customer_email,
            'status'              => 'pending',
            'channel'             => $campaign->channel_email ? 'email' : 'whatsapp',
            'relink_token'        => $relinkToken,
            'relink_url'          => url("/pay/{$session->session_token}?recover={$relinkToken}"),
            'relink_expires_at'   => now()->addHours($campaign->relink_expires_hours),
            'discount_applied'    => $discount,
        ]);

        // Logic for dispatching job would go here
    }

    private function calculateDiscount(RecoveryCampaign $campaign, CheckoutSession $session): ?int
    {
        return match($campaign->discount_type) {
            'fixed'   => $campaign->discount_value,
            'percent' => intval($session->amount * ($campaign->discount_value / 10000)),
            default   => null,
        };
    }
}
