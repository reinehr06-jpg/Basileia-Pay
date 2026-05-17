<?php

namespace App\Services\Studio;

use App\Models\CheckoutExperience;
use Illuminate\Support\Facades\DB;

class ExperienceBuilderService
{
    /**
     * Salva a estrutura visual (canvas) de uma experiência.
     */
    public function saveCanvas(int $experienceId, array $canvasData): CheckoutExperience
    {
        $experience = CheckoutExperience::findOrFail($experienceId);
        
        // Atualizar o campo config com a nova estrutura de blocos
        $config = $experience->config ?? [];
        $config['layout'] = $canvasData['layout'] ?? 'single_column';
        $config['blocks'] = $canvasData['blocks'] ?? [];
        $config['theme']  = $canvasData['theme'] ?? [];

        $experience->update(['config' => $config]);

        return $experience;
    }

    /**
     * Retorna a biblioteca de blocos disponíveis para o Studio.
     */
    public function getBlockLibrary(): array
    {
        return [
            [
                'id' => 'customer_data',
                'name' => 'Dados do Comprador',
                'category' => 'essentials',
                'description' => 'Campos de Nome, Email, CPF e Telefone.',
                'icon' => 'user'
            ],
            [
                'id' => 'payment_selector',
                'name' => 'Seletor de Pagamento',
                'category' => 'essentials',
                'description' => 'Botões para PIX, Cartão e Boleto.',
                'icon' => 'credit-card'
            ],
            [
                'id' => 'social_proof',
                'name' => 'Prova Social Live',
                'category' => 'trust',
                'description' => 'Exibe quem comprou recentemente.',
                'icon' => 'users'
            ],
            [
                'id' => 'guarantee_badge',
                'name' => 'Selo de Garantia',
                'category' => 'trust',
                'description' => 'Selo dinâmico de satisfação garantida.',
                'icon' => 'shield-check'
            ],
            [
                'id' => 'ai_consultant',
                'name' => 'Consultor IA',
                'category' => 'ai',
                'description' => 'Chatbot inteligente para tirar dúvidas.',
                'icon' => 'bot'
            ]
        ];
    }
}
