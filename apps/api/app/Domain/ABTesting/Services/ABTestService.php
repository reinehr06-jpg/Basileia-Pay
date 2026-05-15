<?php

namespace App\Domain\ABTesting\Services;

use App\Models\AbTest;
use App\Models\AbTestVariant;
use App\Models\CheckoutSession;
use App\Models\Payment;
use Illuminate\Support\Facades\Notification;

class ABTestService
{
    public function assignVariant(CheckoutSession $session, AbTest $test): string
    {
        $hash   = crc32($session->uuid) % 100;
        $variant = $hash < $test->traffic_split ? 'treatment' : 'control';

        $session->update(['ab_test_variant' => $variant]);

        return $variant;
    }

    public function recordConversion(CheckoutSession $session, Payment $payment): void
    {
        $test = AbTest::where('checkout_experience_id', $session->checkout_experience_id)
            ->where('status', 'running')
            ->first();

        if (!$test || !$session->ab_test_variant) return;

        $variant = AbTestVariant::where('ab_test_id', $test->id)
            ->where('variant', $session->ab_test_variant)
            ->first();

        if (!$variant) return;

        $variant->increment('conversions_count');
        $variant->increment('revenue_total', $payment->amount);

        if ($variant->sessions_count > 0) {
            $variant->update([
                'conversion_rate' => round(($variant->conversions_count / $variant->sessions_count) * 100, 2)
            ]);
        }
    }
}
