<?php

namespace App\Services\Gateways;

class GatewayFactory
{
    public static function create(): PaymentGatewayInterface
    {
        $gateway = config('services.payment_gateway', 'asaas');

        return match ($gateway) {
            'asaas' => app(AsaasGateway::class),
            'stripe' => app(StripeGateway::class),
            default => throw new \Exception("Gateway {$gateway} não implementado."),
        };
    }
}
