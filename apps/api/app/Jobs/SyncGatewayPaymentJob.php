<?php

namespace App\Jobs;

use App\Models\Payment;
use App\Services\GatewayService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class SyncGatewayPaymentJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public int $timeout = 60;

    public function __construct(
        public int $paymentId
    ) {}

    public function handle(GatewayService $gatewayService): void
    {
        $payment = Payment::find($this->paymentId);

        if (!$payment || !$payment->gateway_payment_id) {
            return;
        }

        $status = $gatewayService->getPaymentStatus(
            $payment->gateway,
            $payment->gateway_payment_id
        );

        if ($status && $status !== $payment->status) {
            $payment->update(['status' => $status]);

            match ($status) {
                'approved' => \App\Events\PaymentApproved::dispatch($payment),
                'refused' => \App\Events\PaymentRefused::dispatch($payment),
                'overdue' => \App\Events\PaymentOverdue::dispatch($payment),
                'refunded' => \App\Events\PaymentRefunded::dispatch($payment),
                default => null,
            };
        }
    }
}
