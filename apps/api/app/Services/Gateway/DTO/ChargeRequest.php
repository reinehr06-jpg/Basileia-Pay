<?php

namespace App\Services\Gateway\DTO;

class ChargeRequest
{
    public function __construct(
        public readonly float $amount,
        public readonly string $paymentMethod,
        public readonly array $customer,
        public readonly ?string $reference = null,
        public readonly array $metadata = []
    ) {}
}
