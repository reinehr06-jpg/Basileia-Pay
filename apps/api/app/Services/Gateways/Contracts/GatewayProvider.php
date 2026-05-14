<?php

namespace App\Services\Gateways\Contracts;

use App\Models\GatewayAccount;
use App\Models\Order;
use App\Models\Payment;

interface GatewayProvider
{
    /**
     * Gera um pagamento via PIX.
     */
    public function generatePix(GatewayAccount $account, Order $order, array $customer): array;

    /**
     * Processa um pagamento via Cartão de Crédito.
     */
    public function processCreditCard(GatewayAccount $account, Order $order, array $cardData, array $customer): array;

    /**
     * Cancela um pagamento.
     */
    public function cancelPayment(GatewayAccount $account, string $externalId): bool;

    /**
     * Realiza o estorno de um pagamento.
     */
    public function refundPayment(GatewayAccount $account, string $externalId, ?float $amount = null): bool;
}
