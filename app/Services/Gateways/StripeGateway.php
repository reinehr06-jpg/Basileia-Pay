<?php

namespace App\Services\Gateways;

class StripeGateway implements PaymentGatewayInterface
{
    public function createCustomer(array $data): string
    {
        throw new \Exception("StripeGateway createCustomer não implementado em PHP.");
    }

    public function charge(array $input, string $customerId): array
    {
        throw new \Exception("StripeGateway charge não implementado em PHP.");
    }

    public function createSubscription(array $input, string $customerId): array
    {
        throw new \Exception("StripeGateway createSubscription não implementado em PHP.");
    }
}
