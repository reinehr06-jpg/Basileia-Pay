<?php

namespace App\Domain\Split\Services;

use App\Models\Payment;
use App\Models\SplitExecution;
use App\Models\SplitExecutionTransfer;
use App\Models\SplitRule;
use Illuminate\Support\Str;

class SplitService
{
    public function execute(Payment $payment): ?SplitExecution
    {
        $rule = $this->resolveRule($payment);
        if (!$rule) return null;

        $recipients   = $rule->recipients()->orderBy('order')->get();
        $totalAmount  = $payment->amount;
        $distributed  = 0;
        $platformFee  = 0;
        $transfers    = [];

        foreach ($recipients as $recipient) {
            $amount = match($recipient->split_type) {
                'percent' => intval($totalAmount * ($recipient->split_value / 10000)),
                'fixed'   => $recipient->split_value,
            };

            $distributed += $amount;
            if ($recipient->is_platform_fee) $platformFee += $amount;

            $transfers[] = [
                'recipient_id'       => $recipient->id,
                'gateway_account_id' => $recipient->gateway_account_id,
                'amount'              => $amount,
            ];
        }

        $rounding = $totalAmount - $distributed;
        if ($rounding !== 0 && !empty($transfers)) $transfers[0]['amount'] += $rounding;

        $execution = SplitExecution::create([
            'uuid'           => Str::uuid(),
            'payment_id'     => $payment->id,
            'split_rule_id'  => $rule->id,
            'company_id'     => $payment->company_id,
            'status'         => 'processing',
            'total_amount'   => $totalAmount,
            'platform_fee'   => $platformFee,
        ]);

        foreach ($transfers as $t) {
            SplitExecutionTransfer::create([
                'split_execution_id'  => $execution->id,
                'recipient_id'        => $t['recipient_id'],
                'gateway_account_id'  => $t['gateway_account_id'],
                'amount'              => $t['amount'],
                'status'              => 'pending',
            ]);
        }

        return $execution;
    }

    private function resolveRule(Payment $payment): ?SplitRule
    {
        return SplitRule::where('company_id', $payment->company_id)
            ->where('status', 'active')
            ->orderByDesc('id')
            ->first();
    }
}
