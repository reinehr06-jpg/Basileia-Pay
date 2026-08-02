<?php

namespace App\Services\Security;

use Illuminate\Support\Facades\DB;
use Illuminate\Http\JsonResponse;

class IdempotencyService
{
    /**
     * Tenta resolver uma requisição via idempotência.
     * Retorna a resposta salva se existir, ou null se for uma nova requisição.
     */
    public function check(int $companyId, string $key, array $payload): ?JsonResponse
    {
        $hash = hash('sha256', json_encode($payload));

        try {
            DB::table('idempotency_keys')->insert([
                'company_id' => $companyId,
                'key' => $key,
                'request_hash' => $hash,
                'created_at' => now(),
                'updated_at' => now(),
                'expires_at' => now()->addHours(24),
            ]);
            return null;
        } catch (\Illuminate\Database\QueryException $e) {
            if ($e->getCode() === '23505' || $e->getCode() === '23000') {
                $record = DB::table('idempotency_keys')
                    ->where('company_id', $companyId)
                    ->where('key', $key)
                    ->first();

                if ($record) {
                    if ($record->request_hash !== $hash) {
                        return response()->json([
                            'error' => 'Idempotency key used with different payload'
                        ], 409);
                    }

                    if (!$record->response_payload) {
                        return response()->json([
                            'error' => 'Request in progress'
                        ], 425);
                    }

                    return response()->json(
                        json_decode($record->response_payload, true),
                        $record->status_code
                    );
                }
            }
            throw $e;
        }
    }

    /**
     * Salva a resposta de uma requisição processada com sucesso.
     */
    public function save(int $companyId, string $key, JsonResponse $response): void
    {
        DB::table('idempotency_keys')
            ->where('company_id', $companyId)
            ->where('key', $key)
            ->update([
                'response_payload' => json_encode($response->getData()),
                'status_code' => $response->getStatusCode(),
                'updated_at' => now(),
            ]);
    }
}
