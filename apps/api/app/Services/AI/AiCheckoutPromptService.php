<?php

namespace App\Services\AI;

use App\Models\CheckoutExperience;
use App\Models\CheckoutExperienceVersion;
use App\Models\AuditLog;
use Illuminate\Support\Str;

class AiCheckoutPromptService
{
    /**
     * Gera uma estrutura de checkout a partir de um prompt de texto.
     * NUNCA publica automaticamente — apenas gera draft.
     * NUNCA inventa prova social falsa.
     */
    public function generateFromPrompt(int $companyId, string $prompt, array $context = []): array
    {
        // Higienização do prompt — sem scripts ou HTML
        $cleanPrompt = strip_tags($prompt);
        $cleanPrompt = preg_replace('/<script\b[^>]*>.*?<\/script>/is', '', $cleanPrompt);

        // Validar que não estamos recebendo dados sensíveis no prompt
        $this->validateNoSensitiveData($cleanPrompt);

        // Analisar intenção do prompt
        $intent = $this->analyzeIntent($cleanPrompt);

        // Gerar estrutura do checkout
        $structure = $this->buildCheckoutStructure($cleanPrompt, $intent, $context);

        // Gerar warnings (compliance e qualidade)
        $warnings = $this->generateWarnings($structure, $cleanPrompt, $context);

        // Gerar design tokens
        $designTokens = $this->generateDesignTokens($intent);

        $promptId = (string) Str::uuid();

        return [
            'checkout'      => $structure,
            'design_tokens' => $designTokens,
            'warnings'      => $warnings,
            'prompt_id'     => $promptId,
            'source'        => 'ai_prompt',
            'status'        => 'draft', // NUNCA 'published'
            'ai_metadata'   => [
                'prompt_original'  => $cleanPrompt,
                'intent'           => $intent,
                'generated_at'     => now()->toISOString(),
                'model'            => 'basileia_v1_internal',
                'auto_published'   => false, // Segurança
            ],
        ];
    }

    /**
     * Salva o resultado da IA como draft no banco.
     */
    public function saveDraft(int $companyId, int $userId, array $generatedData): CheckoutExperience
    {
        $checkout = $generatedData['checkout'];

        $experience = CheckoutExperience::create([
            'uuid'       => (string) Str::uuid(),
            'company_id' => $companyId,
            'name'       => $checkout['name'],
            'status'     => 'draft', // NUNCA published
            'config'     => [
                'headline'         => $checkout['headline'],
                'description'      => $checkout['description'],
                'primary_color'    => $checkout['primary_color'],
                'secondary_color'  => $checkout['secondary_color'] ?? null,
                'layout'           => $checkout['layout'],
                'payment_methods'  => $checkout['payment_methods'],
                'recommended_payment_method' => $checkout['recommended_payment_method'] ?? null,
                'sections'         => $checkout['sections'],
                'trust'            => $checkout['trust'] ?? [],
                'receipt'          => $checkout['receipt'] ?? [],
                'failure'          => $checkout['failure'] ?? [],
            ],
            'created_by' => $userId,
        ]);

        // Criar versão draft
        CheckoutExperienceVersion::create([
            'checkout_experience_id' => $experience->id,
            'version_number'         => 1,
            'status'                 => 'draft',
            'source'                 => 'ai_prompt',
            'config_json'            => $experience->config,
            'prompt_original'        => $generatedData['ai_metadata']['prompt_original'] ?? null,
            'ai_metadata'            => $generatedData['ai_metadata'],
            'created_by'             => $userId,
        ]);

        // Audit log
        AuditLog::create([
            'uuid'        => (string) Str::uuid(),
            'company_id'  => $companyId,
            'user_id'     => $userId,
            'event'       => 'ai_checkout_draft_created',
            'entity_type' => 'checkout_experience',
            'entity_id'   => $experience->id,
            'new_values'  => [
                'name'   => $checkout['name'],
                'source' => 'ai_prompt',
                'prompt' => Str::limit($generatedData['ai_metadata']['prompt_original'], 200),
            ],
        ]);

        return $experience;
    }

    /**
     * Analisa a intenção do prompt do usuário.
     */
    protected function analyzeIntent(string $prompt): array
    {
        $intent = [
            'type'       => 'generic',
            'niche'      => null,
            'tone'       => 'professional',
            'urgency'    => false,
            'premium'    => false,
            'keywords'   => [],
        ];

        $lower = mb_strtolower($prompt, 'UTF-8');

        // Detectar nicho
        if (preg_match('/conferência|congresso|evento|summit/u', $lower)) {
            $intent['type'] = 'event';
            $intent['niche'] = 'events';
        } elseif (preg_match('/curso|treinamento|aula|mentoria|workshop/u', $lower)) {
            $intent['type'] = 'education';
            $intent['niche'] = 'education';
        } elseif (preg_match('/produto|loja|e-?commerce|venda/u', $lower)) {
            $intent['type'] = 'ecommerce';
            $intent['niche'] = 'ecommerce';
        } elseif (preg_match('/assinatura|plano|recorrente|mensal/u', $lower)) {
            $intent['type'] = 'subscription';
            $intent['niche'] = 'subscription';
        } elseif (preg_match('/doação|oferta|contribuição|igreja|ministério/u', $lower)) {
            $intent['type'] = 'donation';
            $intent['niche'] = 'church';
        } elseif (preg_match('/consultoria|serviço|agendamento/u', $lower)) {
            $intent['type'] = 'service';
            $intent['niche'] = 'services';
        }

        // Detectar tom
        if (preg_match('/premium|luxo|exclusivo|elegante|sofisticado/u', $lower)) {
            $intent['tone'] = 'premium';
            $intent['premium'] = true;
        } elseif (preg_match('/urgente|limitado|últimas vagas|agora|pressa/u', $lower)) {
            $intent['tone'] = 'urgent';
            $intent['urgency'] = true;
        } elseif (preg_match('/cristã|cristão|evangélico|institucional|confiança/u', $lower)) {
            $intent['tone'] = 'institutional';
        } elseif (preg_match('/jovem|moderno|descolado|tech/u', $lower)) {
            $intent['tone'] = 'modern';
        }

        // Extrair keywords
        preg_match_all('/(?:chamad[ao]|nome)\s+([A-ZÀ-Ÿ][a-zà-ÿ]+(?:\s+[A-ZÀ-Ÿ][a-zà-ÿ]+)*)/u', $prompt, $matches);
        if (!empty($matches[1])) {
            $intent['keywords'] = $matches[1];
        }

        return $intent;
    }

    /**
     * Gera estrutura do checkout baseada no prompt e intenção.
     */
    protected function buildCheckoutStructure(string $prompt, array $intent, array $context): array
    {
        $name = $this->inferName($prompt, $intent);
        $headline = $this->inferHeadline($prompt, $intent);

        // Determinar métodos de pagamento
        $paymentMethods = $this->inferPaymentMethods($prompt, $context);
        $recommendedMethod = $this->inferRecommendedMethod($prompt, $paymentMethods);

        // Gerar seções
        $sections = $this->buildSections($prompt, $intent);

        // Trust config — NUNCA inventar prova social
        $trustConfig = [
            'social_proof' => ['enabled' => false], // Não inventa dados
            'guarantee'    => ['enabled' => true, 'text' => 'Pagamento 100% seguro processado pela Basileia Pay.'],
            'badges'       => ['enabled' => true],
        ];

        $colors = $this->inferColors($prompt, $intent);

        return [
            'name'                       => $name,
            'headline'                   => $headline,
            'description'                => $this->inferDescription($prompt, $intent),
            'primary_color'              => $colors['primary'],
            'secondary_color'            => $colors['secondary'],
            'layout'                     => $intent['premium'] ? 'narrative' : 'single_column',
            'payment_methods'            => $paymentMethods,
            'recommended_payment_method' => $recommendedMethod,
            'sections'                   => $sections,
            'trust'                      => $trustConfig,
            'receipt'                    => [
                'style'   => $intent['premium'] ? 'elegant' : 'standard',
                'message' => 'Obrigado pela sua compra! Você receberá a confirmação por e-mail.',
            ],
            'failure'                    => [
                'message'    => 'Não foi possível processar seu pagamento. Tente novamente ou escolha outro método.',
                'show_retry' => true,
            ],
        ];
    }

    protected function inferName(string $prompt, array $intent): string
    {
        // Tentar extrair nome do evento/produto do prompt
        if (preg_match('/chamad[ao]\s+(.{3,50}?)(?:\.|,|$)/u', $prompt, $m)) {
            return trim($m[1]);
        }
        if (!empty($intent['keywords'])) {
            return $intent['keywords'][0];
        }

        return match ($intent['type']) {
            'event'        => 'Inscrição para Evento',
            'education'    => 'Acesso ao Curso',
            'ecommerce'    => 'Finalizar Compra',
            'subscription' => 'Assinar Plano',
            'donation'     => 'Contribuição',
            'service'      => 'Contratar Serviço',
            default        => 'Checkout — ' . Str::limit($prompt, 30),
        };
    }

    protected function inferHeadline(string $prompt, array $intent): string
    {
        return match ($intent['type']) {
            'event'        => 'Garanta sua inscrição com segurança',
            'education'    => 'Acesse o conteúdo exclusivo agora',
            'ecommerce'    => 'Finalize sua compra com segurança',
            'subscription' => 'Comece agora — cancele quando quiser',
            'donation'     => 'Sua contribuição faz a diferença',
            'service'      => 'Confirme sua contratação',
            default        => 'Finalize seu pagamento com segurança',
        };
    }

    protected function inferDescription(string $prompt, array $intent): string
    {
        return match ($intent['type']) {
            'event'        => 'Checkout gerado para inscrição em evento. Adicione detalhes como data, local e programação.',
            'education'    => 'Checkout para acesso educacional. Personalize com informações sobre o conteúdo oferecido.',
            'ecommerce'    => 'Checkout para venda de produto. Adicione fotos, descrições e condições de entrega.',
            'donation'     => 'Checkout para contribuição. Personalize com a causa e o impacto da doação.',
            default        => 'Checkout gerado automaticamente via IA Basileia. Personalize antes de publicar.',
        };
    }

    protected function inferPaymentMethods(string $prompt, array $context): array
    {
        $methods = ['pix', 'card']; // Default

        $lower = mb_strtolower($prompt, 'UTF-8');

        if (str_contains($lower, 'boleto')) {
            $methods[] = 'boleto';
        }
        if (str_contains($lower, 'apenas pix') || str_contains($lower, 'somente pix')) {
            $methods = ['pix'];
        }
        if (str_contains($lower, 'apenas cartão') || str_contains($lower, 'somente cartão')) {
            $methods = ['card'];
        }

        // Respeitar métodos habilitados do contexto
        if (!empty($context['enabled_methods'])) {
            $methods = array_intersect($methods, $context['enabled_methods']);
        }

        return array_values(array_unique($methods));
    }

    protected function inferRecommendedMethod(string $prompt, array $methods): ?string
    {
        $lower = mb_strtolower($prompt, 'UTF-8');

        if (str_contains($lower, 'pix') && in_array('pix', $methods)) return 'pix';
        if (str_contains($lower, 'cartão') && in_array('card', $methods)) return 'card';

        // Default: PIX tem melhor conversão
        return in_array('pix', $methods) ? 'pix' : ($methods[0] ?? null);
    }

    protected function inferColors(string $prompt, array $intent): array
    {
        $lower = mb_strtolower($prompt, 'UTF-8');

        // Extrair cor do prompt se mencionada
        $colorMap = [
            'roxo'     => ['#7C3AED', '#EDE9FE'],
            'azul'     => ['#2563EB', '#DBEAFE'],
            'verde'    => ['#16A34A', '#DCFCE7'],
            'vermelho' => ['#DC2626', '#FEE2E2'],
            'laranja'  => ['#EA580C', '#FFF7ED'],
            'dourado'  => ['#D97706', '#FFFBEB'],
            'preto'    => ['#1F2937', '#F3F4F6'],
            'rosa'     => ['#EC4899', '#FCE7F3'],
        ];

        foreach ($colorMap as $name => $colors) {
            if (str_contains($lower, $name)) {
                return ['primary' => $colors[0], 'secondary' => $colors[1]];
            }
        }

        // Defaults por nicho
        return match ($intent['niche']) {
            'church'   => ['primary' => '#7C3AED', 'secondary' => '#EDE9FE'],
            'events'   => ['primary' => '#2563EB', 'secondary' => '#DBEAFE'],
            'education'=> ['primary' => '#0891B2', 'secondary' => '#ECFEFF'],
            default    => ['primary' => '#5B2EFF', 'secondary' => '#EDE7FF'],
        };
    }

    protected function buildSections(string $prompt, array $intent): array
    {
        $sections = [
            ['type' => 'hero', 'title' => $this->inferHeadline($prompt, $intent), 'subtitle' => 'Sua compra protegida pela Basileia Pay.'],
        ];

        if ($intent['urgency']) {
            $sections[] = ['type' => 'urgency', 'title' => 'Vagas limitadas', 'content' => 'Garanta a sua antes que esgote.'];
        }

        $sections[] = ['type' => 'trust', 'title' => 'Pagamento protegido', 'content' => 'Sua compra é processada com segurança pela Basileia Pay.'];

        if ($intent['type'] === 'event') {
            $sections[] = ['type' => 'details', 'title' => 'Sobre o evento', 'content' => 'Adicione detalhes do evento aqui.'];
        }

        if ($intent['type'] === 'education') {
            $sections[] = ['type' => 'benefits', 'title' => 'O que você vai aprender', 'content' => 'Liste os benefícios do curso aqui.'];
        }

        // NUNCA adicionar social proof com dados inventados
        // $sections[] = ['type' => 'social_proof', ...]; // Desativado

        return $sections;
    }

    protected function generateDesignTokens(array $intent): array
    {
        return [
            'typography' => $intent['premium'] ? 'Inter' : 'Inter',
            'border_radius' => $intent['premium'] ? '12px' : '8px',
            'shadow' => $intent['premium'] ? 'elevated' : 'subtle',
            'spacing' => 'comfortable',
            'button_style' => $intent['urgency'] ? 'bold' : 'standard',
        ];
    }

    /**
     * Gera warnings para dados ausentes ou inseguros.
     */
    protected function generateWarnings(array $structure, string $prompt, array $context): array
    {
        $warnings = [];

        // Warning: prova social não inventada
        $warnings[] = [
            'code'           => 'missing_social_proof',
            'category'       => 'trust',
            'message'        => 'Nenhuma prova social real foi informada.',
            'recommendation' => 'Adicione depoimentos reais ou mantenha o bloco desativado.',
        ];

        // Warning: rascunho
        $warnings[] = [
            'code'           => 'draft_only',
            'category'       => 'operation',
            'message'        => 'Este checkout foi criado como rascunho.',
            'recommendation' => 'Revise, personalize e valide antes de publicar.',
        ];

        // Warning: se poucos métodos de pagamento
        if (count($structure['payment_methods']) < 2) {
            $warnings[] = [
                'code'           => 'limited_payment_methods',
                'category'       => 'conversion',
                'message'        => 'Apenas 1 método de pagamento está configurado.',
                'recommendation' => 'Considere habilitar mais métodos para aumentar a conversão.',
            ];
        }

        // Warning: dados incompletos
        if (empty($context['company_branding'])) {
            $warnings[] = [
                'code'           => 'missing_branding',
                'category'       => 'trust',
                'message'        => 'Nenhuma identidade visual da empresa foi aplicada.',
                'recommendation' => 'Configure logo e cores da empresa em Configurações antes de publicar.',
            ];
        }

        return $warnings;
    }

    /**
     * Valida que o prompt não contém dados sensíveis.
     */
    protected function validateNoSensitiveData(string $prompt): void
    {
        // Detectar possíveis API keys, tokens, etc.
        if (preg_match('/sk_live_|pk_live_|api_key|secret_key|password|Bearer /i', $prompt)) {
            throw new \InvalidArgumentException(
                'O prompt contém dados que parecem ser credenciais ou chaves de API. Remova informações sensíveis antes de enviar.'
            );
        }

        // Detectar números de cartão
        if (preg_match('/\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/', $prompt)) {
            throw new \InvalidArgumentException(
                'O prompt contém o que parece ser um número de cartão de crédito. Não inclua dados financeiros sensíveis.'
            );
        }

        // Detectar CPF
        if (preg_match('/\b\d{3}\.\d{3}\.\d{3}-\d{2}\b/', $prompt)) {
            throw new \InvalidArgumentException(
                'O prompt contém dados pessoais (CPF). Não inclua dados sensíveis no prompt.'
            );
        }
    }
}
