<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class ReportController extends Controller
{
    public function summary(Request $request)
    {
        $request->validate([
            'date_from' => 'sometimes|date',
            'date_to' => 'sometimes|date|after_or_equal:date_from',
        ]);

        $integration = $request->attributes->get('integration');

        $query = Transaction::where('integration_id', $integration->id);

        if ($request->filled('date_from')) {
            $query->where('created_at', '>=', $request->input('date_from'));
        }

        if ($request->filled('date_to')) {
            $query->where('created_at', '<=', $request->input('date_to') . ' 23:59:59');
        }

        $total = $query->count();
        $approved = (clone $query)->where('status', 'approved')->count();
        $refused = (clone $query)->where('status', 'refused')->count();
        $cancelled = (clone $query)->where('status', 'cancelled')->count();
        $pending = (clone $query)->where('status', 'pending')->count();

        $totalAmount = (clone $query)->sum('amount');
        $approvedAmount = (clone $query)->where('status', 'approved')->sum('amount');

        $approvalRate = $total > 0 ? round(($approved / $total) * 100, 2) : 0;

        return response()->json([
            'summary' => [
                'total_transactions' => $total,
                'approved_transactions' => $approved,
                'refused_transactions' => $refused,
                'cancelled_transactions' => $cancelled,
                'pending_transactions' => $pending,
                'total_amount' => (float) $totalAmount,
                'approved_amount' => (float) $approvedAmount,
                'approval_rate' => $approvalRate,
            ],
        ]);
    }

    public function transactions(Request $request)
    {
        $request->validate([
            'date_from' => 'sometimes|date',
            'date_to' => 'sometimes|date|after_or_equal:date_from',
            'status' => 'sometimes|in:pending,approved,refused,cancelled,refunded',
            'payment_method' => 'sometimes|in:pix,boleto,credit_card,debit_card',
            'per_page' => 'sometimes|integer|min:1|max:500',
        ]);

        $integration = $request->attributes->get('integration');

        $query = Transaction::where('integration_id', $integration->id)
            ->with(['customer', 'payments']);

        if ($request->filled('date_from')) {
            $query->where('created_at', '>=', $request->input('date_from'));
        }

        if ($request->filled('date_to')) {
            $query->where('created_at', '<=', $request->input('date_to') . ' 23:59:59');
        }

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->filled('payment_method')) {
            $query->where('payment_method', $request->input('payment_method'));
        }

        $transactions = $query->orderBy('created_at', 'desc')
            ->paginate($request->input('per_page', 15));

        return response()->json($transactions);
    }
}
