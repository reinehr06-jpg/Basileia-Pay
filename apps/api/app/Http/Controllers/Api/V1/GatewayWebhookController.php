<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\GatewayWebhookEvent;
use App\Services\Webhooks\GatewayWebhookNormalizer;
use App\Services\Webhooks\GatewayWebhookHandler;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;

class GatewayWebhookController extends Controller
{
    /**
     * Endpoint unificado para recebimento de webhooks de qualquer gateway.
     */
    public function handle(
        Request $request, 
        string $provider, 
        GatewayWebhookNormalizer $normalizer,
        GatewayWebhookHandler $handler
    ): JsonResponse {
        $payload = $request->all();
        
        // 1. Validação de segurança básica (exemplo Asaas)
        if ($provider === 'asaas') {
            $token = $request->header('asaas-access-token');
            // Em produção, verificaríamos o token da GatewayAccount correspondente
            if (!$token) {
                 Log::warning("Webhook Asaas recebido sem token.");
            }
        }

        try {
            // 2. Normalizar o evento
            $normalized = $normalizer->normalize($provider, $payload);
            
            $gatewayEventId = $normalized['gateway_event_id'] ?? Str::random(16);

            // 3. Idempotência (Evitar reprocessar o mesmo ID do gateway)
            if (GatewayWebhookEvent::where('gateway_event_id', $gatewayEventId)->exists()) {
                return response()->json(['status' => 'already_processed']);
            }

            // 4. Registrar o evento recebido
            $event = GatewayWebhookEvent::create([
                'uuid'             => Str::uuid(),
                'company_id'       => 1, // Idealmente resolvido pelo accountUuid na rota
                'gateway'          => $provider,
                'gateway_event_id' => $gatewayEventId,
                'event_type'       => $normalized['event_type'],
                'payload_masked'   => $payload,
                'status'           => 'received',
            ]);

            // 5. Processar imediatamente (ou via Job)
            $handler->handle($normalized);

            $event->update(['status' => 'processed']);

            return response()->json(['success' => true, 'event_id' => $event->uuid]);

        } catch (\Exception $e) {
            Log::error("Falha ao processar webhook {$provider}: " . $e->getMessage());
            return response()->json(['error' => 'Webhook processing failed'], 500);
        }
    }
}
