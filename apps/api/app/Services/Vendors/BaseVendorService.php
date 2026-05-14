<?php

namespace App\Services\Vendors;

interface BaseVendorService
{
    public function getPayment(string $paymentId): ?array;
    public function createPayment(array $data): ?array;
    public function processCardPayment(string $paymentId, array $cardData): ?array;
    public function getPixQrCode(string $paymentId): ?array;
    public function getBoletoBillet(string $paymentId): ?array;
    public function cancelPayment(string $paymentId): ?array;
    public function refundPayment(string $paymentId, ?float $amount = null): ?array;
}