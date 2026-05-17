<?php

namespace App\Services\Finance;

use App\Models\Payment;
use App\Models\PaymentSplit;
use App\Models\PaymentSplitRule;
use Illuminate\Support\Collection;

class SplitBuilder
{
    /**
     * Calcula as divisões de um pagamento baseado nas regras configuradas.
     */
    public function calculate(Payment $payment): Collection
    {
        $order = $payment->order;
        $totalAmount = $payment->amount;
        
        // Buscar regras (prioridade: Order -> System -> Company)
        $rules = PaymentSplitRule::where('company_id', $payment->company_id)
            ->where(function($query) use ($order) {
                $query->where(function($q) use ($order) {
                    $q->where('target_type', 'order')->where('target_id', $order->id);
                })->orWhere(function($q) use ($order) {
                    $q->where('target_type', 'system')->where('target_id', $order->connected_system_id);
                });
            })
            ->get();

        $splits = collect();
        $remainingAmount = $totalAmount;

        foreach ($rules as $rule) {
            $splitAmount = 0;

            if ($rule->fixed_amount) {
                $splitAmount = min($rule->fixed_amount, $remainingAmount);
            } elseif ($rule->percentage) {
                $splitAmount = (int) round($totalAmount * ($rule->percentage / 100));
            }

            if ($splitAmount > 0) {
                $splits->push([
                    'recipient_id' => $rule->recipient_id,
                    'amount' => $splitAmount,
                    'liable' => $rule->liable,
                    'charge_fee' => $rule->charge_processing_fee
                ]);
                $remainingAmount -= $splitAmount;
            }
        }

        // Se sobrou algo, vai para a conta principal (implícito ou regra padrão)
        return $splits;
    }

    /**
     * Registra as divisões no banco de dados.
     */
    public function persist(Payment $payment, Collection $calculatedSplits): void
    {
        foreach ($calculatedSplits as $splitData) {
            PaymentSplit::create([
                'payment_id' => $payment->id,
                'recipient_id' => $splitData['recipient_id'],
                'amount' => $splitData['amount'],
                'status' => 'pending',
            ]);
        }
    }
}
