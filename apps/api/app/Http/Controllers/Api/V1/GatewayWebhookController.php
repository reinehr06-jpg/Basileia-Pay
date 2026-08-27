<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\GatewayAccount;
use App\Models\GatewayWebhookEvent;
use App\Services\Webhooks\GatewayWebhookNormalizer;
use App\Services\Webhooks\GatewayWebhookHandler;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class GatewayWebhookController extends Controller
{
    public function handle(
        Request $request,
        string $provider,
        ?string $accountUuid = null,
        GatewayWebhookNormalizer $normalizer,
        GatewayWebhookHandler $handler
    ): JsonResponse {
        $payload = $request->all();
        $rawBody = $request->getContent();

        // 1. Resolver gateway account
        if ($accountUuid) {
            $gateway = GatewayAccount::where('uuid', $accountUuid)->first();
        }

        if (!$gateway) {
            Log::warning("Webhook {$provider}: gateway não resolvido, rejeitando");
            return response()->json(['error' => 'Gateway account not found'], 404);
        }

        // 2. Verificar assinatura do webhook
        $verified = $this->verifySignature($request, $provider, $gateway, $rawBody);
        if (!$verified) {
            Log::warning("Webhook {$provider}: assinatura inválida", ['uuid' => $accountUuid]);
            return response()->json(['error' => 'Invalid signature'], 401);
        }
        
        if (!$this->verifyProviderToken($request, $provider)) {
            return response()->json(['error' => 'Invalid provider token'], 401);
        }

        try {
            // 3. Normalizar o evento
            $normalized = $normalizer->normalize($provider, $payload);

            $gatewayEventId = $normalized['gateway_event_id'] ?? Str::random(16);

            // 4. Idempotência
            if (GatewayWebhookEvent::where('gateway_event_id', $gatewayEventId)->exists()) {
                return response()->json(['status' => 'already_processed']);
            }

            // 5. Normalizar payload (Mascarar PII F12)
            $maskedPayload = $payload;
            foreach (['customer_name', 'name', 'email', 'cpf', 'cnpj', 'document', 'cardNumber', 'creditCard'] as $field) {
                if (isset($maskedPayload[$field]) || isset($maskedPayload['data'][$field])) {
                    if (isset($maskedPayload[$field])) $maskedPayload[$field] = '***';
                    if (isset($maskedPayload['data'][$field])) $maskedPayload['data'][$field] = '***';
                }
            }

            // 6. Registrar evento
            $event = GatewayWebhookEvent::create([
                'uuid'             => Str::uuid(),
                'company_id'       => $gateway->company_id,
                'gateway'          => $provider,
                'gateway_event_id' => $gatewayEventId,
                'event_type'       => $normalized['event_type'],
                'payload_masked'   => $maskedPayload,
                'status'           => 'received',
            ]);

            // 7. Enfileirar processamento assíncrono (F5)
            \App\Jobs\ProcessGatewayWebhookJob::dispatch($event);

            return response()->json(['success' => true, 'event_id' => $event->uuid]);

        } catch (\Exception $e) {
            Log::error("Falha ao processar webhook {$provider}: " . $e->getMessage());
            return response()->json(['error' => 'Webhook processing failed'], 500);
        }
    }

    private function verifySignature(Request $request, string $provider, GatewayAccount $gateway, string $rawBody): bool
    {
        $secret = $this->getWebhookSecret($gateway);

        if (!$secret) {
            // F2: Nunca retornar true no fallback. Uma falha de checagem deve falhar!
            return false;
        }

        return match ($provider) {
            'stripe' => $this->verifyStripeSignature($request, $secret, $rawBody),
            'asaas' => $this->verifyAsaasSignature($request, $secret),
            default => $this->verifyHmacSignature($request, $secret, $rawBody),
        };
    }

    private function verifyStripeSignature(Request $request, string $secret, string $rawBody): bool
    {
        Log::warning('Stripe webhook support is disabled due to missing library');
        return false;
    }

    private function verifyAsaasSignature(Request $request, string $secret): bool
    {
        $token = $request->header('asaas-access-token');
        if (!$token) return false;

        return hash_equals($secret, $token);
    }

    private function verifyHmacSignature(Request $request, string $secret, string $rawBody): bool
    {
        $signature = $request->header('X-Webhook-Signature')
            ?? $request->header('X-Hub-Signature-256')
            ?? $request->header('X-Signature');

        if (!$signature) return false;

        $expected = hash_hmac('sha256', $rawBody, $secret);
        return hash_equals($expected, $signature);
    }

    private function verifyProviderToken(Request $request, string $provider): bool
    {
        if ($provider === 'asaas') {
            $token = $request->header('asaas-access-token');
            if (!$token) {
                Log::warning("Webhook Asaas rejeitado: sem token de acesso.");
                return false;
            }
        }
        return true;
    }

    private function getWebhookSecret(GatewayAccount $gateway): ?string
    {
        try {
            $encryptionService = app(\App\Security\Encryption\EncryptionService::class);
            $decrypted = $encryptionService->decrypt($gateway->credentials_encrypted);
            $credentials = json_decode($decrypted, true);
            return $credentials['webhook_secret']
                ?? $credentials['webhookKey']
                ?? $credentials['webhook_key']
                ?? null;
        } catch (\Exception $e) {
            return null;
        }
    }
}
