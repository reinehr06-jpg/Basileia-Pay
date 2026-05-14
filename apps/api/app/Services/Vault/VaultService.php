<?php

namespace App\Services\Vault;

use Illuminate\Support\Facades\DB;

class VaultService
{
    /**
     * Resolve um token de cartão e retorna os dados originais.
     * Retorna null se não encontrar.
     */
    public static function resolveToken(int $companyId, string $cardToken): ?array
    {
        $record = DB::table('card_vault')
            ->where('company_id', $companyId)
            ->where('card_token', $cardToken)
            ->first();

        if (!$record) {
            return null;
        }

        $data = CardCrypto::decrypt(
            $companyId,
            $record->ciphertext,
            $record->iv,
            $record->tag
        );

        DB::table('card_vault')
            ->where('id', $record->id)
            ->update(['last_used_at' => now()]);

        return [
            'number' => $data['pan'],
            'expiry' => $data['exp'],
            'last4'  => $record->last4,
            'brand'  => $record->brand,
        ];
    }
}
