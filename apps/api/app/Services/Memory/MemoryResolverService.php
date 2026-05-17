<?php

namespace App\Services\Memory;

use App\Models\CustomerMemory;
use Illuminate\Support\Facades\DB;

class MemoryResolverService
{
    /**
     * Resolve o contexto do comprador baseado no e-mail.
     */
    public function resolve(int $companyId, string $email): ?array
    {
        $memory = CustomerMemory::where('company_id', $companyId)
            ->where('email', $email)
            ->first();

        if (!$memory) return null;

        return [
            'preferred_method' => $memory->preferred_method,
            'last_card_brand'  => $memory->last_card_brand,
            'metadata'         => $memory->metadata,
            'is_recurring'     => true,
        ];
    }

    /**
     * Atualiza a memória do comprador após um pagamento.
     */
    public function learn(int $companyId, string $email, array $data): void
    {
        CustomerMemory::updateOrCreate(
            ['company_id' => $companyId, 'email' => $email],
            [
                'preferred_method' => $data['method'] ?? null,
                'last_card_brand'  => $data['card_brand'] ?? null,
                'last_seen_at'     => now(),
                'metadata'         => array_merge($data['metadata'] ?? [], [
                    'last_purchase_at' => now()->toDateTimeString(),
                ])
            ]
        );
    }
}
