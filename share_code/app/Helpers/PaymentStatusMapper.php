<?php

declare(strict_types=1);

namespace App\Helpers;

/**
 * ÚNICO arquivo de mapeamento de status do sistema.
 * NUNCA duplique mapStatus() ou isPaid() em outro lugar.
 *
 * [QA-03] WebhookController tinha statusMap inline → usa mapStatus()
 * [QA-04] CardPaymentService/PixPaymentService/BoletoPaymentService
 *         tinham mapStatus() e isPaid() próprios → removidos, usam este
 * [QA-06] CheckoutController fazia in_array(['CONFIRMED','RECEIVED']) → usa isPaid()
 */
class PaymentStatusMapper
{
    /**
     * Converte o status do Asaas para o status interno do sistema.
     *
     * CONFIRMED / RECEIVED / RECEIVED_IN_CASH  → 'approved'
     * PENDING / AWAITING_RISK_ANALYSIS         → 'pending'
     * OVERDUE                                  → 'overdue'
     * REFUNDED / REFUND_REQUESTED / CHARGEBACK → 'refunded'
     * CANCELED / DELETED                       → 'cancelled'
     * (qualquer outro)                         → 'pending'
     */
    public static function mapStatus(string $gatewayStatus): string
    {
        return match ($gatewayStatus) {
            'CONFIRMED', 'RECEIVED', 'RECEIVED_IN_CASH' => 'approved',
            'PENDING', 'AWAITING_RISK_ANALYSIS' => 'pending',
            'OVERDUE' => 'overdue',
            'REFUNDED', 'REFUND_REQUESTED' => 'refunded',
            'CHARGEBACK', 'CHARGEBACK_REQUESTED', 'CHARGEBACK_DISPUTE' => 'chargeback',
            'CANCELED', 'DELETED' => 'cancelled',
            default => 'pending',
        };
    }

    /**
     * Retorna true se o status indica pagamento confirmado.
     *
     * [QA-06] Substitui TODOS os in_array($status, ['CONFIRMED','RECEIVED'])
     *         espalhados no código.
     *
     * Uso:
     *   if (PaymentStatusMapper::isPaid($response['status'])) {
     *       $transaction->update(['status' => 'approved', 'paid_at' => now()]);
     *   }
     */
    public static function isPaid(string $gatewayStatus): bool
    {
        return in_array($gatewayStatus, [
            'CONFIRMED',
            'RECEIVED',
            'RECEIVED_IN_CASH',
        ], true);
    }

    /**
     * Converte billingType do Asaas para método interno.
     *
     * CREDIT_CARD / CREDITCARD → 'credit_card'
     * PIX                      → 'pix'
     * BOLETO                   → 'boleto'
     */
    public static function mapPaymentMethod(string $billingType): string
    {
        return match ($billingType) {
            'CREDIT_CARD', 'CREDITCARD' => 'credit_card',
            'PIX' => 'pix',
            'BOLETO' => 'boleto',
            default => 'credit_card',
        };
    }

    /**
     * Converte status interno para evento de webhook.
     * Usado pelos Listeners (DispatchWebhookOn*).
     */
    public static function mapToWebhookEvent(string $internalStatus): string
    {
        return match ($internalStatus) {
            'approved' => 'payment.approved',
            'refused' => 'payment.refused',
            'refunded' => 'payment.refunded',
            'cancelled' => 'payment.cancelled',
            'overdue' => 'payment.overdue',
            default => 'payment.pending',
        };
    }
}