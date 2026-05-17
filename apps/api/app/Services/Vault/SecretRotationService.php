<?php

namespace App\Services\Vault;

use App\Models\GatewayCredential;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class SecretRotationService
{
    protected $vault;

    public function __construct(VaultService $vault)
    {
        $this->vault = $vault;
    }

    /**
     * Rotaciona todos os segredos para a nova versão da chave.
     */
    public function rotateAll(): int
    {
        $credentials = GatewayCredential::all();
        $count = 0;

        DB::beginTransaction();
        try {
            foreach ($credentials as $cred) {
                // 1. Descriptografar com chave antiga
                $plain = $this->vault->decrypt($cred->encrypted_value, $cred->key_version ?? 'v1');

                // 2. Recriptografar com chave nova (VaultService.encrypt usa a chave atual)
                $newSecret = $this->vault->encrypt($plain);

                // 3. Atualizar
                $cred->update([
                    'encrypted_value' => $newSecret['encrypted_value'],
                    'key_version' => $newSecret['key_version'],
                    'rotated_at' => now(),
                ]);

                $count++;
            }

            DB::commit();
            return $count;
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Falha na rotação de chaves do Vault: " . $e->getMessage());
            throw $e;
        }
    }
}
