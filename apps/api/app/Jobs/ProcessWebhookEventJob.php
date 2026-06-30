<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use App\Models\GatewayWebhookEvent;
use App\Models\GatewayAccount;
use App\Models\Transaction;
use Illuminate\Support\Facades\Log;
use Exception;

class ProcessWebhookEventJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $tries = 5;
    public $backoff = [10, 60, 300, 1800, 3600]; // Exponential backoff

    public function __construct(
        public readonly GatewayWebhookEvent $eventRecord,
        public readonly GatewayAccount $gatewayAccount
    ) {}

    public function handle(): void
    {
        if ($this->eventRecord->processed_at !== null) {
            Log::info("Webhook event {$this->eventRecord->id} already processed.");
            return; // Idempotent
        }

        $this->eventRecord->update(['status' => 'processing', 'retry_count' => $this->attempts()]);

        try {
            // Process the business logic. 
            // We use the normalized status and payment ID mapped by the driver.
            $payload = $this->eventRecord->payload_masked;
            
            // Re-resolve driver to get normalized event again if not saved in table
            $registry = app(\App\Services\Gateway\GatewayDriverRegistry::class);
            $driverInstance = $registry->resolve($this->gatewayAccount);
            $normalizedEvent = $driverInstance->parseWebhookEvent($payload);

            // Invoca o serviço financeiro que possui lock transacional e tratamento idempotente
            if ($normalizedEvent->status === 'paid' || $normalizedEvent->status === 'confirmed') {
                $paymentService = app(\App\Services\Financial\PaymentService::class);
                $paymentService->handleGatewayConfirmation($normalizedEvent->gatewayPaymentId, $payload);
            } else {
                Log::info("Webhook status is {$normalizedEvent->status}, not triggering confirmation logic yet for payment: {$normalizedEvent->gatewayPaymentId}");
                // Poderíamos tratar 'failed', 'refunded' etc com transições específicas se necessário
            }

            $this->eventRecord->update([
                'status' => 'processed',
                'processed_at' => now(),
            ]);

        } catch (Exception $e) {
            $this->eventRecord->update(['status' => 'failed']);
            Log::error("Failed to process webhook event {$this->eventRecord->id}: " . $e->getMessage());
            throw $e; // Rethrow to trigger retry mechanisms
        }
    }
}
