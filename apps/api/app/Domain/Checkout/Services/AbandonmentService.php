<?php

namespace App\Domain\Checkout\Services;

use App\Models\CheckoutSession;
use App\Models\CheckoutEvent;
use App\Jobs\SendRecoveryEmailJob;

class AbandonmentService
{
    public function register(CheckoutSession $session, string $ip, ?string $deviceType): void
    {
        if ($session->status !== 'open') return;

        $session->update(['abandoned_at' => now()]);

        CheckoutEvent::create([
            'checkout_session_id' => $session->id,
            'company_id'          => $session->company_id,
            'event_type'          => 'abandoned',
            'ip_hash'             => hash('sha256', $ip . config('security.ip_salt')),
            'device_type'         => $deviceType,
            'occurred_at'         => now(),
        ]);

        if ($session->customer && $session->customer->email) {
            // Determine delay based on payment method chosen or standard
            $delayMinutes = 30; 
            
            // If they generated a PIX but didn't pay it, delay is shorter
            if ($session->payments()->where('method', 'pix')->exists()) {
                $delayMinutes = 15;
            }

            SendRecoveryEmailJob::dispatch($session->id)
                ->delay(now()->addMinutes($delayMinutes));
        }
    }
}
