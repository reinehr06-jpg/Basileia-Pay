<?php

namespace App\Services\Webhooks;

use App\Models\PaymentAttempt;
use App\Models\Payment;
use App\Models\PaymentEvent;
use App\Models\CheckoutSession;
use App\Models\Order;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class GatewayWebhookHandler
{
    public function handle(GatewayWebhookEvent $event): void
    {
        // Pega o valor mascarado, que deveria ser um JSON ou Array da request
        $payload = is_array($event->payload_masked) ? $event->payload_masked : json_decode($event->payload_masked, true);

        // Extrai o ID do Gateway
        // Dependendo de como o Normalizer grava, pode estar em payload.id
        // Para garantir, vamos repassar o webhook inteiro para o PaymentService do Motor B
        
        $paymentService = app(\App\Services\Financial\PaymentService::class);
        
        // Tentar extrair valor pago do evento, útil para F8
        // Para PIX Asaas, geralmente vem em value ou netValue.
        // Vamos extrair o gatewayTransactionId do payload
        $gatewayTransactionId = $payload['payment']['id'] ?? $payload['id'] ?? $payload['data']['id'] ?? null;
        $paidAmount = $payload['payment']['value'] ?? $payload['value'] ?? $payload['data']['amount'] ?? null;
        
        if (!$gatewayTransactionId) {
            Log::warning("Webhook Handler: Não foi possível identificar o gatewayTransactionId no payload", ['event' => $event->uuid]);
            return;
        }

        try {
            $paymentService->handleGatewayConfirmation($gatewayTransactionId, $payload, $paidAmount);
            
            // Marca evento como processado
            $event->update(['status' => 'processed']);
            
        } catch (\Exception $e) {
            Log::error("Erro no processamento da confirmação de pagamento: " . $e->getMessage());
            throw $e;
        }
    }
}
