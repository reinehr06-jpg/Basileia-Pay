<?php

namespace App\Domain\Studio\Validators;

use App\Models\CheckoutExperience;

class CheckoutPublishValidator
{
    const REQUIRED_BLOCKS = [
        'order_summary', 'payment_methods', 'pay_button',
        'company_identity', 'security_text',
    ];

    const FORBIDDEN_PATTERNS = [
        '/<script/i',
        '/javascript:/i',
        '/on\w+\s*=/i',       // event handlers inline
        '/expression\s*\(/i', // CSS expression()
    ];

    public function validate(array $blocks, CheckoutExperience $checkout): array
    {
        $errors   = [];
        $warnings = [];
        $types    = array_column($blocks, 'type');

        // Blocos obrigatórios
        foreach (self::REQUIRED_BLOCKS as $required) {
            if (!in_array($required, $types)) {
                $errors[] = "Bloco obrigatório ausente: {$required}";
            }
        }

        // Método de pagamento configurado
        $paymentBlock = $this->findBlock($blocks, 'payment_methods');
        if ($paymentBlock && empty($paymentBlock['config']['methods'])) {
            $errors[] = 'Nenhum método de pagamento configurado.';
        }

        // Conteúdo de cada bloco
        foreach ($blocks as $block) {
            $content = json_encode($block['content'] ?? []);
            foreach (self::FORBIDDEN_PATTERNS as $pattern) {
                if (preg_match($pattern, $content)) {
                    $errors[] = "Conteúdo inseguro detectado no bloco: {$block['type']}";
                    break;
                }
            }
        }

        // Avisos (não bloqueantes)
        if (!in_array('secure_seal', $types)) {
            $warnings[] = 'Recomendado: adicionar bloco de selo de segurança.';
        }

        return [
            'can_publish'  => empty($errors),
            'has_warnings' => !empty($warnings),
            'errors'       => $errors,
            'warnings'     => $warnings,
        ];
    }

    private function findBlock(array $blocks, string $type)
    {
        foreach ($blocks as $block) {
            if ($block['type'] === $type) return $block;
        }
        return null;
    }
}
