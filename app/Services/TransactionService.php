<?php

namespace App\Services;

use App\Enums\PaymentStatus;
use App\Events\TransactionStatusChanged;
use App\Jobs\SendWebhookJob;
use App\Models\Integration;
use App\Models\Transaction;
use App\Models\TransactionItem;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use RuntimeException;

class TransactionService
{
    public function __construct(
        private AuditService $auditService,
        private Fraud\BasicFraudService $fraudService,
    ) {}

    public function create(array $data, Integration $integration): Transaction
    {
        return DB::transaction(function () use ($data, $integration) {
            $transaction = Transaction::create([
                'uuid' => Str::uuid(),
                'integration_id' => $integration->id,
                'company_id' => $integration->company_id,
                'amount' => $data['amount'],
                'status' => PaymentStatus::PENDING->value,
                'description' => $data['description'] ?? null,
                'customer_name' => $data['customer']['name'] ?? null,
                'customer_email' => $data['customer']['email'] ?? null,
                'customer_document' => $data['customer']['document'] ?? null,
                'ip_address' => $data['ip_address'] ?? null,
                'user_agent' => $data['user_agent'] ?? null,
                'metadata' => $data['metadata'] ?? null,
                'payment_method' => $data['payment_method'] ?? null,
                'installments' => $data['installments'] ?? 1,
            ]);

            if (!empty($data['items'])) {
                foreach ($data['items'] as $item) {
                    TransactionItem::create([
                        'transaction_id' => $transaction->id,
                        'name' => $item['name'],
                        'description' => $item['description'] ?? null,
                        'quantity' => $item['quantity'] ?? 1,
                        'unit_price' => $item['unit_price'],
                        'total_price' => ($item['quantity'] ?? 1) * $item['unit_price'],
                    ]);
                }
            }

            try {
                $analysis = $this->fraudService->analyze($transaction);

                $transaction->update([
                    'fraud_score' => $analysis->score,
                    'fraud_risk_level' => $analysis->risk_level,
                    'fraud_flags' => $analysis->flags,
                    'fraud_recommendation' => $analysis->recommendation,
                ]);

                if ($analysis->recommendation === 'reject') {
                    $transaction->update(['status' => PaymentStatus::REFUSED->value]);
                }
            } catch (\Throwable $e) {
                Log::error('Fraud analysis failed', [
                    'transaction' => $transaction->uuid,
                    'error' => $e->getMessage(),
                ]);
            }

            $this->auditService->log('transaction.created', $transaction, [
                'amount' => $data['amount'],
                'customer' => $data['customer'] ?? null,
            ]);

            return $transaction->fresh();
        });
    }

    public function getById(string $uuid): Transaction
    {
        $transaction = Transaction::where('uuid', $uuid)->first();

        if (!$transaction) {
            throw new RuntimeException("Transaction [{$uuid}] not found.");
        }

        return $transaction;
    }

    public function findByUuid(string $uuid, Integration $integration): ?Transaction
    {
        return Transaction::where('uuid', $uuid)
            ->where('company_id', $integration->company_id)
            ->first();
    }

    public function list(array $filters): Builder
    {
        $query = Transaction::query()->orderByDesc('created_at');

        if (!empty($filters['company_id'])) {
            $query->where('company_id', $filters['company_id']);
        }

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['start_date'])) {
            $query->whereDate('created_at', '>=', $filters['start_date']);
        }

        if (!empty($filters['end_date'])) {
            $query->whereDate('created_at', '<=', $filters['end_date']);
        }

        if (!empty($filters['customer_document'])) {
            $query->where('customer_document', $filters['customer_document']);
        }

        if (!empty($filters['customer_email'])) {
            $query->where('customer_email', $filters['customer_email']);
        }

        if (!empty($filters['min_amount'])) {
            $query->where('amount', '>=', $filters['min_amount']);
        }

        if (!empty($filters['max_amount'])) {
            $query->where('amount', '<=', $filters['max_amount']);
        }

        if (!empty($filters['search'])) {
            $query->where(function ($q) use ($filters) {
                $q->where('uuid', 'like', "%{$filters['search']}%")
                    ->orWhere('customer_name', 'like', "%{$filters['search']}%")
                    ->orWhere('customer_email', 'like', "%{$filters['search']}%")
                    ->orWhere('customer_document', 'like', "%{$filters['search']}%");
            });
        }

        return $query;
    }

    public function listPaginated(array $filters, int $perPage = 15)
    {
        return $this->list($filters)->paginate($perPage);
    }

    public function cancel(string $uuid, Integration $integration): Transaction
    {
        return DB::transaction(function () use ($uuid, $integration) {
            $transaction = $this->findByUuid($uuid, $integration);

            if (!$transaction) {
                throw new RuntimeException("Transaction [{$uuid}] not found or access denied.");
            }

            if (!in_array($transaction->status, [PaymentStatus::PENDING->value, PaymentStatus::APPROVED->value])) {
                throw new RuntimeException("Transaction [{$uuid}] cannot be cancelled in current status [{$transaction->status}].");
            }

            $this->updateStatus($transaction, PaymentStatus::CANCELLED->value);

            $this->auditService->log('transaction.cancelled', $transaction);

            return $transaction->fresh();
        });
    }

    public function refund(string $uuid, Integration $integration, ?float $amount = null): Transaction
    {
        return DB::transaction(function () use ($uuid, $integration, $amount) {
            $transaction = $this->findByUuid($uuid, $integration);

            if (!$transaction) {
                throw new RuntimeException("Transaction [{$uuid}] not found or access denied.");
            }

            if ($transaction->status !== PaymentStatus::APPROVED->value) {
                throw new RuntimeException("Transaction [{$uuid}] cannot be refunded in current status [{$transaction->status}].");
            }

            $refundAmount = $amount ?? $transaction->amount;

            if ($refundAmount > $transaction->amount) {
                throw new RuntimeException('Refund amount exceeds transaction amount.');
            }

            $newStatus = $refundAmount >= $transaction->amount
                ? PaymentStatus::REFUNDED->value
                : PaymentStatus::PARTIALLY_REFUNDED->value;

            $this->updateStatus($transaction, $newStatus);

            $transaction->update([
                'refunded_amount' => ($transaction->refunded_amount ?? 0) + $refundAmount,
            ]);

            $this->auditService->log('transaction.refunded', $transaction, [
                'refund_amount' => $refundAmount,
            ]);

            return $transaction->fresh();
        });
    }

    public function updateStatus(Transaction $transaction, string $newStatus): void
    {
        $oldStatus = $transaction->status;

        if ($oldStatus === $newStatus) {
            return;
        }

        $transaction->update([
            'status' => $newStatus,
            'status_changed_at' => now(),
        ]);

        event(new TransactionStatusChanged($transaction, $oldStatus, $newStatus));

        if ($transaction->integration) {
            SendWebhookJob::dispatch(
                $newStatus,
                $transaction->toArray(),
                $transaction->company_id,
            );
        }

        $this->auditService->log('transaction.status_updated', $transaction, [
            'old_status' => $oldStatus,
            'new_status' => $newStatus,
        ]);
    }
}
