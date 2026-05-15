<?php

namespace App\Domain\Notifications\Services;

use App\Models\Payment;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class PayerNotificationService
{
    public function send(string $event, $entity): void
    {
        $handlers = [
            'payment.approved'     => 'notifyPaymentApproved',
            'pix.expiring_soon'    => 'notifyPixExpiring',
        ];

        $method = $handlers[$event] ?? null;
        if ($method && method_exists($this, $method)) {
            $this->$method($entity);
        }
    }

    public function notifyPaymentApproved(Payment $payment): void
    {
        if (!$payment->customer_email) return;

        // In a real scenario: Mail::to($payment->customer_email)->send(new PaymentApprovedMail($payment));
        Log::info('Notification sent: payment.approved', ['payment_id' => $payment->id]);
    }

    public function notifyPixExpiring(Payment $payment): void
    {
        if (!$payment->customer_email) return;

        // In a real scenario: Mail::to($payment->customer_email)->send(new PixExpiringSoonMail($payment));
        Log::info('Notification sent: pix.expiring_soon', ['payment_id' => $payment->id]);
    }
}
