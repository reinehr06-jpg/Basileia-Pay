<?php

namespace App\Services\Payment;

use App\Services\Gateways\GatewayFactory;
use App\Models\GatewayAccount;
use App\Models\Order;
use App\Helpers\PaymentStatusMapper;
use Illuminate\Support\Facades\Log;

class PixPaymentService
{
    public function __construct(protected GatewayFactory $gatewayFactory) {}

    public function charge(GatewayAccount $account, Order $order, array $customerData): array
    {
        Log::info('PixPaymentService: Initiating charge', ['order_id' => $order->uuid]);

        $provider = $this->gatewayFactory->make($account);
        $result = $provider->chargeViaPix($account, $order, $customerData);

        Log::info('PixPaymentService: Payment created', [
            'transaction_id' => $result['transaction_id'] ?? null,
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
