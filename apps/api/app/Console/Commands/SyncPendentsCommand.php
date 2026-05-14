<?php

namespace App\Console\Commands;

use App\Models\Payment;
use App\Services\PaymentService;
use Illuminate\Console\Command;

class SyncPendentsCommand extends Command
{
    protected $signature = 'payments:sync-pending';
    protected $description = 'Sync pending payments with gateway';

    public function handle(PaymentService $paymentService): int
    {
        $pending = Payment::where('status', 'pending')
            ->where('created_at', '>', now()->subDays(3))
            ->get();

        foreach ($pending as $payment) {
            try {
                $paymentService->syncStatus($payment);
            } catch (\Exception $e) {
                $this->error("Failed to sync payment {$payment->uuid}: {$e->getMessage()}");
            }
        }

        $this->info("Synced {$pending->count()} pending payments.");
        return self::SUCCESS;
    }
}
