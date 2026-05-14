<?php

namespace App\Services;

use App\Models\SourceConfig;
use App\Models\Transaction;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class WebhookNotifierService
{
    public function notify(Transaction $transaction): void
    {
        $source = $transaction->source;
        
        if (!$source) {
            Log::warning('WebhookNotifier: No source configured', [
                'transaction_id' => $transaction->id,
            ]);
            return;
        }

        $config = SourceConfig::where('source_name', $source)->first();
        
        if (!$config || !$config->isActive()) {
            Log::warning('WebhookNotifier: Source config not found or inactive', [
                'source' => $source,
            ]);
            return;
        }

        $event = $this->mapEvent($transaction->status);
        
        $payload = [
            'event' => $event,
            'asaas_payment_id' => $transaction->asaas_payment_id,
            'external_id' => $transaction->external_id,
            'amount' => (float) $transaction->amount,
            'status' => $transaction->status,
            'paid_at' => $transaction->paid_at?->toIso8601String(),
            'source' => $source,
        ];

        $signature = hash_hmac('sha256', json_encode($payload), $config->webhook_secret);

        try {
            $response = Http::withHeaders([
                'X-Checkout-Signature' => $signature,
                'Content-Type' => 'application/json',
            ])->timeout(30)->post($config->callback_url, $payload);

            Log::info('WebhookNotifier: Notification sent', [
                'source' => $source,
                'event' => $event,
                'status' => $response->status(),
            ]);
        } catch (\Exception $e) {
            Log::error('WebhookNotifier: Failed to send notification', [
                'source' => $source,
                'error' => $e->getMessage(),
            ]);
        }
    }

    private function mapEvent(string $status): string
    {
        return match ($status) {
            'approved' => 'PAYMENT_APPROVED',
            'refused' => 'PAYMENT_REFUSED',
            'overdue' => 'PAYMENT_OVERDUE',
            'cancelled' => 'PAYMENT_CANCELED',
            'refunded' => 'PAYMENT_REFUNDED',
            default => 'PAYMENT_UNKNOWN',
        };
    }
}