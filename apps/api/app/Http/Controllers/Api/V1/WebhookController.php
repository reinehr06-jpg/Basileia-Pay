<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\GatewayAccount;
use App\Models\GatewayWebhookEvent;
use App\Services\Gateway\GatewayDriverRegistry;
use App\Jobs\ProcessWebhookEventJob;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class WebhookController extends Controller
{
    public function __construct(
        private readonly GatewayDriverRegistry $driverRegistry
    ) {}

    public function handle(Request $request, string $driver, string $accountId)
    {
        // 1. Fetch the GatewayAccount
        $gatewayAccount = GatewayAccount::with('company')->find($accountId);
        
        if (!$gatewayAccount || $gatewayAccount->gateway_type !== $driver) {
            Log::warning("Webhook received for unknown or mismatched gateway account: {$accountId}");
            return response()->json(['error' => 'Gateway not found'], 404);
        }

        $rawBody = $request->getContent();
        
        // 2. Resolve Driver & Verify Signature
        try {
            $driverInstance = $this->driverRegistry->resolve($gatewayAccount);
        } catch (\Exception $e) {
            Log::error("Failed to resolve driver for webhook: " . $e->getMessage());
            return response()->json(['error' => 'Internal Configuration Error'], 500);
        }

        $secret = $gatewayAccount->settings['webhook_secret'] ?? '';
        $signature = $request->header('asaas-signature') ?? $request->header('x-signature') ?? '';

        $isValid = $driverInstance->verifySignature($rawBody, $signature, $secret);

        // 3. Persist Event for Idempotency
        $payload = $request->all();
        $normalizedEvent = $driverInstance->parseWebhookEvent($payload);

        $eventRecord = GatewayWebhookEvent::firstOrCreate(
            [
                'company_id' => $gatewayAccount->company_id,
                'gateway' => $driver,
                'gateway_event_id' => $normalizedEvent->gatewayEventId,
            ],
            [
                'uuid' => (string) \Illuminate\Support\Str::uuid(),
                'event_type' => $normalizedEvent->eventType,
                'payload_masked' => $payload, 
                'status' => 'received',
                'signature_valid' => $isValid,
            ]
        );

        // If it was already processed, just return 200 (Idempotency)
        if ($eventRecord->processed_at !== null) {
            return response()->json(['message' => 'Already processed'], 200);
        }

        // If signature is invalid, we save it but do not process
        if (!$isValid) {
            Log::warning("Invalid webhook signature for gateway {$accountId}");
            $eventRecord->update(['status' => 'invalid_signature']);
            return response()->json(['error' => 'Invalid signature'], 401);
        }

        // 4. Dispatch Async Job
        ProcessWebhookEventJob::dispatch($eventRecord, $gatewayAccount);

        // 5. Immediate 200 OK
        return response()->json(['message' => 'Webhook queued successfully'], 200);
    }
}
