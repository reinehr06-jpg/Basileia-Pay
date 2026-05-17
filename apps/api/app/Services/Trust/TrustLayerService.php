<?php

namespace App\Services\Trust;

use App\Models\TrustDecision;
use Illuminate\Support\Str;

class TrustLayerService
{
    protected $trustScore;

    public function __construct(TrustScoreService $trustScore)
    {
        $this->trustScore = $trustScore;
    }

    /**
     * Avaliar se um checkout pode ser publicado.
     */
    public function evaluateCheckoutPublish(int $companyId, string $checkoutId): TrustDecision
    {
        $score = $this->trustScore->calculateEntityScore($companyId, 'checkout_experience', $checkoutId);
        $global = $this->trustScore->calculateGlobalScore($companyId);

        // Combinar scores
        $combinedScore = (int) (($score['score'] * 0.4) + ($global['score'] * 0.6));

        $decision = match (true) {
            $combinedScore < 40  => 'block_publish',
            $combinedScore < 60  => 'require_review',
            $combinedScore < 80  => 'warn',
            default              => 'allow',
        };

        $reason = $this->buildReason($decision, $combinedScore, $score, $global);

        return $this->recordDecision($companyId, 'checkout_experience', $checkoutId, [
            'decision'           => $decision,
            'score'              => $combinedScore,
            'reason'             => $reason,
            'recommended_action' => $this->getAction($decision),
            'signals'            => array_merge($score['signals'], $global['signals']),
        ]);
    }

    /**
     * Avaliar se um pagamento deve ser processado.
     */
    public function evaluatePayment(int $companyId, array $paymentContext): TrustDecision
    {
        $global = $this->trustScore->calculateGlobalScore($companyId);
        $signals = $global['signals'];
        $score = $global['score'];

        // Sinal: valor muito alto
        $amount = $paymentContext['amount'] ?? 0;
        if ($amount > 100000) { // > R$ 1000
            $score -= 10;
            $signals[] = [
                'type'     => 'high_value_transaction',
                'severity' => 'medium',
                'message'  => 'Transação de alto valor detectada.',
                'value'    => 'R$ ' . number_format($amount / 100, 2, ',', '.'),
            ];
        }

        $score = max(0, $score);

        $decision = match (true) {
            $score < 20 => 'block_payment',
            $score < 40 => 'require_review',
            $score < 70 => 'warn',
            default     => 'allow',
        };

        return $this->recordDecision($companyId, 'payment', $paymentContext['payment_id'] ?? 'unknown', [
            'decision'           => $decision,
            'score'              => $score,
            'reason'             => $this->buildPaymentReason($decision, $score),
            'recommended_action' => $this->getAction($decision),
            'signals'            => $signals,
        ]);
    }

    /**
     * Avaliar a saúde de um gateway.
     */
    public function evaluateGateway(int $companyId, string $gatewayId): TrustDecision
    {
        $score = $this->trustScore->calculateEntityScore($companyId, 'gateway_account', $gatewayId);

        $decision = match (true) {
            $score['score'] < 40 => 'recommend_alternative_method',
            $score['score'] < 70 => 'warn',
            default              => 'allow',
        };

        return $this->recordDecision($companyId, 'gateway_account', $gatewayId, [
            'decision'           => $decision,
            'score'              => $score['score'],
            'reason'             => "Gateway com score {$score['score']}. Status: {$score['status']}.",
            'recommended_action' => $this->getAction($decision),
            'signals'            => $score['signals'],
        ]);
    }

    /**
     * Registra uma decisão do Trust Layer.
     */
    protected function recordDecision(int $companyId, string $entityType, string $entityId, array $data): TrustDecision
    {
        return TrustDecision::create([
            'uuid'               => (string) Str::uuid(),
            'company_id'         => $companyId,
            'entity_type'        => $entityType,
            'entity_id'          => $entityId,
            'decision'           => $data['decision'],
            'score'              => $data['score'],
            'reason'             => $data['reason'],
            'recommended_action' => $data['recommended_action'],
            'signals'            => $data['signals'],
        ]);
    }

    protected function buildReason(string $decision, int $score, array $entityScore, array $globalScore): string
    {
        return match ($decision) {
            'block_publish'  => "Score combinado ({$score}) está abaixo do mínimo para publicação. Score do checkout: {$entityScore['score']}, Score global: {$globalScore['score']}.",
            'require_review' => "Score combinado ({$score}) requer revisão manual antes de publicar. Verifique os sinais de atenção.",
            'warn'           => "Score combinado ({$score}) permite publicação, mas existem sinais que merecem atenção.",
            'allow'          => "Score combinado ({$score}) está saudável. Publicação permitida com segurança.",
            default          => "Decisão do Trust Layer baseada em score {$score}.",
        };
    }

    protected function buildPaymentReason(string $decision, int $score): string
    {
        return match ($decision) {
            'block_payment'  => "Operação com score {$score} — risco alto demais para processar pagamento automaticamente.",
            'require_review' => "Score operacional {$score} indica necessidade de revisão antes do processamento.",
            'warn'           => "Score operacional {$score} — pagamento processado, mas sinais de atenção detectados.",
            'allow'          => "Score operacional {$score} — pagamento processado normalmente.",
            default          => "Decisão baseada em score {$score}.",
        };
    }

    protected function getAction(string $decision): string
    {
        return match ($decision) {
            'block_publish'               => 'Resolva os alertas críticos antes de publicar este checkout.',
            'block_payment'               => 'Verifique a operação imediatamente. Pagamentos estão sendo bloqueados.',
            'require_review'              => 'Revise os sinais de atenção e confirme se a operação está estável.',
            'warn'                        => 'Monitore os alertas e considere resolver os avisos pendentes.',
            'recommend_alternative_method'=> 'Considere usar outro gateway ou método de pagamento.',
            'allow'                       => 'Nenhuma ação necessária. Operação saudável.',
            default                       => 'Verifique os sinais para mais detalhes.',
        };
    }
}
