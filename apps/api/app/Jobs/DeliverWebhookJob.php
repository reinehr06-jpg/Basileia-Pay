<?php

namespace App\Jobs;

use App\Models\WebhookDelivery;
use App\Models\WebhookEndpoint;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class DeliverWebhookJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $tries = 3;

    public function __construct(
        public WebhookDelivery $delivery,
        public WebhookEndpoint $endpoint,
        public string $signature
    ) {}

    public function handle(): void
    {
        try {
            $response = Http::withHeaders([
                'X-Basileia-Signature' => 'sha256=' . $this->signature,
                'X-Basileia-Event' => $this->delivery->event,
                'X-Basileia-Delivery-ID' => $this->delivery->payload['id'],
                'Content-Type' => 'application/json',
            ])->timeout(10)->post($this->endpoint->url, $this->delivery->payload);

            $this->delivery->update([
                'status' => $response->successful() ? 'success' : 'failed',
                'response_status' => $response->status(),
                'response_body' => $response->body(),
            ]);

            if (!$response->successful()) {
                $this->release(60 * $this->attempts());
            }

        } catch (\Exception $e) {
            Log::error("Falha no envio de webhook [{$this->delivery->payload['id']}]: " . $e->getMessage());
            $this->delivery->update([
                'status' => 'failed',
                'response_body' => $e->getMessage(),
            ]);
            $this->release(60 * $this->attempts());
        }
    }
}
