<?php

namespace App\Services\Payments;

use App\Models\Payment;
use App\Services\Gateways\GatewayFactory;
use Illuminate\Support\Facades\Log;

class PixAutomationService
{
    protected $factory;

    public function __construct(GatewayFactory $factory)
    {
        $this->factory = $factory;
    }

    /**
     * Verifica e confirma um pagamento PIX pendente.
     */
    public function checkAndConfirm(Payment $payment): bool
    {
        if ($payment->method !== 'pix' || $payment->status !== 'pending') {
            return false;
        }

        try {
            $account = $payment->gatewayAccount;
            $provider = $this->factory->make($account);

            // Consultar status no gateway (ex: Asaas)
            $status = $provider->checkStatus($payment->external_id);

            if ($status['approved']) {
                $payment->update([
                    'status' => 'paid',
                    'paid_at' => now(),
                    'metadata' => array_merge($payment->metadata ?? [], [
                        'confirmation_source' => 'automation_polling',
                        'gateway_details' => $status
                    ])
                ]);

                // Atualizar o pedido
                $payment->order->update(['status' => 'paid']);

                return true;
            }

        } catch (\Exception $e) {
            Log::error("Erro na automação de PIX: " . $e->getMessage());
        }

        return false;
    }
}
