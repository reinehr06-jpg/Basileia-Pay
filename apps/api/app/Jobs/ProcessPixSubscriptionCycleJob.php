<?php

namespace App\Jobs;

use App\Models\PixSubscriptionCycle;
use App\Models\Payment;
use App\Domain\Subscriptions\Services\PixSubscriptionService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ProcessPixSubscriptionCycleJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $queue = 'payments';
    public $tries = 1;

    public function __construct(protected $cycleId) {}

    public function handle(PixSubscriptionService $subscriptionService): void
    {
        $cycle = PixSubscriptionCycle::findOrFail($this->cycleId);
        $subscription = $cycle->subscription;

        if ($cycle->status !== 'scheduled') return;
        if ($subscription->status !== 'active') {
            $cycle->update(['status' => 'skipped']);
            return;
        }

        DB::transaction(function () use ($cycle, $subscription, $subscriptionService) {
            $cycle->update(['status' => 'processing', 'processed_at' => now()]);

            $payment = Payment::create([
                'uuid'               => \Illuminate\Support\Str::uuid(),
                'company_id'         => $subscription->company_id,
                'system_id'          => $subscription->system_id,
                'gateway_account_id' => $subscription->gateway_account_id,
                'method'             => 'pix',
                'status'             => 'pending',
                'amount'             => $cycle->amount,
                'currency'           => $cycle->currency,
                'idempotency_key'    => "sub_{$subscription->uuid}_cycle_{$cycle->cycle_number}",
                'customer_id'        => $subscription->customer_id,
            ]);

            $cycle->update(['payment_id' => $payment->id]);

            // Simulation of charging via Asaas Mandate
            try {
                // In a real scenario: $asaas->chargeViaMandate(...)
                
                $cycle->update(['status' => 'paid', 'paid_at' => now()]);
                $subscription->increment('total_paid', $cycle->amount);

                $subscriptionService->createNextCycle($subscription);

            } catch (\Exception $e) {
                $cycle->update([
                    'status'         => 'failed',
                    'failed_at'      => now(),
                    'retry_count'    => $cycle->retry_count + 1,
                    'next_retry_at'  => $this->calculateRetry($cycle->retry_count + 1),
                ]);
                $subscription->increment('total_failed');

                if ($subscription->total_failed >= 3) {
                    $subscription->update(['status' => 'cancelled', 'cancel_reason' => 'max_failures_reached', 'cancelled_at' => now()]);
                }
            }
        });
    }

    private function calculateRetry(int $attempt): Carbon
    {
        return match($attempt) {
            1 => now()->addDay(),
            2 => now()->addDays(3),
            default => now()->addDays(7),
        };
    }
}
