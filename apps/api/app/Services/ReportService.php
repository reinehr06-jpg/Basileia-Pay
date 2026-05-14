<?php

namespace App\Services;

use App\Models\Company;
use App\Models\FinancialReport;
use App\Models\Transaction;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class ReportService
{
    public function generateSummary(Company $company, Carbon $start, Carbon $end): array
    {
        $baseQuery = Transaction::where('company_id', $company->id)
            ->whereBetween('created_at', [$start, $end]);

        $totalTransactions = (clone $baseQuery)->count();
        $approvedTransactions = (clone $baseQuery)->where('status', 'approved')->count();
        $refusedTransactions = (clone $baseQuery)->where('status', 'refused')->count();
        $refundedTransactions = (clone $baseQuery)->whereIn('status', ['refunded', 'partially_refunded'])->count();

        $totalAmount = (clone $baseQuery)->sum('amount') ?? 0;
        $approvedAmount = (clone $baseQuery)->where('status', 'approved')->sum('amount') ?? 0;
        $refundedAmount = (clone $baseQuery)->sum('refunded_amount') ?? 0;

        $avgTicket = $approvedTransactions > 0 ? round($approvedAmount / $approvedTransactions, 2) : 0;
        $approvalRate = $totalTransactions > 0 ? round(($approvedTransactions / $totalTransactions) * 100, 2) : 0;

        $byPaymentMethod = (clone $baseQuery)
            ->selectRaw('billing_type, COUNT(*) as count, SUM(amount) as total')
            ->groupBy('billing_type')
            ->get()
            ->keyBy('billing_type');

        $byGateway = Transaction::where('company_id', $company->id)
            ->whereBetween('created_at', [$start, $end])
            ->join('payments', 'transactions.id', '=', 'payments.transaction_id')
            ->join('gateways', 'payments.gateway_id', '=', 'gateways.id')
            ->selectRaw('gateways.name as gateway, COUNT(*) as count, SUM(payments.amount) as total')
            ->groupBy('gateways.name')
            ->get()
            ->keyBy('gateway');

        return [
            'period' => [
                'start' => $start->toDateString(),
                'end' => $end->toDateString(),
            ],
            'totals' => [
                'transactions' => $totalTransactions,
                'approved' => $approvedTransactions,
                'refused' => $refusedTransactions,
                'refunded' => $refundedTransactions,
            ],
            'amounts' => [
                'total' => $totalAmount,
                'approved' => $approvedAmount,
                'refunded' => $refundedAmount,
                'net' => $approvedAmount - $refundedAmount,
            ],
            'metrics' => [
                'average_ticket' => $avgTicket,
                'approval_rate' => $approvalRate,
            ],
            'by_payment_method' => $byPaymentMethod,
            'by_gateway' => $byGateway,
        ];
    }

    public function generateByPeriod(Company $company, string $period): array
    {
        $now = now();

        $format = match ($period) {
            'daily' => '%Y-%m-%d',
            'weekly' => '%Y-%u',
            'monthly' => '%Y-%m',
            default => throw new \InvalidArgumentException("Invalid period: {$period}. Use daily, weekly, or monthly."),
        };

        $start = match ($period) {
            'daily' => $now->copy()->subDays(30),
            'weekly' => $now->copy()->subWeeks(12),
            'monthly' => $now->copy()->subMonths(12),
        };

        $data = Transaction::where('company_id', $company->id)
            ->where('created_at', '>=', $start)
            ->selectRaw(
                "DATE_FORMAT(created_at, '{$format}') as period, " .
                "COUNT(*) as total_transactions, " .
                "SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved_transactions, " .
                "SUM(amount) as total_amount, " .
                "SUM(CASE WHEN status = 'approved' THEN amount ELSE 0 END) as approved_amount"
            )
            ->groupBy('period')
            ->orderBy('period')
            ->get();

        return [
            'period_type' => $period,
            'data' => $data,
        ];
    }

    public function exportCsv(Company $company, Carbon $start, Carbon $end): string
    {
        $transactions = Transaction::where('company_id', $company->id)
            ->whereBetween('created_at', [$start, $end])
            ->with(['customer', 'payments'])
            ->orderBy('created_at')
            ->get();

        $lines = [];
        $lines[] = implode(',', [
            'UUID', 'Date', 'Customer', 'Email', 'Document',
            'Amount', 'Status', 'Billing Type', 'Refunded Amount',
        ]);

        foreach ($transactions as $t) {
            $lines[] = implode(',', [
                $t->uuid,
                $t->created_at->format('Y-m-d H:i:s'),
                '"' . str_replace('"', '""', $t->customer_name ?? '') . '"',
                '"' . ($t->customer_email ?? '') . '"',
                $t->customer_document ?? '',
                number_format($t->amount, 2, '.', ''),
                $t->status,
                $t->billing_type ?? $t->payments->first()?->billing_type ?? '',
                number_format($t->refunded_amount ?? 0, 2, '.', ''),
            ]);
        }

        $csv = implode("\n", $lines);

        $filename = "reports/{$company->uuid}/{$start->format('Ymd')}-{$end->format('Ymd')}.csv";
        Storage::put($filename, $csv);

        return $filename;
    }

    public function saveReport(Company $company, array $data): FinancialReport
    {
        return FinancialReport::create([
            'company_id' => $company->id,
            'type' => $data['type'] ?? 'summary',
            'period_start' => $data['period_start'],
            'period_end' => $data['period_end'],
            'data' => $data,
            'total_transactions' => $data['totals']['transactions'] ?? 0,
            'total_amount' => $data['amounts']['total'] ?? 0,
            'approved_amount' => $data['amounts']['approved'] ?? 0,
            'refunded_amount' => $data['amounts']['refunded'] ?? 0,
            'approval_rate' => $data['metrics']['approval_rate'] ?? 0,
        ]);
    }
}
