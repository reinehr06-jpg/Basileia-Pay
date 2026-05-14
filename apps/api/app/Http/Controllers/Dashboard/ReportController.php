<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Response;
use Illuminate\Support\Str;

class ReportController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        $companyId = $user->company_id;

        $summary = $this->buildSummary($companyId);

        return view('dashboard.reports.index', compact('summary'));
    }

    public function summary(Request $request)
    {
        $user = Auth::user();
        $companyId = $user->company_id;

        $request->validate([
            'date_from' => 'required|date',
            'date_to' => 'required|date|after_or_equal:date_from',
        ]);

        $summary = $this->buildSummary(
            $companyId,
            $request->input('date_from'),
            $request->input('date_to')
        );

        return view('dashboard.reports.summary', compact('summary'));
    }

    public function export(Request $request)
    {
        $user = Auth::user();
        $companyId = $user->company_id;

        $request->validate([
            'date_from' => 'sometimes|date',
            'date_to' => 'sometimes|date|after_or_equal:date_from',
            'status' => 'sometimes|in:pending,approved,refused,cancelled,refunded',
        ]);

        $query = Transaction::whereHas('integration', fn ($q) => $q->where('company_id', $companyId))
            ->with(['customer', 'integration', 'payments']);

        if ($request->filled('date_from')) {
            $query->where('created_at', '>=', $request->input('date_from'));
        }

        if ($request->filled('date_to')) {
            $query->where('created_at', '<=', $request->input('date_to') . ' 23:59:59');
        }

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        $transactions = $query->orderBy('created_at', 'desc')->get();

        $filename = 'transacoes_' . now()->format('Y-m-d_His') . '.csv';

        $headers = [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ];

        $callback = function () use ($transactions) {
            $file = fopen('php://output', 'w');

            fprintf($file, chr(0xEF) . chr(0xBB) . chr(0xBF));

            fputcsv($file, [
                'UUID', 'Status', 'Método', 'Valor', 'Cliente',
                'Email', 'Documento', 'Integração', 'Gateway',
                'Data de Criação',
            ]);

            foreach ($transactions as $transaction) {
                fputcsv($file, [
                    $transaction->uuid,
                    $transaction->status,
                    $transaction->payment_method,
                    number_format($transaction->amount, 2, ',', '.'),
                    $transaction->customer->name ?? '',
                    $transaction->customer->email ?? '',
                    $transaction->customer->document ?? '',
                    $transaction->integration->name ?? '',
                    $transaction->gateway,
                    $transaction->created_at->format('d/m/Y H:i:s'),
                ]);
            }

            fclose($file);
        };

        return Response::stream($callback, 200, $headers);
    }

    private function buildSummary(?int $companyId, ?string $dateFrom = null, ?string $dateTo = null): array
    {
        $query = Transaction::query();

        if ($companyId) {
            $query->whereHas('integration', fn ($q) => $q->where('company_id', $companyId));
        } elseif (!Auth::user()->isSuperAdmin()) {
            $query->whereRaw('1=0');
        }

        if ($dateFrom) {
            $query->where('created_at', '>=', $dateFrom);
        }

        if ($dateTo) {
            $query->where('created_at', '<=', $dateTo . ' 23:59:59');
        }

        $total = $query->count();
        $approved = (clone $query)->where('status', 'approved')->count();
        $refused = (clone $query)->where('status', 'refused')->count();
        $cancelled = (clone $query)->where('status', 'cancelled')->count();
        $pending = (clone $query)->where('status', 'pending')->count();
        $refunded = (clone $query)->where('status', 'refunded')->count();

        $totalAmount = (float) (clone $query)->sum('amount');
        $approvedAmount = (float) (clone $query)->where('status', 'approved')->sum('amount');
        $refundedAmount = (float) (clone $query)->where('status', 'refunded')->sum('amount');

        $approvalRate = $total > 0 ? round(($approved / $total) * 100, 2) : 0;

        $methodsQuery = Transaction::query();

        if ($companyId) {
            $methodsQuery->whereHas('integration', fn ($q) => $q->where('company_id', $companyId));
        } elseif (!Auth::user()->isSuperAdmin()) {
            $methodsQuery->whereRaw('1=0');
        }

        $paymentMethods = $methodsQuery
            ->when($dateFrom, fn ($q) => $q->where('created_at', '>=', $dateFrom))
            ->when($dateTo, fn ($q) => $q->where('created_at', '<=', $dateTo . ' 23:59:59'))
            ->selectRaw('payment_method, COUNT(*) as total, SUM(amount) as total_amount')
            ->groupBy('payment_method')
            ->get()
            ->toArray();

        return [
            'date_from' => $dateFrom,
            'date_to' => $dateTo,
            'total_transactions' => $total,
            'approved_transactions' => $approved,
            'refused_transactions' => $refused,
            'cancelled_transactions' => $cancelled,
            'pending_transactions' => $pending,
            'refunded_transactions' => $refunded,
            'total_amount' => $totalAmount,
            'approved_amount' => $approvedAmount,
            'refunded_amount' => $refundedAmount,
            'approval_rate' => $approvalRate,
            'by_payment_method' => $paymentMethods,
        ];
    }
}
