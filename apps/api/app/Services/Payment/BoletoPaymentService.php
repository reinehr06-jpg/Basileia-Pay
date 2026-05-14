<?php

namespace App\Services\Payment;

use App\Services\Gateway\GatewayInterface;
use App\Services\Gateway\GatewayResolver;
use App\Helpers\PaymentStatusMapper;
use Illuminate\Support\Facades\Log;

/**
 * Serviço dedicado a pagamentos via Boleto.
 * Encapsula criação de customer, cobrança e geração do link/código do boleto.
 */
class BoletoPaymentService
{
    /**
     * Processar pagamento com Boleto.
     *
     * @param array $input [amountBRL, description, remoteIp]
     * @param array $customerData [name, email, document]
     * @param GatewayInterface|null $gateway Gateway opcional
     * @return array [gatewayId, boletoUrl, boletoBarcode]
     */
    public function charge(array $input, array $customerData, ?GatewayInterface $gateway = null): array
    {
        $gateway = $gateway ?? GatewayResolver::resolveGateway('asaas');

        $customerId = $gateway->createCustomer([
            'name' => $customerData['name'],
            'email' => $customerData['email'],
            'phone' => '',
            'document' => $customerData['document'],
            'zip' => '',
        ]);

        Log::info('BoletoPaymentService: Customer created', ['customerId' => $customerId]);

        $result = $gateway->chargeViaBoleto($input, $customerId);

        Log::info('BoletoPaymentService: Payment created', [
            'gatewayId' => $result['gatewayId'] ?? null,
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
