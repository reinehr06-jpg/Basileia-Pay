<?php

namespace App\Jobs;

use App\Models\GatewayWebhookEvent;
use App\Models\PaymentAttempt;
use App\Domain\Payment\StateMachine\PaymentStateMachine;
use App\Domain\Order\StateMachine\OrderStateMachine;
use App\Domain\Checkout\StateMachine\CheckoutSessionStateMachine;
use App\Services\Audit\AuditService;
use App\Domain\Webhook\Services\WebhookDispatcher;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;

class ProcessGatewayWebhookJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $queue = 'webhooks';

    public function __construct(public int $eventId)
    {}

    public function handle(
        PaymentStateMachine $paymentStateMachine,
        OrderStateMachine $orderStateMachine,
        CheckoutSessionStateMachine $sessionStateMachine,
        WebhookDispatcher $webhookDispatcher,
        AuditService $audit
    ): void {
        $event = GatewayWebhookEvent::findOrFail($this->eventId);

        DB::transaction(function () use ($event, $paymentStateMachine, $orderStateMachine, $sessionStateMachine, $webhookDispatcher, $audit) {
            $event = GatewayWebhookEvent::lockForUpdate()->find($event->id);

            if ($event->status === 'processed') return;

            $event->update(['status' => 'processing']);

            match($event->event_type) {
                'PAYMENT_RECEIVED'          => $this->handlePaymentApproved($event, $paymentStateMachine, $orderStateMachine, $sessionStateMachine, $webhookDispatcher, $audit),
                'PAYMENT_CONFIRMED'         => $this->handlePaymentApproved($event, $paymentStateMachine, $orderStateMachine, $sessionStateMachine, $webhookDispatcher, $audit),
                // Other events...
                default                     => $event->update(['status' => 'ignored']),
            };
        });
    }

    private function handlePaymentApproved(
        GatewayWebhookEvent $event,
        PaymentStateMachine $paymentStateMachine,
        OrderStateMachine $orderStateMachine,
        CheckoutSessionStateMachine $sessionStateMachine,
        WebhookDispatcher $webhookDispatcher,
        AuditService $audit
    ): void {
        $gatewayPaymentId = $event->payload_masked['payment']['id'] ?? null;

        $attempt = PaymentAttempt::where('gateway_attempt_id', $gatewayPaymentId)->first();
        if (!$attempt) return;

        $payment = $attempt->payment;
        $order   = $payment->order;
        $session = $order->session; // checkout_session

        if ($payment->status === 'approved') {
            $event->update(['status' => 'processed', 'processed_at' => now()]);
            return; // Already processed
        }

        $paymentStateMachine->transition($payment, 'approved');
        $orderStateMachine->transition($order, 'paid');
        if ($session) {
            $sessionStateMachine->transition($session, 'paid');
        }

        $payment->update(['approved_at' => now()]);
        $order->update(['paid_at' => now()]);

        if ($session && $session->system_id) {
            $webhookDispatcher->dispatch($session->system_id, 'payment.approved', [
                'payment_id'  => $payment->uuid,
                'order_id'    => $order->uuid,
                'amount'      => $payment->amount,
                'currency'    => $payment->currency,
                'paid_at'     => now()->toIso8601String(),
            ]);
        }

        $audit->log('payment.approved', $payment->company_id, null, 'Payment', $payment->id);

        $event->update(['status' => 'processed', 'processed_at' => now()]);
    }
}
