<?php

namespace App\Services\Gateway\DTO;

class NormalizedEvent
{
    public function __construct(
        public readonly string $gatewayEventId,
        public readonly string $eventType, // e.g. payment.confirmed, payment.failed
        public readonly string $gatewayPaymentId,
        public readonly string $status, // internally mapped status
        public readonly array $rawPayload = []
    ) {}
}
