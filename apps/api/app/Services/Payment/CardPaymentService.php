<?php

namespace App\Services\Payment;

use App\Services\Gateway\GatewayInterface;
use App\Services\Gateway\GatewayResolver;
use App\Helpers\PaymentStatusMapper;
use Illuminate\Support\Facades\Log;

/**
 * Serviço dedicado a pagamentos via cartão de crédito.
 * Encapsula criação de customer, cobrança e mapeamento de status.
 */
class CardPaymentService
{
    /**
     * Processar pagamento com cartão de crédito.
     *
     * @param array $input [amountBRL, installments, description, cardToken, cardHolderName, cardExpiry, cardCvv, remoteIp]
     * @param array $customerData [name, email, document]
     * @param string $billingCycle 'once' | 'annual'
     * @param GatewayInterface|null $gateway Gateway opcional (usa resolução automática se não informado)
     * @return array [gatewayId, status, raw]
     */
    public function charge(array $input, array $customerData, string $billingCycle = 'once', ?GatewayInterface $gateway = null): array
    {
        $gateway = $gateway ?? GatewayResolver::resolveGateway('asaas');

        $customerId = $gateway->createCustomer([
            'name' => $customerData['name'],
            'email' => $customerData['email'],
            'phone' => '',
            'document' => $customerData['document'],
            'zip' => '',
        ]);

        Log::info('CardPaymentService: Customer created', ['customerId' => $customerId]);

        if ($billingCycle === 'annual') {
            $result = $gateway->createSubscription($input, $customerId);
        } else {
            $result = $gateway->charge($input, $customerId);
        }

        Log::info('CardPaymentService: Payment processed', [
            'gatewayId' => $result['gatewayId'] ?? null,
            'status' => $result['status'] ?? null,
        ]);

        return $result;
    }

    /**
     * Mapear status do gateway para status interno.
     */
    public function mapStatus(string $gatewayStatus): string
    {
        return PaymentStatusMapper::mapStatus($gatewayStatus);
    }

    /**
     * Verificar se o status indica pagamento confirmado.
     */
    public function isPaid(string $gatewayStatus): bool
    {
        return PaymentStatusMapper::isPaid($gatewayStatus);
    }
}
