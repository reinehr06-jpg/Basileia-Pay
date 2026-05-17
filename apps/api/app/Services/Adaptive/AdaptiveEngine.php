<?php

namespace App\Services\Adaptive;

class AdaptiveEngine
{
    /**
     * Decide a melhor experiência para o checkout baseado no contexto.
     */
    public function decide(array $session, ?array $memory): array
    {
        $amount = $session['amount'] ?? 0;
        $config = $session['experience']['config'] ?? [];

        // 1. Decidir Método Padrão
        $defaultMethod = $memory['preferred_method'] ?? $this->suggestMethodByAmount($amount);

        // 2. Checkout Narrativo (Ex: Ticket > R$ 500,00)
        $isNarrative = $amount > 50000; 

        // 3. Trust Radar (Aumentar provas sociais se for primeira compra)
        $trustLevel = $memory ? 'standard' : 'high';

        return [
            'default_method' => $defaultMethod,
            'is_narrative'   => $isNarrative,
            'trust_level'    => $trustLevel,
            'adaptive_flags' => [
                'prefill_enabled' => (bool)$memory,
                'show_guarantee_popup' => $trustLevel === 'high',
                'highlight_pix_discount' => $defaultMethod !== 'pix' && $amount > 10000,
            ]
        ];
    }

    protected function suggestMethodByAmount(int $amount): string
    {
        // Se ticket baixo, PIX é melhor para conversão
        if ($amount < 5000) return 'pix';
        
        // Se ticket alto, Cartão (Parcelamento) é mais provável
        return 'card';
    }
}
