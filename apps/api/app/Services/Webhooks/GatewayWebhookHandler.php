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
    /**
     * Processa um evento normalizado de gateway.
     */
    public function handle(array $event): void
    {
        $gatewayPaymentId = $event['gateway_payment_id'];
        
        // 1. Localizar a tentativa de pagamento
        $attempt = PaymentAttempt::where('gateway_payment_id', $gatewayPaymentId)->first();

        if (!$attempt) {
            Log::warning("Webhook ignorado: PaymentAttempt não encontrado para gateway_payment_id: {$gatewayPaymentId}");
            return;
        }

        $payment = $attempt->payment;
        $order = $payment->order;
        $session = $payment->checkoutSession;

        DB::beginTransaction();
        try {
            // 2. Criar Evento de Pagamento
            PaymentEvent::create([
                'company_id'          => $payment->company_id,
                'payment_id'          => $payment->id,
                'payment_attempt_id'  => $attempt->id,
                'order_id'            => $order->id,
                'checkout_session_id' => $session->id,
                'event_type'          => 'webhook.received',
                'status_from'         => $payment->status,
                'status_to'           => $event['status'],
                'provider'            => $event['provider'],
                'gateway_payment_id'  => $gatewayPaymentId,
                'metadata_masked'     => $event['raw'] ?? [],
            ]);

            // 3. Atualizar estados se houver mudança
            if ($event['status'] === 'approved' || $event['status'] === 'paid') {
                $payment->update([
                    'status' => 'approved',
                    'paid_at' => $event['occurred_at'] ?? now(),
                ]);
                $order->update(['status' => 'paid']);
                $session->update(['status' => 'paid']);
            } elseif ($event['status'] === 'failed') {
                $payment->update(['status' => 'failed']);
            }

            DB::commit();

            // 4. Notificar sistema de origem (Outbound Webhook) - Implementado no próximo passo
            $this->dispatchOutbound($payment, $event['event_type']);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Erro ao processar webhook: " . $e->getMessage());
            throw $e;
        }
    }

    protected function dispatchOutbound(Payment $payment, string $eventType): void
    {
        $dispatcher = new WebhookDispatcher();
        
        $dispatcher->dispatch($payment->company_id, $eventType, [
            'order' => [
                'uuid' => $payment->order->uuid,
                'status' => $payment->order->status,
                'amount' => $payment->order->amount,
            ],
            'payment' => [
                'uuid' => $payment->uuid,
                'status' => $payment->status,
                'method' => $payment->method,
                'paid_at' => $payment->paid_at,
            ],
            'checkout_session' => [
                'uuid' => $payment->checkoutSession->uuid,
                'status' => $payment->checkoutSession->status,
            ]
        ]);
    }
}
