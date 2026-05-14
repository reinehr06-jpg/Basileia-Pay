<?php

namespace App\Services\Webhooks;

use App\Models\ConnectedSystem;
use App\Models\WebhookDelivery;
use App\Jobs\SendOriginWebhookJob;
use Illuminate\Support\Str;

class WebhookDispatcher
{
    /**
     * Despacha um evento de webhook para o sistema de origem.
     */
    public function dispatch(ConnectedSystem $system, string $event, array $payload)
    {
        // 1. Localizar o endpoint ativo para o sistema
        $endpoint = $system->webhooks()->where('status', 'active')->first();

        if (!$endpoint) {
            return null;
        }

        // 2. Verificar se o endpoint assina este evento
        if ($endpoint->events && !in_array($event, $endpoint->events)) {
            // Se houver lista de eventos e este não estiver nela, ignora
            // Mas se for null, assume que assina todos (padrão V1)
        }

        // 3. Criar o registro de entrega
        $delivery = WebhookDelivery::create([
            'uuid'                => (string) Str::uuid(),
            'connected_system_id' => $system->id,
            'webhook_endpoint_id' => $endpoint->id,
            'event'               => $event,
            'payload_masked'      => $payload,
            'status'              => 'pending',
            'attempts'            => 0,
        ]);

        // 4. Enfileirar o disparo
        SendOriginWebhookJob::dispatch($delivery);

        return $delivery;
    }
}
