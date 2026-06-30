<?php

namespace App\Services\Gateway;

use App\Services\Gateway\Contracts\GatewayDriverInterface;
use App\Models\GatewayAccount;
use App\Services\Security\GatewayCredentialEncryptionService;
use InvalidArgumentException;

class GatewayDriverRegistry
{
    public function __construct(
        private readonly GatewayCredentialEncryptionService $encryptionService
    ) {}

    /**
     * Resolve the driver instance for a given GatewayAccount.
     */
    public function resolve(GatewayAccount $account): GatewayDriverInterface
    {
        $driverClass = $this->getDriverClass($account->gateway_type);

        if (!class_exists($driverClass)) {
            throw new InvalidArgumentException("Driver not found for gateway type: {$account->gateway_type}");
        }

        // Get decrypted credentials
        $credentials = $this->getDecryptedCredentials($account);

        return new $driverClass($credentials, $account->environment);
    }

    private function getDriverClass(string $type): string
    {
        return match ($type) {
            'asaas' => \App\Services\Gateway\Drivers\AsaasDriver::class,
            // Add other drivers here (pagbank, itau, etc.)
            default => throw new InvalidArgumentException("Unknown gateway type: {$type}"),
        };
    }

    private function getDecryptedCredentials(GatewayAccount $account): array
    {
        $decrypted = [];
        foreach ($account->credentials as $cred) {
            $decrypted[$cred->key] = $this->encryptionService->decrypt($cred->encrypted_value);
        }

        return $decrypted;
    }
}
