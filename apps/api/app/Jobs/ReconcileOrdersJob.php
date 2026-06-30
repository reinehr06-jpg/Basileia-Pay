<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use App\Models\Order;
use App\Services\Financial\PaymentService;

class ReconcileOrdersJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function handle(PaymentService $paymentService): void
    {
        // Pega orders presas em processing há mais de 15 minutos
        $stuckOrders = Order::where('status', 'processing')
            ->where('updated_at', '<', now()->subMinutes(15))
            ->get();

        foreach ($stuckOrders as $order) {
            $payment = $order->payments()->latest()->first();
            if ($payment && $payment->gateway_payment_id) {
                // TODO: GatewayDriver::fetchTransactionStatus($payment->gateway_payment_id)
                // Se a reconsulta ao gateway disser que está pago e o sistema está processando, chama a confirmação:
                // Simulando que consultamos o gateway e o status real é 'paid'
                $isPaidOnGateway = false; 

                if ($isPaidOnGateway) {
                    $paymentService->handleGatewayConfirmation($payment->gateway_payment_id, [
                        'reconciled_via' => 'ReconcileOrdersJob'
                    ]);
                }
            }
        }
    }
}
