<?php

declare(strict_types=1);

namespace App\Services\Gateway;

use App\Models\Integration;
use RuntimeException;

class GatewayFactory
{
    public static function create(): AsaasGateway
    {
        return AsaasGateway::fromRequest();
    }

    public static function createFromIntegration(Integration $integration): AsaasGateway
    {
        return AsaasGateway::fromIntegration($integration);
    }

    public static function make(string $gatewayType = 'asaas'): AsaasGateway
    {
        return match (strtolower($gatewayType)) {
            'asaas' => AsaasGateway::fromRequest(),
            default => throw new RuntimeException(
                "GatewayFactory: [{$gatewayType}] não existe em produção. Use 'asaas'."
            ),
        };
    }
}
