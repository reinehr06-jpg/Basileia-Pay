<?php

namespace App\Services;

use App\Models\SplitRule;
use App\Models\Transaction;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class SplitService
{
    public function calculateSplits(Transaction $transaction): array
    {
        $rules = SplitRule::where('company_id', $transaction->company_id)
            ->where('is_active', true)
            ->get();

        if ($rules->isEmpty()) {
            return [];
        }

        $splits = [];
        $totalAmount = $transaction->amount;
        $remainingAmount = $totalAmount;

        foreach ($rules as $rule) {
            $splitAmount = 0.0;

            if ($rule->percentage > 0) {
                $splitAmount = round($totalAmount * ($rule->percentage / 100), 2);
            }

            if ($rule->fixed_amount > 0) {
                $splitAmount += $rule->fixed_amount;
            }

            if ($splitAmount <= 0) {
                continue;
            }

            $splitAmount = min($splitAmount, $remainingAmount);
            $remainingAmount -= $splitAmount;

            $splits[] = [
                'wallet_id' => $rule->wallet_id,
                'recipient_name' => $rule->recipient_name,
                'percentage' => $rule->percentage,
                'fixed_amount' => $rule->fixed_amount,
                'amount' => $splitAmount,
                'description' => $rule->description ?? "Split for {$rule->recipient_name}",
            ];
        }

        if (empty($splits)) {
            return [];
        }

        if ($remainingAmount > 0) {
            $splits[0]['amount'] += $remainingAmount;
        }

        return $splits;
    }

    public function applySplits(array $gatewayData, array $splits): array
    {
        if (empty($splits)) {
            return $gatewayData;
        }

        $gatewayData['split'] = array_map(function ($split) {
            return [
                'walletId' => $split['wallet_id'],
                'fixedValue' => $split['amount'],
                'description' => $split['description'],
            ];
        }, $splits);

        return $gatewayData;
    }

    public function persistSplits(Transaction $transaction, array $splits): void
    {
        if (empty($splits)) {
            return;
        }

        DB::transaction(function () use ($transaction, $splits) {
            foreach ($splits as $split) {
                $transaction->splits()->create([
                    'company_id' => $transaction->company_id,
                    'wallet_id' => $split['wallet_id'],
                    'recipient_name' => $split['recipient_name'],
                    'amount' => $split['amount'],
                    'percentage' => $split['percentage'],
                    'fixed_amount' => $split['fixed_amount'],
                    'status' => 'pending',
                ]);
            }
        });
    }
}
