<?php

namespace App\Services\Routing;

class RoutingContext
{
    public function __construct(
        public int $companyId,
        public ?int $integrationId,
        public ?int $currentGatewayId,
        public ?string $paymentMethod, // creditcard/pix/...
        public float $amount,
        public ?string $country,
        public ?string $bin,
    ) {}
}
