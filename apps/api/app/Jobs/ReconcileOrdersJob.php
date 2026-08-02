<?php

namespace App\Jobs;

use Illuminate\Support\Facades\Log;

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

    public $queue = 'default';
    public $tries = 2;
    public $timeout = 120;
    public $backoff = [10, 60, 300, 1800, 3600];


    public function handle(PaymentService $paymentService): void
    {
        // Pega orders presas em processing há mais de 15 minutos
        $stuckOrders = Order::where('status', 'processing')
            ->where('updated_at', '<', now()->subMinutes(15))
            ->get();

        foreach ($stuckOrders as $order) {
            $payment = $order->payments()->latest()->first();
            if ($payment && $payment->gateway_payment_id) {
                $registry = app(\App\Services\Gateway\GatewayDriverRegistry::class);
                $driver = $registry->resolve($payment->gatewayAccount);
                $gatewayPayment = $driver->getPayment($payment->gateway_payment_id);
                $isPaidOnGateway = in_array($gatewayPayment['status'] ?? '', ['CONFIRMED', 'PAID']);

                if ($isPaidOnGateway) {
                    $paymentService->handleGatewayConfirmation($payment->gateway_payment_id, [
                        'reconciled_via' => 'ReconcileOrdersJob'
                    ]);
                }
            }
        }
    }

    public function failed(?\Throwable $exception): void
    {
        Log::error('Job failed permanently', [
            'job' => static::class,
            'error' => $exception?->getMessage(),
        ]);
    }
}