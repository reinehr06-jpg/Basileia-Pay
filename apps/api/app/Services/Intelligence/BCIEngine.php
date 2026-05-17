<?php

namespace App\Services\Intelligence;

use App\Models\CheckoutScore;
use App\Models\PaymentAnalytics;
use Illuminate\Support\Facades\DB;

class BCIEngine
{
    /**
     * Avalia o desempenho de uma experiência de checkout e retorna recomendações.
     */
    public function evaluate(int $experienceId): array
    {
        $score = CheckoutScore::where('checkout_experience_id', $experienceId)
            ->orderBy('calculated_at', 'desc')
            ->first();

        if (!$score) {
            return [
                'status' => 'pending',
                'message' => 'Aguardando dados suficientes para análise.',
                'recommendations' => []
            ];
        }

        $recommendations = [];

        // 1. Analisar Taxa de Conversão
        if ($score->conversion_rate < 0.05) { // < 5%
            $recommendations[] = [
                'type' => 'conversion',
                'priority' => 'high',
                'message' => 'Taxa de conversão abaixo da média (5%). Considere simplificar os campos do formulário ou adicionar Prova Social.',
            ];
        }

        // 2. Analisar Taxa de Aprovação de Cartão
        $cardApproval = PaymentAnalytics::where('checkout_experience_id', $experienceId)
            ->where('method', 'card')
            ->where('created_at', '>=', now()->subDays(7))
            ->avg('approval_rate');

        if ($cardApproval !== null && $cardApproval < 0.70) { // < 70%
            $recommendations[] = [
                'type' => 'approval',
                'priority' => 'medium',
                'message' => 'Alta taxa de recusa em cartões. Verifique as configurações de antifraude ou considere habilitar um gateway secundário.',
            ];
        }

        // 3. Analisar Abandono
        $hasHighAbandonment = DB::table('abandonment_events')
            ->where('checkout_experience_id', $experienceId)
            ->where('created_at', '>=', now()->subDays(7))
            ->exists();

        if ($hasHighAbandonment) {
            $recommendations[] = [
                'type' => 'abandonment',
                'priority' => 'high',
                'message' => 'Detectado abandono frequente na etapa de identificação. Verifique se o carregamento da página está lento ou se há erros no mobile.',
            ];
        }

        return [
            'experience_id' => $experienceId,
            'health_score' => $score->health_score,
            'status' => $score->health_score > 70 ? 'healthy' : 'at_risk',
            'recommendations' => $recommendations
        ];
    }
}
