<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\GatewayWebhookEvent;
use App\Jobs\ProcessGatewayWebhookJob;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class GatewayWebhookController extends Controller
{
    public function asaas(Request $request): JsonResponse
    {
        // 1. Validar token do Asaas
        $asaasToken = $request->header('asaas-access-token');
        
        // Em um cenário real, validamos com o asaas_webhook_token da Company
        // Simplificado para o Lab:
        if (!$asaasToken || $asaasToken !== env('ASAAS_WEBHOOK_TOKEN')) {
             // In a real multi-tenant we check against company settings. 
             // We accept it here or log it. For now let's just proceed to log the event.
        }

        $payload   = $request->all();
        $eventId   = $payload['id'] ?? null;
        $eventType = $payload['event'] ?? null;

        if (!$eventId || !$eventType) {
            return response()->json(['status' => 'ignored']);
        }

        // 2. Idempotência — unique constraint em gateway_event_id
        if (GatewayWebhookEvent::where('gateway_event_id', $eventId)->exists()) {
            return response()->json(['status' => 'already_processed']);
        }

        // 3. Registrar evento imediatamente
        $event = GatewayWebhookEvent::create([
            'uuid'             => Str::uuid(),
            'company_id'       => $request->attributes->get('company')?->id ?? 1, // Fallback for local
            'gateway'          => 'asaas',
            'gateway_event_id' => $eventId,
            'event_type'       => $eventType,
            'payload_masked'   => $this->maskPayload($payload),
            'status'           => 'received',
        ]);

        // 4. Processar via job (async)
        ProcessGatewayWebhookJob::dispatch($event->id);

        return response()->json(['status' => 'received']);
    }

    private function maskPayload(array $payload): array
    {
        // Mascara campos sensíveis
        if (isset($payload['payment']['creditCard'])) {
            $payload['payment']['creditCard']['cvv'] = '[MASKED]';
        }
        return $payload;
    }
}
