<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class VendasWebhookController extends Controller
{
    /**
     * Handle incoming webhooks from Basileia Vendas.
     * Verified via X-Checkout-Signature and api.auth middleware.
     */
    public function handle(Request $request)
    {
        // The api.auth middleware has already verified the ck_live_ key
        // and merged the 'integration' into the request.
        $integration = $request->get('integration');

        if (!$integration) {
            return response()->json(['error' => 'Integration context not found'], 401);
        }

        $signature = $request->header('X-Checkout-Signature');
        $secret = $integration->webhook_secret;

        if ($secret && $signature) {
            $rawBody = $request->getContent();
            $expectedSignature = hash_hmac('sha256', $rawBody, $secret);
            
            // Try fallback: sign request input if raw body didn't match
            $fallbackBody = json_encode($request->all(), JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
            $fallbackSignature = hash_hmac('sha256', $fallbackBody, $secret);

            if (!hash_equals($expectedSignature, $signature) && !hash_equals($fallbackSignature, $signature)) {
                Log::emergency('Vendas Webhook: Invalid signature', [
                    'integration_id' => $integration->id,
                    'expected_raw' => $expectedSignature,
                    'expected_json' => $fallbackSignature,
                    'received' => $signature,
                    'body_len' => strlen($rawBody),
                ]);

                return response()->json([
                    'error' => 'SIGNATURE_FAIL_DEBUG_MODE',
                    'debug' => [
                        'received_signature' => $signature,
                        'expected_if_raw' => $expectedSignature,
                        'expected_if_json' => $fallbackSignature,
                        'received_body_len' => strlen($rawBody),
                        'timestamp' => now()->toIso8601String()
                    ]
                ], 401);
            }
        }

        // Process the payload (e.g. sync settings, external status, etc.)
        $payload = $request->all();
        Log::info('Vendas Webhook received successfully', [
            'integration_id' => $integration->id,
            'event' => $payload['event'] ?? 'unknown'
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Notification received'
        ]);
    }
}
