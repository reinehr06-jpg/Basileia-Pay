<?php

namespace App\Jobs;

use App\Models\WebhookDelivery;
use App\Security\Encryption\EncryptionService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Http;

class SendWebhookDeliveryJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $queue    = 'webhooks';
    public $tries    = 5;
    public $backoff  = [0, 30, 300, 3600, 86400]; // 0s, 30s, 5min, 1h, 24h

    public function __construct(public int $deliveryId)
    {}

    public function handle(EncryptionService $encryption): void
    {
        $delivery = WebhookDelivery::findOrFail($this->deliveryId);
        $endpoint = $delivery->endpoint; // Assuming relationship exists

        $secret    = $encryption->decrypt($endpoint->secret_hash);
        $timestamp = now()->timestamp;
        $payload   = $delivery->payload_masked; // in a real app, store full payload elsewhere if masked, or use masked if sufficient
        $body      = json_encode($payload);

        $signature = hash_hmac('sha256', "{$timestamp}.{$body}", $secret);

        $start    = microtime(true);
        $response = Http::withHeaders([
            'Content-Type'              => 'application/json',
            'X-Basileia-Event-Id'       => $delivery->uuid,
            'X-Basileia-Timestamp'      => $timestamp,
            'X-Basileia-Signature'      => "v1={$signature}",
            'X-Basileia-Delivery-Id'    => $delivery->uuid,
        ])
        ->timeout(10)
        ->post($endpoint->url, $payload);

        $latency = round((microtime(true) - $start) * 1000);

        if ($response->successful()) {
            $delivery->update([
                'status'       => 'delivered',
                'http_status'  => $response->status(),
                'attempts'     => $delivery->attempts + 1,
                'delivered_at' => now(),
            ]);
            $endpoint->update([
                'failure_count'           => 0,
                'last_delivery_at'        => now(),
                'last_delivery_status'    => 'success',
            ]);
        } else {
            $delivery->increment('attempts');
            $delivery->update(['http_status' => $response->status()]);

            if ($delivery->attempts >= 5) {
                $delivery->update(['status' => 'dead_letter']);
            } else {
                $this->release($this->backoff[$delivery->attempts] ?? 86400);
            }
        }
    }
}
