<?php

namespace App\Http\Controllers\Api\V2;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ReportController extends Controller
{
    private function baseQuery(?string $from = null, ?string $to = null)
    {
        $q = Transaction::whereHas('integration', fn($q) =>
            $q->where('company_id', Auth::user()->company_id)
        );
        if ($from) $q->whereDate('created_at', '>=', $from);
        if ($to)   $q->whereDate('created_at', '<=', $to);
        return $q;
    }

    public function summary(Request $request): JsonResponse
    {
        $request->validate([
            'date_from' => 'nullable|date',
            'date_to'   => 'nullable|date|after_or_equal:date_from',
        ]);

        $from = $request->date_from;
        $to   = $request->date_to;
        $q    = $this->baseQuery($from, $to);

        $total    = (clone $q)->count();
        $approved = (clone $q)->where('status', 'approved')->count();
        $refused  = (clone $q)->where('status', 'refused')->count();
        $cancelled= (clone $q)->where('status', 'cancelled')->count();
        $pending  = (clone $q)->where('status', 'pending')->count();
        $refunded = (clone $q)->where('status', 'refunded')->count();

        $byMethod = (clone $q)
            ->selectRaw('payment_method, COUNT(*) as total, SUM(amount) as total_amount')
            ->groupBy('payment_method')
            ->get();

        return response()->json([
            'date_from'            => $from,
            'date_to'              => $to,
            'total_transactions'   => $total,
            'approved_transactions'=> $approved,
            'refused_transactions' => $refused,
            'cancelled_transactions'=> $cancelled,
            'pending_transactions' => $pending,
            'refunded_transactions'=> $refunded,
            'total_amount'         => (float) (clone $q)->sum('amount'),
            'approved_amount'      => (float) (clone $q)->where('status', 'approved')->sum('amount'),
            'approval_rate'        => $total > 0 ? round($approved / $total * 100, 2) : 0,
            'by_payment_method'    => $byMethod,
        ]);
    }

    public function export(Request $request)
    {
        $q = $this->baseQuery($request->date_from, $request->date_to)->with('customer', 'integration');
        if ($request->filled('status')) $q->where('status', $request->status);

        $transactions = $q->latest()->get();
        $filename = 'relatorio-' . now()->format('Y-m-d') . '.csv';

        return response()->streamDownload(function () use ($transactions) {
            $file = fopen('php://output', 'w');
            fprintf($file, chr(0xEF).chr(0xBB).chr(0xBF));
            fputcsv($file, ['UUID','Status','Método','Valor','Cliente','Email','Integração','Gateway','Data']);
            foreach ($transactions as $tx) {
                fputcsv($file, [
                    $tx->uuid, $tx->status, $tx->payment_method,
                    number_format($tx->amount, 2, ',', '.'),
                    $tx->customer_name ?? '', $tx->customer_email ?? '',
                    $tx->integration?->name, $tx->gateway,
                    $tx->created_at->format('d/m/Y H:i'),
                ]);
            }
            fclose($file);
        }, $filename, ['Content-Type' => 'text/csv; charset=UTF-8']);
    }
}
