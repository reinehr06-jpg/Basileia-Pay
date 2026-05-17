<?php

namespace App\Services\Webhooks;

use App\Models\WebhookEndpoint;
use App\Models\WebhookDelivery;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
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

        try {
            $response = Http::withHeaders([
                'X-Basileia-Signature' => 'sha256=' . $signature,
                'X-Basileia-Event' => $event,
                'X-Basileia-Delivery-ID' => $deliveryId,
                'Content-Type' => 'application/json',
            ])->timeout(10)->post($endpoint->url, $payload);

            $delivery->update([
                'status' => $response->successful() ? 'success' : 'failed',
                'response_status' => $response->status(),
                'response_body' => $response->body(),
            ]);

        } catch (\Exception $e) {
            Log::error("Falha no envio de webhook [{$deliveryId}]: " . $e->getMessage());
            $delivery->update([
                'status' => 'failed',
                'response_body' => $e->getMessage(),
            ]);
        }
    }
}
