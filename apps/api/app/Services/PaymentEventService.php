<?php

namespace App\Services;

use App\Models\PaymentEvent;
use Illuminate\Support\Facades\Log;

class PaymentEventService
{
    /**
     * Emite um evento de pagamento e grava log estruturado.
     */
    public static function emit(array $data): void
    {
        // Campos obrigatórios mínimos
        if (empty($data['transaction_uuid']) || empty($data['event_type'])) {
            return;
        }

        $now = $data['occurred_at'] ?? now();

        PaymentEvent::create([
            'transaction_uuid' => $data['transaction_uuid'],
            'company_id'       => $data['company_id']       ?? null,
            'integration_id'   => $data['integration_id']   ?? null,
            'gateway_id'       => $data['gateway_id']       ?? null,
            'gateway_type'     => $data['gateway_type']     ?? null,
            'event_type'       => $data['event_type'],
            'status_normalized'=> $data['status_normalized'] ?? null,
            'payment_method'   => $data['payment_method']   ?? null,
            'currency'         => $data['currency']         ?? 'BRL',
            'amount'           => $data['amount']           ?? null,
            'gateway_status'   => $data['gateway_status']   ?? null,
            'gateway_code'     => $data['gateway_code']     ?? null,
            'gateway_message'  => $data['gateway_message']  ?? null,
            'bin'              => $data['bin']              ?? null,
            'brand'            => $data['brand']            ?? null,
            'country'          => $data['country']          ?? null,
            'occurred_at'      => $now,
        ]);

        // Log estruturado também
        Log::info('payment.event', [
            'tx'       => $data['transaction_uuid'],
            'company'  => $data['company_id'] ?? null,
            'event'    => $data['event_type'],
            'status'   => $data['status_normalized'] ?? null,
            'gateway'  => $data['gateway_type'] ?? null,
            'code'     => $data['gateway_code'] ?? null,
        ]);
    }
}
