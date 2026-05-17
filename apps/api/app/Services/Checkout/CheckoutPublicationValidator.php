<?php

namespace App\Services\Checkout;

use App\Models\CheckoutExperience;
use App\Models\GatewayAccount;

class CheckoutPublicationValidator
{
    /**
     * Valida se uma experiência de checkout pode ser publicada.
     */
    public function validate(CheckoutExperience $experience): array
    {
        $errors = [];
        $warnings = [];

        // 1. Validar Gateway
        $gatewayCount = GatewayAccount::where('company_id', $experience->company_id)
            ->where('status', 'active')
            ->count();

        if ($gatewayCount === 0) {
            $errors[] = [
                'code' => 'missing_gateway',
                'message' => 'Nenhum gateway de pagamento ativo configurado para esta empresa.'
            ];
        }

        // 2. Validar Métodos de Pagamento (config)
        $config = $experience->config;
        $hasMethods = ($config['payments']['pix']['enabled'] ?? false) || 
                      ($config['payments']['card']['enabled'] ?? false) || 
                      ($config['payments']['boleto']['enabled'] ?? false);

        if (!$hasMethods) {
            $errors[] = [
                'code' => 'no_payment_methods',
                'message' => 'Pelo menos um método de pagamento (PIX, Cartão ou Boleto) deve estar habilitado.'
            ];
        }

        // 3. Validar Trust Signals (Avisos)
        if (!($config['trust']['guarantee']['enabled'] ?? false)) {
            $warnings[] = [
                'code' => 'missing_guarantee',
                'message' => 'Recomendado: Adicionar um selo de garantia para aumentar a conversão.'
            ];
        }

        if (!($config['trust']['social_proof']['enabled'] ?? false)) {
            $warnings[] = [
                'code' => 'missing_social_proof',
                'message' => 'Recomendado: Ativar prova social para gerar autoridade.'
            ];
        }

        return [
            'can_publish' => empty($errors),
            'status' => empty($errors) ? 'ready' : 'blocked',
            'errors' => $errors,
            'warnings' => $warnings,
        ];
    }
}
