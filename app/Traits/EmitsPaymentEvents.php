<?php

namespace App\Traits;

use App\Services\PaymentEventService;

trait EmitsPaymentEvents
{
    /**
     * Helper para emitir eventos de pagamento
     */
    protected function emitPaymentEvent(array $data): void
    {
        PaymentEventService::emit($data);
    }
}
