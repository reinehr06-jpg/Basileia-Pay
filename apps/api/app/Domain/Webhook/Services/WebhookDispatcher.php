<?php

namespace App\Domain\Webhook\Services;

use App\Models\WebhookEndpoint;
use App\Models\WebhookDelivery;
use App\Jobs\SendWebhookDeliveryJob;
use Illuminate\Support\Str;

class WebhookDispatcher
{
    public function dispatch(int $systemId, string $eventType, array $data): void
    {
        $endpoints = WebhookEndpoint::where('system_id', $systemId)
            ->where('status', 'active')
            ->whereJsonContains('events', $eventType)
            ->get();

        foreach ($endpoints as $endpoint) {
            $delivery = WebhookDelivery::create([
                'uuid'             => Str::uuid(),
                'company_id'       => $endpoint->company_id,
                'endpoint_id'      => $endpoint->id,
                'event_type'       => $eventType,
                'idempotency_key'  => Str::uuid(),
                'payload_masked'   => $this->maskPayload($data),
                'status'           => 'pending',
            ]);

            SendWebhookDeliveryJob::dispatch($delivery->id);
        }
    }

    private function maskPayload(array $data): array
    {
        return $data; // Add masking logic if needed for outgoing hooks
    }
}
