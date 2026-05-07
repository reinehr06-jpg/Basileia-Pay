<?php

namespace App\Services\Gateways;

interface PaymentGatewayInterface
{
    /**
     * @param array $customerData [name, email, phone, document, address, city, state, zip, country]
     * @return string customerId
     */
    public function createCustomer(array $customerData): string;

    /**
     * @param array $input [amountBRL, installments, description, cardToken, cardHolderName, cardExpiry, cardCvv, remoteIp]
     * @param string $customerId
     * @return array [success, gatewayId, status, installments, amountCharged, raw]
     */
    public function charge(array $input, string $customerId): array;

    /**
     * @param array $input [amountBRL, installments, description, cardToken, cardHolderName, cardExpiry, cardCvv, remoteIp]
     * @param string $customerId
     * @return array [success, gatewayId, status, installments, amountCharged, raw]
     */
    public function createSubscription(array $input, string $customerId): array;
}
