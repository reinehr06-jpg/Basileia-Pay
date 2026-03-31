<?php

namespace App\Services\Gateway;

use InvalidArgumentException;

class GatewayFactory
{
    private const GATEWAYS = [
        'asaas' => AsaasGateway::class,
    ];

    public function make(string $type): GatewayInterface
    {
        $type = strtolower($type);

        if (!isset(self::GATEWAYS[$type])) {
            throw new InvalidArgumentException("Gateway [{$type}] is not supported.");
        }

        return app()->make(self::GATEWAYS[$type]);
    }
}
