<?php

namespace App\Services\Webhooks;

use App\Jobs\DeliverWebhookJob;
use App\Models\WebhookEndpoint;
use App\Models\WebhookDelivery;
use Illuminate\Support\Str;

class WebhookDispatcher
{
    /**
     * Dispara eventos para os endpoints configurados de uma empresa.
     */
    public function dispatch(int $companyId, string $event, array $data): void
    {
        $endpoints = WebhookEndpoint::where('company_id', $companyId)
            ->where('active', true)
            ->get();

        foreach ($endpoints as $endpoint) {
            // Filtrar eventos se houver configuração específica (v2)
            
            $this->send($endpoint, $event, $data);
        }
    }

    /**
     * Envia o payload para um endpoint específico.
     */
    protected function send(WebhookEndpoint $endpoint, string $event, array $data): void
    {
        $deliveryId = 'whd_' . Str::random(16);
        $timestamp = time();
        $payload = [
            'id' => $deliveryId,
            'event' => $event,
            'created_at' => date('Y-m-d H:i:s', $timestamp),
            'data' => $data,
        ];

        $jsonPayload = json_encode($payload);
        $signature = hash_hmac('sha256', $timestamp . '.' . $jsonPayload, $endpoint->secret);

        $delivery = WebhookDelivery::create([
            'uuid'                => (string) Str::uuid(),
            'company_id'          => $endpoint->company_id,
            'webhook_endpoint_id' => $endpoint->id,
            'event'               => $event,
            'payload'             => $payload,
            'status'              => 'pending',
            'attempt_count'       => 1,
        ]);

        DeliverWebhookJob::dispatch($delivery, $endpoint, $signature);
    }
}
