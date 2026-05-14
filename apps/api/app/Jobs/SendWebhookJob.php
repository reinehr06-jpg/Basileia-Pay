<?php

namespace App\Jobs;

use App\Models\WebhookDelivery;
use App\Models\WebhookEndpoint;
use App\Services\WebhookService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class SendWebhookJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 5;
    public int $timeout = 30;

    public function __construct(
        public string $eventType,
        public array $payload,
        public int $companyId
    ) {}

    public function handle(WebhookService $webhookService): void
    {
        $endpoints = WebhookEndpoint::whereHas('integration', function ($q) {
                $q->where('company_id', $this->companyId)->where('status', 'active');
            })
            ->where('status', 'active')
            ->get();

        foreach ($endpoints as $endpoint) {
            $events = $endpoint->events ?? [];
            if (!empty($events) && !in_array($this->eventType, $events)) {
                continue;
            }

            $delivery = WebhookDelivery::create([
                'endpoint_id' => $endpoint->id,
                'event_type' => $this->eventType,
                'payload' => $this->payload,
                'max_attempts' => $endpoint->retry_count ?? 5,
                'status' => 'pending',
            ]);

            $webhookService->deliver($delivery);
        }
    }
}
