<?php

namespace App\Observers;

use App\Models\Transaction;
use App\Services\AuditService;
use Illuminate\Support\Facades\Log;

class TransactionObserver
{
    protected AuditService $auditService;

    public function __construct(AuditService $auditService)
    {
        $this->auditService = $auditService;
    }

    public function created(Transaction $transaction): void
    {
        Log::debug('Transaction created', [
            'transaction_id' => $transaction->id,
            'uuid' => $transaction->uuid,
            'amount' => $transaction->amount,
            'status' => $transaction->status,
        ]);
    }

    public function updated(Transaction $transaction): void
    {
        $dirty = $transaction->getDirty();

        if (isset($dirty['status'])) {
            Log::info('Transaction status changed', [
                'transaction_id' => $transaction->id,
                'uuid' => $transaction->uuid,
                'old_status' => $transaction->getOriginal('status'),
                'new_status' => $dirty['status'],
            ]);

            // Dispatch event for status change
            try {
                $eventClass = match ($dirty['status'] ?? null) {
                    'approved' => \App\Events\PaymentApproved::class,
                    'overdue' => \App\Events\PaymentOverdue::class,
                    'refunded' => \App\Events\PaymentRefunded::class,
                    'cancelled' => \App\Events\PaymentRefused::class,
                    default => null,
                };

                if ($eventClass) {
                    event(new $eventClass($transaction));
                }
            } catch (\Exception $e) {
                Log::error('TransactionObserver: Failed to dispatch event', [
                    'error' => $e->getMessage(),
                ]);
            }
        }
    }

    public function deleted(Transaction $transaction): void
    {
        Log::info('Transaction deleted', [
            'transaction_id' => $transaction->id,
            'uuid' => $transaction->uuid,
        ]);
    }
}