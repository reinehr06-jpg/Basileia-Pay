<?php

namespace App\Services;

use App\Models\Subscription;
use App\Models\Payment;
use App\Models\Transaction;
use App\Services\Gateway\GatewayResolver;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class SubscriptionService
{
    protected AsaasPaymentService $gateway;

    public function __construct(AsaasPaymentService $gateway)
    {
        $this->gateway = $gateway;
    }

    /**
     * Resolve the appropriate gateway instance for the subscription's company.
     */
    protected function resolveGateway(): \App\Services\Gateway\PaymentGatewayInterface
    {
        return GatewayResolver::resolveGateway('asaas');
    }

    /**
     * Process all subscriptions due today.
     */
    public function processDailyBilling(): void
    {
        $subs = Subscription::where('status', 'active')
            ->where('next_billing_date', '<=', now()->toDateString())
            ->get();

        foreach ($subs as $sub) {
            $this->processSubscriptionCharge($sub);
        }
    }

    /**
     * Process a single subscription charge.
     */
    public function processSubscriptionCharge(Subscription $sub): void
    {
        try {
            // 1. Get the last successful payment to reuse the card token
            $lastPayment = Payment::where('subscription_id', $sub->id)
                ->where('status', 'approved')
                ->whereNotNull('gateway_token')
                ->latest()
                ->first();

            if (!$lastPayment) {
                $this->handleFailure($sub, 'Card token not found');
                return;
            }

            // 2. Create a new transaction/payment for the renewal
            $transaction = $sub->company->transactions()->create([
                'customer_id' => $sub->customer_id,
                'gateway_id' => $sub->gateway_id,
                'amount' => $sub->amount,
                'currency' => $sub->currency,
                'status' => 'pending',
                'description' => "Renovação - {$sub->plan_name}",
            ]);

            // 3. Attempt charge with token
            $response = $this->gateway->processCardTokenPayment(
                $transaction->gateway_transaction_id ?? $transaction->uuid,
                $lastPayment->gateway_token
            );

            if ($response['status'] === 'CONFIRMED' || $response['status'] === 'RECEIVED') {
                $this->handleSuccess($sub, $transaction);
            } else {
                $this->handleFailure($sub, $response['lastError'] ?? 'Payment declined');
            }

        } catch (\Exception $e) {
            $this->handleFailure($sub, $e->getMessage());
        }
    }

    protected function handleSuccess(Subscription $sub, Transaction $transaction): void
    {
        $sub->update([
            'status' => 'active',
            'retry_count' => 0,
            'current_period_start' => now(),
            'current_period_end' => $this->calculateNextDate($sub, now()),
            'next_billing_date' => $this->calculateNextDate($sub, now()),
        ]);

        Log::info("Subscription renewed successfully", ['sub_uuid' => $sub->uuid]);

        // Placeholder for webhook notification or email
        // $this->notifyCustomer($sub, 'success');
    }

    protected function handleFailure(Subscription $sub, string $reason): void
    {
        $sub->retry_count++;

        if ($sub->retry_count >= 4) {
            $sub->status = 'past_due';
            $sub->save();
            Log::warning("Subscription moved to past_due after multiple failures", ['sub_uuid' => $sub->uuid, 'reason' => $reason]);
        } else {
            // Smart Retry Logic: D1, D3, D7
            $daysToAdd = match ($sub->retry_count) {
                1 => 1,
                2 => 3,
                3 => 7,
                default => 0
            };

            $sub->next_billing_date = now()->addDays($daysToAdd);
            $sub->save();

            Log::info("Subscription charge failed. Scheduled retry.", [
                'sub_uuid' => $sub->uuid,
                'retry_count' => $sub->retry_count,
                'next_attempt' => $sub->next_billing_date,
                'reason' => $reason
            ]);
        }

        // Placeholder for notification
        // $this->notifyCustomer($sub, 'failure');
    }

    protected function calculateNextDate(Subscription $sub, Carbon $baseDate): Carbon
    {
        return $sub->billing_cycle === 'anual'
            ? $baseDate->copy()->addYear()
            : $baseDate->copy()->addMonth();
    }
}
