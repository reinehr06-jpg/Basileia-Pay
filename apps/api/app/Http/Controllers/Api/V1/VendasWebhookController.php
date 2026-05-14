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
        try {
            // The api.auth middleware might have already verified the ck_live_ key
            $integration = $request->get('integration');

            // Fallback: If middleware was bypassed (e.g. diagnostic routes), try manual lookup
            if (!$integration) {
                $apiKey = $request->header('X-API-Key') ?? $request->header('Authorization');
                if (str_starts_with($apiKey, 'Bearer ')) {
                    $apiKey = substr($apiKey, 7);
                }

                if ($apiKey) {
                    $integration = \App\Models\Integration::where('api_key_hash', hash('sha256', $apiKey))
                        ->where('status', 'active')
                        ->first();
                }
            }

            if (!$integration) {
                Log::warning('Vendas Webhook: Integration context not found', [
                    'headers' => $request->headers->all(),
                    'params' => $request->all(),
                ]);
                return response()->json(['error' => 'Integration context not found. Ensure X-API-Key is sent.'], 401);
            }

            $signature = $request->header('X-Checkout-Signature') ?? $request->header('X-Hub-Signature-256');
            if (str_starts_with($signature, 'sha256=')) {
                $signature = substr($signature, 7);
            }

            $secret = $integration->webhook_secret;

            if ($secret && $signature) {
                $rawBody = $request->getContent();
                $expectedSignature = hash_hmac('sha256', $rawBody, $secret);

                // FIXED: Use standardized JSON format for fallback check
                $jsonPayload = json_encode($request->all(), JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
                $expectedJsonSignature = hash_hmac('sha256', $jsonPayload, $secret);

                if (!hash_equals($expectedSignature, $signature) && !hash_equals($expectedJsonSignature, $signature)) {
                    Log::emergency('Vendas Webhook: Invalid signature', [
                        'integration_id' => $integration->id,
                        'received' => $signature,
                        'expected_raw' => $expectedSignature,
                        'expected_json' => $expectedJsonSignature,
                    ]);

                    return response()->json([
                        'error' => 'Invalid signature',
                    ], 401);
                }
            }

            // Process the payload
            $payload = $request->all();

            // Generate a secure, tokenized transaction record for this notification
            $transaction = \App\Models\Transaction::create([
                'uuid' => (string) \Illuminate\Support\Str::uuid(),
                'company_id' => $integration->company_id,
                'integration_id' => $integration->id,
                'asaas_payment_id' => $payload['asaas_payment_id'] ?? null,
                'source' => 'vendas_webhook',
                'amount' => $payload['valor'] ?? 0,
                'description' => $payload['plano'] ?? 'Pagamento Basiléia',
                'status' => 'pending',
                'customer_name' => $payload['cliente'] ?? '',
                'customer_email' => $payload['email'] ?? '',
                'customer_document' => $payload['documento'] ?? '',
                'customer_phone' => $payload['whatsapp'] ?? '',
            ]);

            Log::info('Vendas Webhook received and tokenized', [
                'integration_id' => $integration->id,
                'transaction_uuid' => $transaction->uuid,
                'event' => $payload['event'] ?? 'unknown'
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Notification received and link tokenized',
                'checkout_url' => route('checkout.show', $transaction->uuid),
                'short_url' => route('checkout.short', $transaction->asaas_payment_id ?? 'none')
            ]);

        } catch (\Exception $e) {
            Log::error('Vendas Webhook Exception: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'Internal Server Error'
            ], 500);
        }
    }
}
