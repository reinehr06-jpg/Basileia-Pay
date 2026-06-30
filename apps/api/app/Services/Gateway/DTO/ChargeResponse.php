<?php

namespace App\Services\Gateway\DTO;

class ChargeResponse
{
    public function __construct(
        public readonly bool $success,
        public readonly string $status,
        public readonly ?string $gatewayPaymentId = null,
        public readonly ?string $errorMessage = null,
        public readonly ?string $pixQrCode = null,
        public readonly ?string $pixQrCodeUrl = null,
        public readonly ?string $boletoUrl = null,
        public readonly array $rawResponse = []
    ) {}
}
