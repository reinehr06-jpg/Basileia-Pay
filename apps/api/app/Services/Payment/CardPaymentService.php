<?php

namespace App\Services\Payment;

use App\Services\Gateways\GatewayFactory;
use App\Models\GatewayAccount;
use App\Models\Order;
use App\Helpers\PaymentStatusMapper;
use Illuminate\Support\Facades\Log;

class CardPaymentService
{
    public function __construct(protected GatewayFactory $gatewayFactory) {}

    public function charge(GatewayAccount $account, Order $order, array $customerData, array $card, string $billingCycle = 'once'): array
    {
        Log::info('CardPaymentService: Initiating charge', ['order_id' => $order->uuid]);

        $provider = $this->gatewayFactory->make($account);
        
        if ($billingCycle === 'annual') {
            $result = $provider->createSubscription($account, [
                'order' => $order,
                'customer' => $customerData,
                'card' => $card,
                'cycle' => 'annual'
            ]);
        } else {
            $result = $provider->chargeViaCard($account, $order, $customerData, $card);
        }

        Log::info('CardPaymentService: Payment processed', [
            'transaction_id' => $result['transaction_id'] ?? null,
            'status' => $result['status'] ?? null,
        ]);

        return $result;
    }

    public function mapStatus(string $gatewayStatus): string
    {
        return PaymentStatusMapper::mapStatus($gatewayStatus);
    }

    public function isPaid(string $gatewayStatus): bool
    {
        return PaymentStatusMapper::isPaid($gatewayStatus);
    }
}
