<?php

declare(strict_types=1);

namespace App\Services\Gateway;

use App\Models\Gateway;
use App\Models\Transaction;
use App\Services\CheckoutService;
use RuntimeException;

/**
 * Resolve qual instância de GatewayInterface usar para uma transação.
 *
 * Cadeia de prioridade:
 *   1. Gateway vinculado diretamente à transação (transaction.gateway_id)
 *   2. Gateway efetivo da integração (integration.gateway_id → company default)
 *   3. Gateway padrão da empresa (company.defaultGateway())
 *   4. Fallback global (primeiro gateway ativo + default do sistema)
 *
 * NUNCA altera config() global — instancia o driver com credenciais do banco.
 */
class GatewayResolver
{
    /**
     * Resolve o driver de gateway correto para uma transação.
     *
     * @throws RuntimeException Se nenhum gateway estiver configurado.
     */
    public static function forTransaction(Transaction $tx): GatewayInterface
    {
        // 1. Gateway diretamente vinculado à transação
        $gatewayModel = $tx->gateway;

        // 2. Gateway da integração (effectiveGateway = integration.gateway → company.default)
        if (!$gatewayModel && $tx->integration) {
            $gatewayModel = $tx->integration->effectiveGateway();
        }

        // 3. Gateway padrão da empresa
        if (!$gatewayModel && $tx->company) {
            $gatewayModel = $tx->company->defaultGateway();
        }

        // 4. Fallback global — primeiro default ativo do sistema
        if (!$gatewayModel) {
            $gatewayModel = Gateway::where('status', 'active')
                ->where('is_default', true)
                ->first();
        }

        // 5. Último recurso — qualquer gateway ativo
        if (!$gatewayModel) {
            $gatewayModel = Gateway::where('status', 'active')->first();
        }

        if (!$gatewayModel) {
            throw new RuntimeException(
                "GatewayResolver: Nenhum gateway configurado para a transação {$tx->uuid}. " .
                "Configure em Dashboard → Gateways."
            );
        }

        return static::makeFromModel($gatewayModel);
    }

    /**
     * Resolve o gateway padrão para uma empresa (checkout sem transação prévia).
     */
    public static function forCompany(int $companyId): GatewayInterface
    {
        $gatewayModel = Gateway::where('company_id', $companyId)
            ->where('is_default', true)
            ->where('status', 'active')
            ->first()
            ?? Gateway::where('company_id', $companyId)
                ->where('status', 'active')
                ->first();

        if (!$gatewayModel) {
            throw new RuntimeException(
                "GatewayResolver: Nenhum gateway ativo para empresa #{$companyId}."
            );
        }

        return static::makeFromModel($gatewayModel);
    }

    /**
     * Instancia o driver correto a partir do model Gateway.
     *
     * Usa o pattern fromGatewayModel() que AsaasGateway já implementa.
     * PagBankGateway seguirá o mesmo pattern.
     */
    public static function makeFromModel(Gateway $gateway): GatewayInterface
    {
        $type = strtolower($gateway->type ?? $gateway->slug ?? 'asaas');

        return match ($type) {
            'asaas'   => AsaasGateway::fromGatewayModel($gateway),
            'pagbank' => PagBankGateway::fromGatewayModel($gateway),
            default   => throw new \InvalidArgumentException(
                "GatewayResolver: tipo '{$type}' não suportado. Use 'asaas' ou 'pagbank'."
            ),
        };
    }

    // ──────────────────────────────────────────────────────────
    // Métodos legados — manter por compatibilidade temporária
    // ──────────────────────────────────────────────────────────

    /** @deprecated Use forTransaction() ou forCompany(). */
    public static function resolveGateway(?string $type = null): AsaasGateway
    {
        return AsaasGateway::fromRequest();
    }

    /** @deprecated Use forTransaction() ou forCompany(). */
    public static function getDefaultGateway(): ?Gateway
    {
        $companyId = CheckoutService::resolveCompanyId();
        if (!$companyId) return null;

        return Gateway::where('company_id', $companyId)
            ->where('status', 'active')
            ->where('is_default', true)
            ->first()
            ?? Gateway::where('company_id', $companyId)
                ->where('status', 'active')
                ->first();
    }

    /** @deprecated Use forTransaction() diretamente. */
    public static function resolveApiKey(): string
    {
        $gateway = static::getDefaultGateway();
        if ($gateway) {
            $key = $gateway->getConfig('api_key', '');
            if (!empty($key)) return $key;
        }
        throw new RuntimeException(
            'GatewayResolver: API key não encontrada. Configure o gateway em Dashboard → Gateways.'
        );
    }
}