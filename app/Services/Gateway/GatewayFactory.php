<?php

declare(strict_types=1);

namespace App\Services\Gateway;

use App\Models\Gateway;
use App\Models\Integration;
use RuntimeException;

/**
 * Fábrica de drivers de gateway.
 *
 * Métodos novos (preferir estes):
 *   - makeFromModel(Gateway) — instancia driver a partir do model do banco
 *
 * Métodos legados (manter por compatibilidade):
 *   - create() — AsaasGateway via request
 *   - createFromIntegration() — AsaasGateway via integration
 *   - make(string) — AsaasGateway por nome
 */
class GatewayFactory
{
    /**
     * Instancia o driver correto a partir de um model Gateway.
     * Delega para GatewayResolver::makeFromModel().
     */
    public static function makeFromModel(Gateway $gateway): GatewayInterface
    {
        return GatewayResolver::makeFromModel($gateway);
    }

    // ──────────────────────────────────────────────────────────
    // Métodos legados — manter por compatibilidade temporária
    // ──────────────────────────────────────────────────────────

    /** @deprecated Use GatewayResolver::forTransaction() ou makeFromModel(). */
    public static function create(): AsaasGateway
    {
        return AsaasGateway::fromRequest();
    }

    /** @deprecated Use GatewayResolver::forTransaction(). */
    public static function createFromIntegration(Integration $integration): AsaasGateway
    {
        return AsaasGateway::fromIntegration($integration);
    }

    /** @deprecated Use makeFromModel() com um Gateway model. */
    public static function make(string $gatewayType = 'asaas'): AsaasGateway
    {
        return match (strtolower($gatewayType)) {
            'asaas' => AsaasGateway::fromRequest(),
            default => throw new RuntimeException(
                "GatewayFactory::make(string) é legado. Use GatewayResolver::forTransaction() para multi-gateway."
            ),
        };
    }
}
