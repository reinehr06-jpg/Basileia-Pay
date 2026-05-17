<?php

namespace App\Services\Gateways\Contracts;

use App\Models\GatewayAccount;
use App\Models\Order;

interface GatewayProvider
{
    public function chargeViaPix(GatewayAccount $account, Order $order, array $customer): array;
    public function chargeViaCard(GatewayAccount $account, Order $order, array $customer, array $card): array;
    public function chargeViaBoleto(GatewayAccount $account, Order $order, array $customer): array;
    public function refund(GatewayAccount $account, string $externalId, ?float $amount = null): bool;
    public function cancel(GatewayAccount $account, string $externalId): bool;
    public function getPaymentStatus(GatewayAccount $account, string $externalId): array;
    public function createCustomer(GatewayAccount $account, array $customerData): array;
    public function createSplit(GatewayAccount $account, array $splitRules): array;
    public function createSubscription(GatewayAccount $account, array $subscriptionData): array;
    public function validateWebhook(GatewayAccount $account, array $payload, string $signature): bool;
    public function parseWebhook(GatewayAccount $account, array $payload): array;
}
