<?php

namespace App\Services\Vault;

use App\Models\CompanyKey;

class VaultKeyService
{
    /**
     * Recupera ou gera uma nova chave simétrica (256-bit) para o tenant.
     * 
     * @param int $companyId
     * @return string Chave crua de 32 bytes
     */
    public static function forCompany(int $companyId): string
    {
        $record = CompanyKey::find($companyId);
        if ($record) {
            return $record->key;
        }

        $key = random_bytes(32); // 256 bits

        CompanyKey::create([
            'company_id' => $companyId,
            'key' => $key,
        ]);

        return $key;
    }
}
