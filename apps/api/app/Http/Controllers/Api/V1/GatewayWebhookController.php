<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\GatewayAccount;
use App\Jobs\ProcessAsaasWebhookJob;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class GatewayWebhookController extends Controller
{
    /**
     * Recebe webhooks de gateways externos.
     */
    public function handle(Request $request, $provider, $accountUuid = null)
    {
        // 1. Validar o provedor
        if (!in_array($provider, ['asaas', 'itau', 'stripe'])) {
            return response()->json(['error' => 'Provedor desconhecido'], 400);
        }

        // 2. Tentar localizar a conta se o UUID for passado
        $gatewayAccount = null;
        if ($accountUuid) {
            $gatewayAccount = GatewayAccount::where('uuid', $accountUuid)->first();
        }

        // 3. Log do evento bruto (Sanitizado na V2)
        Log::info("Webhook recebido de {$provider}", [
            'payload' => $request->all(),
            'headers' => $request->headers->all()
        ]);

        // 4. Despachar para o Job específico do provedor
        switch ($provider) {
            case 'asaas':
                ProcessAsaasWebhookJob::dispatch($request->all(), $gatewayAccount);
                break;
            
            default:
                return response()->json(['error' => 'Provedor não implementado'], 501);
        }

        return response()->json(['status' => 'received']);
    }
}
