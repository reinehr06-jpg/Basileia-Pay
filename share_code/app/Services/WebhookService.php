<?php

namespace App\Services;

use App\Models\Company;
use App\Models\WebhookDelivery;
use App\Models\WebhookEndpoint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class WebhookService
{
    public function dispatch(string $eventType, array $payload, Company $company): void
    {
        $endpoints = WebhookEndpoint::where('company_id', $company->id)
            ->where('is_active', true)
            ->get();

        foreach ($endpoints as $endpoint) {
            if (!$this->endpointMatchesEvent($endpoint, $eventType)) {
                continue;
            }

            $delivery = WebhookDelivery::create([
                'webhook_endpoint_id' => $endpoint->id,
                'company_id' => $company->id,
                'event_type' => $eventType,
                'payload' => $payload,
                'status' => 'pending',
                'next_retry_at' => now(),
            ]);

            dispatch(function () use ($delivery, $endpoint) {
                $this->deliver($delivery);
            })->onQueue('webhooks');
        }
    }

    public function deliver(WebhookDelivery $delivery): bool
    {
        $endpoint = $delivery->endpoint;

        if (!$endpoint || !$endpoint->is_active) {
            $delivery->update(['status' => 'failed', 'error_message' => 'Endpoint is inactive.']);
            return false;
        }

        $payload = $delivery->payload;
        $signature = $this->generateSignature($payload, $endpoint->secret);

        $delivery->update(['attempted_at' => now()]);

        try {
            $response = Http::timeout(30)
                ->withHeaders([
                    'Content-Type' => 'application/json',
                    'X-Webhook-Signature' => $signature,
                    'X-Webhook-Event' => $delivery->event_type,
                    'X-Webhook-Delivery' => $delivery->uuid,
                ])
                ->post($endpoint->url, $payload);

            $success = $response->successful();

            $delivery->update([
                'status' => $success ? 'delivered' : 'failed',
                'response_status_code' => $response->status(),
                'response_body' => mb_substr($response->body(), 0, 4096),
                'error_message' => $success ? null : "HTTP {$response->status()}",
                'completed_at' => $success ? now() : null,
            ]);

            if (!$success) {
                $this->scheduleRetry($delivery);
            }

            return $success;
        } catch (\Throwable $e) {
            Log::error('Webhook delivery failed', [
                'delivery' => $delivery->uuid,
                'endpoint' => $endpoint->url,
                'error' => $e->getMessage(),
            ]);

            $delivery->update([
                'status' => 'failed',
                'error_message' => $e->getMessage(),
            ]);

            $this->scheduleRetry($delivery);

            return false;
        }
    }

    public function retry(WebhookDelivery $delivery): bool
    {
        $delivery->increment('attempts');

        $delivery->update([
            'next_retry_at' => $this->calculateNextRetry($delivery->attempts),
        ]);

        return $this->deliver($delivery);
    }

    public function retryFailed(): void
    {
        $deliveries = WebhookDelivery::where('status', 'failed')
            ->where('next_retry_at', '<=', now())
            ->where('attempts', '<', 5)
            ->with('endpoint')
            ->get();

        foreach ($deliveries as $delivery) {
            try {
                $this->retry($delivery);
            } catch (\Throwable $e) {
                Log::error('Webhook retry failed', [
                    'delivery' => $delivery->uuid,
                    'error' => $e->getMessage(),
                ]);
            }
        }
    }

    public function generateSignature(array $payload, string $secret): string
    {
        return 'sha256=' . hash_hmac('sha256', json_encode($payload), $secret);
    }

    private function endpointMatchesEvent(WebhookEndpoint $endpoint, string $eventType): bool
    {
        if (empty($endpoint->events) || in_array('*', $endpoint->events)) {
            return true;
        }

        foreach ($endpoint->events as $pattern) {
            if ($pattern === $eventType) {
                return true;
            }

            if (str_ends_with($pattern, '*') && str_starts_with($eventType, rtrim($pattern, '*'))) {
                return true;
            }
        }

        return false;
    }

    private function scheduleRetry(WebhookDelivery $delivery): void
    {
        if ($delivery->attempts >= 5) {
            $delivery->update(['status' => 'abandoned']);
            return;
        }

        $delivery->update([
            'next_retry_at' => $this->calculateNextRetry($delivery->attempts + 1),
        ]);
    }

    private function calculateNextRetry(int $attempt): \Carbon\Carbon
    {
        $minutes = pow(2, $attempt) * 5;

        return now()->addMinutes(min($minutes, 240));
    }
}
