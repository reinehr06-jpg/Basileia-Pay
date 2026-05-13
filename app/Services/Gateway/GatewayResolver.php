<?php

declare(strict_types=1);

namespace App\Services\Gateway;

use App\Models\Gateway;
use App\Services\CheckoutService;
use RuntimeException;

class GatewayResolver
{
    public static function resolveGateway(?string $type = null): AsaasGateway
    {
        return AsaasGateway::fromRequest();
    }

    public static function getDefaultGateway(): ?Gateway
    {
        $companyId = CheckoutService::resolveCompanyId();
        if (! $companyId) return null;

        return Gateway::where('company_id', $companyId)
            ->where('status', 'active')
            ->where('is_default', true)
            ->first()
            ?? Gateway::where('company_id', $companyId)
                ->where('status', 'active')
                ->first();
    }

    /** @deprecated Use AsaasGateway::fromRequest() diretamente. */
    public static function resolveApiKey(): string
    {
        $gateway = static::getDefaultGateway();
        if ($gateway) {
            $key = $gateway->getConfig('api_key', '');
            if (! empty($key)) return $key;
        }
        throw new RuntimeException(
            'GatewayResolver: API key não encontrada. Configure o gateway em Dashboard → Gateways.'
        );
    }
}