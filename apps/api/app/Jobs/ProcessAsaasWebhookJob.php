<?php

namespace App\Jobs;

use App\Models\Payment;
use App\Models\Order;
use App\Models\GatewayAccount;
use App\Services\Webhooks\WebhookDispatcher;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class ProcessAsaasWebhookJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $payload;
    protected $gatewayAccount;

    public function __construct(array $payload, ?GatewayAccount $gatewayAccount = null)
    {
        $this->payload = $payload;
        $this->gatewayAccount = $gatewayAccount;
    }

    public function handle(WebhookDispatcher $dispatcher): void
    {
        $event = $this->payload['event'] ?? null;
        $paymentData = $this->payload['payment'] ?? null;
        
        if (!$event || !$paymentData) {
            return;
        }

        $externalId = $paymentData['id']; // ID do Asaas

        // 1. Localizar o pagamento na Basileia
        $payment = Payment::where('gateway_transaction_id', $externalId)->first();

        if (!$payment) {
            Log::warning("Webhook Asaas: Pagamento não encontrado para o ID {$externalId}");
            return;
        }

        // 2. Mapear status do Asaas para o padrão Basileia
        $statusMapping = [
            'PAYMENT_RECEIVED' => 'approved',
            'PAYMENT_CONFIRMED' => 'approved',
            'PAYMENT_OVERDUE' => 'expired',
            'PAYMENT_DELETED' => 'cancelled',
            'PAYMENT_REFUNDED' => 'refunded',
        ];

        $newStatus = $statusMapping[$event] ?? null;

        if ($newStatus) {
            $payment->update(['status' => $newStatus]);
            
            // 3. Atualizar a Order se aprovado
            if ($newStatus === 'approved') {
                $payment->order->update(['status' => 'paid']);
                $payment->update(['paid_at' => now()]);
                
                // 3.1 Atualizar a CheckoutSession
                if ($payment->checkout_session_id) {
                    $payment->checkoutSession->update(['status' => 'paid']);
                }
            }

            // 4. DESPACHAR WEBHOOK PARA O SISTEMA DE ORIGEM (Church/Vendor/etc)
            $dispatcher->dispatch(
                $payment->order->connectedSystem,
                $this->mapInternalEvent($newStatus),
                [
                    'event' => $this->mapInternalEvent($newStatus),
                    'system_key' => $payment->order->connectedSystem->slug,
                    'external_order_id' => $payment->order->external_order_id,
                    'checkout_session_id' => $payment->order->checkout_session_id,
                    'payment_id' => $payment->uuid,
                    'status' => $newStatus,
                    'amount' => $payment->amount,
                    'paid_at' => $payment->paid_at ? $payment->paid_at->toIso8601String() : null,
                    'metadata' => $payment->order->metadata ?? []
                ]
            );
        }
    }

    private function mapInternalEvent($status)
    {
        $events = [
            'approved' => 'payment.approved',
            'refused' => 'payment.refused',
            'cancelled' => 'payment.cancelled',
            'refunded' => 'payment.refunded',
            'expired' => 'payment.expired',
        ];

        return $events[$status] ?? 'payment.updated';
    }
}
