<?php

namespace App\Jobs;

use App\Models\WebhookDelivery;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SendOriginWebhookJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $delivery;
    public $tries = 5;
    public $backoff = [60, 300, 600, 3600]; // 1min, 5min, 10min, 1h

    public function __construct(WebhookDelivery $delivery)
    {
        $this->delivery = $delivery;
    }

    public function handle(): void
    {
        $endpoint = $this->delivery->endpoint;
        
        if (!$endpoint || $endpoint->status !== 'active') {
            $this->delivery->update(['status' => 'cancelled']);
            return;
        }

        $payload = $this->delivery->payload_masked;
        $timestamp = time();
        
        // Preparar requisição
        $request = Http::withHeaders([
            'User-Agent' => 'Basileia-Pay-Webhook/1.0',
            'Content-Type' => 'application/json',
            'X-Basileia-Event' => $this->delivery->event,
            'X-Basileia-Timestamp' => $timestamp,
        ]);

        // Adicionar assinatura HMAC se houver secret
        if ($endpoint->secret_hash) {
            $signature = hash_hmac('sha256', $timestamp . '.' . json_encode($payload), $endpoint->secret_hash);
            $request = $request->withHeaders(['X-Basileia-Signature' => $signature]);
        }

        try {
            $response = $request->post($endpoint->url, $payload);

            $this->delivery->attempts++;
            
            if ($response->successful()) {
                $this->delivery->update([
                    'status' => 'delivered',
                    'last_response_code' => $response->status(),
                    'last_response_body_masked' => $response->body(),
                    'delivered_at' => now(),
                ]);
            } else {
                $this->delivery->update([
                    'status' => 'retrying',
                    'last_response_code' => $response->status(),
                    'last_response_body_masked' => $response->body(),
                ]);
                
                $this->release($this->backoff[$this->delivery->attempts - 1] ?? 3600);
            }

        } catch (\Exception $e) {
            $this->delivery->attempts++;
            $this->delivery->update([
                'status' => 'failed',
                'last_response_body_masked' => $e->getMessage(),
            ]);

            Log::error("Falha no Webhook Basileia: " . $e->getMessage());
            
            if ($this->delivery->attempts < $this->tries) {
                $this->release($this->backoff[$this->delivery->attempts - 1] ?? 3600);
            }
        }
    }
}
