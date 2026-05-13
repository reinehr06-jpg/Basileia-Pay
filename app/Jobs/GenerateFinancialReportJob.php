<?php

namespace App\Jobs;

use App\Models\Payment;
use App\Models\Transaction;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class GenerateFinancialReportJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public int $timeout = 120;

    public function __construct(
        public int $companyId,
        public string $startDate,
        public string $endDate
    ) {
    }

    public function handle(): void
    {
        $transactions = Transaction::where('company_id', $this->companyId)
            ->whereBetween('created_at', [$this->startDate, $this->endDate])
            ->get();

        $payments = Payment::whereHas('transaction', function ($q) {
            $q->where('company_id', $this->companyId);
        })
            ->whereBetween('created_at', [$this->startDate, $this->endDate])
            ->get();

        $report = [
            'company_id' => $this->companyId,
            'period' => [
                'start' => $this->startDate,
                'end' => $this->endDate,
            ],
            'totals' => [
                'transactions_count' => $transactions->count(),
                'transactions_amount' => $transactions->sum('amount'),
                'approved_count' => $transactions->where('status', 'approved')->count(),
                'approved_amount' => $transactions->where('status', 'approved')->sum('amount'),
                'refused_count' => $transactions->where('status', 'refused')->count(),
                'refunded_amount' => $payments->where('status', 'refunded')->sum('refunded_amount'),
                'chargeback_count' => $payments->where('status', 'chargeback')->count(),
            ],
            'by_payment_method' => $transactions->groupBy('payment_method')->map(function ($group) {
                return [
                    'count' => $group->count(),
                    'amount' => $group->sum('amount'),
                ];
            }),
            'generated_at' => now()->toIso8601String(),
        ];

        \Illuminate\Support\Facades\Cache::put(
            "financial_report:{$this->companyId}:{$this->startDate}:{$this->endDate}",
            encrypt($report),
            now()->addHours(24)
        );
    }
}
