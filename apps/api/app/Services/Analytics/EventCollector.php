<?php

namespace App\Services\Analytics;

use App\Jobs\ProcessAnalyticsEventJob;
use Illuminate\Support\Facades\Log;

class EventCollector
{
    /**
     * Coleta um evento de analytics e o envia para processamento assíncrono.
     */
    public function collect(string $type, array $data): void
    {
        try {
            // Garantir campos básicos
            $payload = array_merge([
                'event_type' => $type,
                'occurred_at' => now()->toDateTimeString(),
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent(),
            ], $data);

            // Despachar para fila
            ProcessAnalyticsEventJob::dispatch($payload)->onQueue('analytics');

        } catch (\Exception $e) {
            // Falha silenciosa para não quebrar o fluxo principal
            Log::error("Falha ao coletar evento de analytics [{$type}]: " . $e->getMessage());
        }
    }
}
