<?php

namespace App\Services\Gateway;

interface GatewayInterface
{
    public function createCustomer(array $data): string;

    public function createPayment(array $data): array;

    public function createSubscription(array $data): array;

    public function getPayment(string $paymentId): ?array;

    public function cancelPayment(string $paymentId): array;

    public function refundPayment(string $paymentId, ?float $amount = null): array;

    public function generatePix(array $data): array;

    public function generateBoleto(array $data): array;

    public function processWebhook(\Illuminate\Http\Request $request): array;

    public function createSplit(array $data): array;
}
