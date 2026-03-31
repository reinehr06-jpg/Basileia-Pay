<?php

namespace App\Services;

use App\Enums\PaymentStatus;
use App\Events\PaymentApproved;
use App\Events\PaymentCancelled;
use App\Events\PaymentPending;
use App\Events\PaymentRefused;
use App\Events\PaymentRefunded;
use App\Models\Customer;
use App\Models\Gateway;
use App\Models\Payment;
use App\Models\Transaction;
use App\Services\Gateway\GatewayFactory;
use App\Services\Gateway\GatewayInterface;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use RuntimeException;

class PaymentService
{
    public function __construct(
        private GatewayFactory $gatewayFactory,
        private CustomerService $customerService,
        private TransactionService $transactionService,
    ) {}

    public function processPayment(array $data): array
    {
        $this->validatePaymentData($data);

        return DB::transaction(function () use ($data) {
            $transaction = $this->transactionService->getById($data['transaction_uuid']);
            $integration = $transaction->integration;
            $company = $integration->company;
            $gateway = $this->gatewayFactory->make($integration->gateway->type);
            $customer = $this->customerService->findOrCreate($data['customer'], $company);

            if (empty($customer->gateway_id)) {
                $this->customerService->syncWithGateway($customer, $gateway);
            }

            $gatewayData = $this->prepareGatewayData($data, $customer, $transaction);
            $gatewayResponse = $gateway->createPayment($gatewayData);

            $payment = Payment::create([
                'uuid' => Str::uuid(),
                'transaction_id' => $transaction->id,
                'customer_id' => $customer->id,
                'gateway_id' => $transaction->integration->gateway_id,
                'gateway_payment_id' => $gatewayResponse['id'],
                'billing_type' => $data['billing_type'],
                'amount' => $data['amount'],
                'status' => $this->mapGatewayStatus($gatewayResponse['status']),
                'due_date' => $gatewayResponse['dueDate'],
                'qr_code' => $gatewayResponse['encodedImage'] ?? null,
                'payload' => $gatewayResponse['payload'] ?? null,
                'boleto_url' => $gatewayResponse['bankSlipUrl'] ?? null,
                'invoice_url' => $gatewayResponse['invoiceUrl'] ?? null,
                'raw_response' => $gatewayResponse,
            ]);

            $this->transactionService->updateStatus($transaction, $payment->status);
            $this->firePaymentEvent($payment, $transaction);

            return $payment->toArray();
        });
    }

    public function getPaymentStatus(string $paymentUuid): array
    {
        $payment = Payment::where('uuid', $paymentUuid)->firstOrFail();
        $gateway = $this->gatewayFactory->make($payment->gateway->type);

        $gatewayData = $gateway->getPayment($payment->gateway_payment_id);

        $oldStatus = $payment->status;
        $newStatus = $this->mapGatewayStatus($gatewayData['status']);

        if ($oldStatus !== $newStatus) {
            $payment->update([
                'status' => $newStatus,
                'paid_at' => $newStatus === PaymentStatus::APPROVED->value ? now() : null,
                'raw_response' => $gatewayData,
            ]);

            $this->transactionService->updateStatus($payment->transaction, $newStatus);
            $this->firePaymentEvent($payment, $payment->transaction);
        }

        return $payment->toArray();
    }

    public function cancelPayment(string $transactionUuid): array
    {
        return DB::transaction(function () use ($transactionUuid) {
            $transaction = $this->transactionService->getById($transactionUuid);
            $payment = $transaction->payments()->whereNotIn('status', [
                PaymentStatus::CANCELLED->value,
                PaymentStatus::REFUNDED->value,
            ])->firstOrFail();

            $gateway = $this->gatewayFactory->make($payment->gateway->type);
            $gatewayResponse = $gateway->cancelPayment($payment->gateway_payment_id);

            $payment->update([
                'status' => PaymentStatus::CANCELLED->value,
                'cancelled_at' => now(),
                'raw_response' => $gatewayResponse,
            ]);

            $this->transactionService->updateStatus($transaction, PaymentStatus::CANCELLED->value);
            event(new PaymentCancelled($payment, $transaction));

            return $payment->toArray();
        });
    }

    public function refundPayment(string $transactionUuid, ?float $amount = null): array
    {
        return DB::transaction(function () use ($transactionUuid, $amount) {
            $transaction = $this->transactionService->getById($transactionUuid);
            $payment = $transaction->payments()->where('status', PaymentStatus::APPROVED->value)->firstOrFail();

            $gateway = $this->gatewayFactory->make($payment->gateway->type);
            $gatewayResponse = $gateway->refundPayment($payment->gateway_payment_id, $amount);

            $refundAmount = $amount ?? $payment->amount;

            $payment->update([
                'status' => $refundAmount >= $payment->amount
                    ? PaymentStatus::REFUNDED->value
                    : PaymentStatus::PARTIALLY_REFUNDED->value,
                'refunded_at' => $refundAmount >= $payment->amount ? now() : null,
                'refunded_amount' => ($payment->refunded_amount ?? 0) + $refundAmount,
                'raw_response' => $gatewayResponse,
            ]);

            $this->transactionService->updateStatus($transaction, $payment->status);
            event(new PaymentRefunded($payment, $transaction, $refundAmount));

            return $payment->toArray();
        });
    }

    private function validatePaymentData(array $data): void
    {
        $required = ['transaction_uuid', 'billing_type', 'amount', 'customer'];

        foreach ($required as $field) {
            if (empty($data[$field])) {
                throw new RuntimeException("Missing required field: {$field}");
            }
        }

        if (!in_array($data['billing_type'], ['PIX', 'BOLETO', 'CREDIT_CARD'])) {
            throw new RuntimeException('Invalid billing type.');
        }

        if ($data['amount'] <= 0) {
            throw new RuntimeException('Amount must be greater than zero.');
        }

        if ($data['billing_type'] === 'CREDIT_CARD' && empty($data['credit_card'])) {
            throw new RuntimeException('Credit card data is required for CREDIT_CARD billing type.');
        }
    }

    private function prepareGatewayData(array $data, Customer $customer, Transaction $transaction): array
    {
        $gatewayData = [
            'customer' => $customer->gateway_id,
            'billing_type' => $data['billing_type'],
            'value' => $data['amount'],
            'due_date' => $data['due_date'] ?? now()->addDay()->format('Y-m-d'),
            'description' => $data['description'] ?? "Order #{$transaction->uuid}",
            'external_reference' => $transaction->uuid,
        ];

        if (!empty($data['installment_count'])) {
            $gatewayData['installment_count'] = $data['installment_count'];
            $gatewayData['total_value'] = $data['amount'];
        }

        if (!empty($data['credit_card'])) {
            $gatewayData['credit_card'] = $data['credit_card'];
            $gatewayData['credit_card_holder'] = $data['credit_card_holder'] ?? null;
            $gatewayData['ip'] = $data['ip'] ?? null;
        }

        if (!empty($data['split'])) {
            $gatewayData['split'] = $data['split'];
        }

        return $gatewayData;
    }

    private function mapGatewayStatus(string $status): string
    {
        return match (strtoupper($status)) {
            'PENDING', 'AWAITING_RISK_ANALYSIS' => PaymentStatus::PENDING->value,
            'RECEIVED', 'CONFIRMED', 'RECEIVED_IN_CASH' => PaymentStatus::APPROVED->value,
            'OVERDUE' => PaymentStatus::OVERDUE->value,
            'REFUND_REQUESTED' => PaymentStatus::PENDING_REFUND->value,
            'REFUNDED' => PaymentStatus::REFUNDED->value,
            'CHARGEBACK_REQUESTED', 'CHARGEBACK_DISPUTE' => PaymentStatus::CHARGEBACK->value,
            'CANCELED' => PaymentStatus::CANCELLED->value,
            default => PaymentStatus::PENDING->value,
        };
    }

    private function firePaymentEvent(Payment $payment, Transaction $transaction): void
    {
        match ($payment->status) {
            PaymentStatus::APPROVED->value => event(new PaymentApproved($payment, $transaction)),
            PaymentStatus::CANCELLED->value => event(new PaymentCancelled($payment, $transaction)),
            PaymentStatus::REFUNDED->value, PaymentStatus::PARTIALLY_REFUNDED->value => event(new PaymentRefunded($payment, $transaction, $payment->refunded_amount)),
            PaymentStatus::REFUSED->value => event(new PaymentRefused($payment, $transaction)),
            default => event(new PaymentPending($payment, $transaction)),
        };
    }
}
