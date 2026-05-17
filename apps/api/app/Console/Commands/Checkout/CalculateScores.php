<?php

namespace App\Console\Commands\Checkout;

use Illuminate\Console\Command;
use App\Models\CheckoutScore;
use App\Models\PaymentAnalytics;
use App\Models\CheckoutSessionAnalytics;
use Illuminate\Support\Facades\DB;

class CalculateScores extends Command
{
    protected $signature = 'checkout:calculate-scores';
    protected $description = 'Recalcula o score de saúde e taxas de conversão dos checkouts';

    public function handle()
    {
        $this->info("Iniciando cálculo de scores...");

        $scores = CheckoutScore::all();

        foreach ($scores as $score) {
            // 1. Calcular Taxa de Conversão (Pagamentos Pagos / Sessões Abertas)
            $totalSessions = CheckoutSessionAnalytics::where('checkout_experience_id', $score->checkout_experience_id)
                ->where('event_type', 'session_opened')
                ->count();

            $totalPaid = PaymentAnalytics::whereHas('payment', function($q) use ($score) {
                    $q->where('checkout_experience_id', $score->checkout_experience_id)
                      ->whereIn('status', ['approved', 'paid']);
                })
                ->count();

            $conversionRate = $totalSessions > 0 ? ($totalPaid / $totalSessions) * 100 : 0;

            // 2. Calcular Taxa de Aprovação (Pagamentos Pagos / Tentativas Totais)
            $totalAttempts = PaymentAnalytics::whereHas('payment', function($q) use ($score) {
                    $q->where('checkout_experience_id', $score->checkout_experience_id);
                })
                ->count();

            $approvalRate = $totalAttempts > 0 ? ($totalPaid / $totalAttempts) * 100 : 0;

            // 3. Health Score (Lógica simplificada: média ponderada)
            $healthScore = ($conversionRate * 0.7) + ($approvalRate * 0.3);

            $score->update([
                'total_sessions' => $totalSessions,
                'total_success' => $totalPaid,
                'conversion_rate' => $conversionRate,
                'approval_rate' => $approvalRate,
                'health_score' => min(100, $healthScore),
            ]);
        }

        $this->info("Scores calculados com sucesso!");
    }
}
