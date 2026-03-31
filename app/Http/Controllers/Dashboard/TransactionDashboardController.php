<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class TransactionDashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        $companyId = $user->company_id;

        $request->validate([
            'status' => 'sometimes|in:pending,approved,refused,cancelled,refunded',
            'date_from' => 'sometimes|date',
            'date_to' => 'sometimes|date|after_or_equal:date_from',
            'gateway' => 'sometimes|string',
            'integration_id' => 'sometimes|integer|exists:integrations,id',
            'search' => 'sometimes|string|max:255',
        ]);

        $query = Transaction::where('company_id', $companyId)
            ->with(['customer', 'integration', 'payments']);

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->filled('date_from')) {
            $query->where('created_at', '>=', $request->input('date_from'));
        }

        if ($request->filled('date_to')) {
            $query->where('created_at', '<=', $request->input('date_to') . ' 23:59:59');
        }

        if ($request->filled('gateway')) {
            $query->where('gateway', $request->input('gateway'));
        }

        if ($request->filled('integration_id')) {
            $query->where('integration_id', $request->input('integration_id'));
        }

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('uuid', 'like', "%{$search}%")
                  ->orWhereHas('customer', fn ($c) =>
                      $c->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhere('document', 'like', "%{$search}%")
                  );
            });
        }

        $transactions = $query->orderBy('created_at', 'desc')->paginate(20);

        $filters = $request->only(['status', 'date_from', 'date_to', 'gateway', 'integration_id', 'search']);

        return view('dashboard.transactions.index', compact('transactions', 'filters'));
    }

    public function show(Request $request, int $id)
    {
        $user = Auth::user();
        $companyId = $user->company_id;

        $transaction = Transaction::where('company_id', $companyId)
            ->orWhereHas('integration', fn ($q) => $q->where('company_id', $companyId))
            ->with(['customer', 'integration', 'payments', 'items', 'fraudAnalysis'])
            ->find($id);

        if (!$transaction) {
            abort(404, 'Transação não encontrada.');
        }

        return view('dashboard.transactions.show', compact('transaction'));
    }

    public function export(Request $request)
    {
        $user = Auth::user();
        $companyId = $user->company_id;

        $transactions = Transaction::where('company_id', $companyId)
            ->with(['customer', 'integration'])
            ->orderBy('created_at', 'desc')
            ->limit(5000)
            ->get();

        $csv = "UUID,Cliente,Email,Valor,Moeda,Método,Status,Data\n";
        foreach ($transactions as $tx) {
            $csv .= sprintf(
                "%s,%s,%s,%.2f,%s,%s,%s,%s\n",
                $tx->uuid,
                $tx->customer?->name ?? '-',
                $tx->customer?->email ?? '-',
                $tx->amount,
                $tx->currency,
                $tx->payment_method,
                $tx->status,
                $tx->created_at?->format('Y-m-d H:i:s') ?? '-',
            );
        }

        return response($csv)
            ->header('Content-Type', 'text/csv')
            ->header('Content-Disposition', 'attachment; filename="transacoes_' . date('Y-m-d') . '.csv"');
    }
}
