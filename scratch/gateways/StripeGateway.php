<?php

namespace App\Services\Gateway;

/**
 * Stripe Gateway Implementation
 * Note: Full implementation pending. Currently a stub.
 */
class StripeGateway implements PaymentGatewayInterface
{
    private string $apiKey;

    public function __construct(?string $apiKey = null)
    {
        $this->apiKey = $apiKey ?? config('services.stripe.key');
    }

    public function createCustomer(array $data): string
    {
        // Stripe Customer Implementation needed
        throw new \Exception("StripeGateway createCustomer não implementado em PHP.");
    }

    public function charge(array $input, string $customerId): array
    {
        // Stripe Charge Implementation needed
        throw new \Exception("StripeGateway charge não implementado em PHP.");
    }

    public function createSubscription(array $input, string $customerId): array
    {
        // Stripe Subscription Implementation needed
        throw new \Exception("StripeGateway createSubscription não implementado em PHP.");
    }

    public function chargeViaPix(array $input, string $customerId): array
    {
        // Stripe does not support PIX directly
        throw new \Exception("StripeGateway não suporta PIX.");
    }

    public function chargeViaBoleto(array $input, string $customerId): array
    {
        // Stripe does not support Boleto directly
        throw new \Exception("StripeGateway não suporta Boleto.");
    }
}
