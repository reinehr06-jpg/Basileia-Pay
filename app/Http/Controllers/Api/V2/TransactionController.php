<?php

namespace App\Http\Controllers\Api\V2;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\StreamedResponse;
use Illuminate\Support\Facades\Auth;

class TransactionController extends Controller
{
    private function baseQuery()
    {
        return Transaction::whereHas('integration', fn($q) =>
            $q->where('company_id', Auth::user()->company_id)
        );
    }

    public function index(Request $request): JsonResponse
    {
        $query = $this->baseQuery()->with('customer');

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        if ($request->filled('method')) {
            $query->where('payment_method', $request->method);
        }
        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }
        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }
        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('uuid', 'like', "%{$request->search}%")
                  ->orWhere('customer_name', 'like', "%{$request->search}%")
                  ->orWhere('customer_email', 'like', "%{$request->search}%");
            });
        }

        $transactions = $query->latest()->paginate($request->per_page ?? 20);

        return response()->json([
            'data' => $transactions->getCollection()->map(fn($tx) => [
                'id'             => $tx->id,
                'uuid'           => $tx->uuid,
                'status'         => $tx->status,
                'payment_method' => $tx->payment_method,
                'amount'         => $tx->amount,
                'customer_name'  => $tx->customer_name ?? $tx->customer?->name,
                'customer_email' => $tx->customer_email ?? $tx->customer?->email,
                'created_at'     => $tx->created_at,
                'paid_at'        => $tx->paid_at,
            ]),
            'meta' => [
                'current_page' => $transactions->currentPage(),
                'last_page'    => $transactions->lastPage(),
                'per_page'     => $transactions->perPage(),
                'total'        => $transactions->total(),
            ],
        ]);
    }

    public function show(int $id): JsonResponse
    {
        $tx = $this->baseQuery()
            ->with(['customer', 'payments', 'items', 'integration', 'gateway'])
            ->findOrFail($id);

        return response()->json([
            'id'             => $tx->id,
            'uuid'           => $tx->uuid,
            'status'         => $tx->status,
            'payment_method' => $tx->payment_method,
            'amount'         => $tx->amount,
            'net_amount'     => $tx->net_amount,
            'currency'       => $tx->currency,
            'installments'   => $tx->installments,
            'description'    => $tx->description,
            'customer'       => [
                'name'     => $tx->customer_name ?? $tx->customer?->name,
                'email'    => $tx->customer_email ?? $tx->customer?->email,
                'document' => $tx->customer_document ?? $tx->customer?->document,
                'phone'    => $tx->customer_phone ?? $tx->customer?->phone,
            ],
            'gateway'        => $tx->gateway?->only('id', 'name', 'slug'),
            'integration'    => $tx->integration?->only('id', 'name'),
            'payments'       => $tx->payments,
            'items'          => $tx->items,
            'paid_at'        => $tx->paid_at,
            'created_at'     => $tx->created_at,
            'updated_at'     => $tx->updated_at,
        ]);
    }

    public function cancel(int $id): JsonResponse
    {
        $tx = $this->baseQuery()->findOrFail($id);

        if (! $tx->canBeCancelled()) {
            return response()->json(['message' => 'Esta transação não pode ser cancelada.'], 422);
        }

        $tx->update(['status' => 'cancelled', 'cancelled_at' => now()]);
        return response()->json(['message' => 'Transação cancelada.', 'status' => 'cancelled']);
    }

    public function refund(int $id): JsonResponse
    {
        $tx = $this->baseQuery()->findOrFail($id);

        if (! $tx->canBeRefunded()) {
            return response()->json(['message' => 'Esta transação não pode ser estornada.'], 422);
        }

        $tx->update(['status' => 'refunded', 'refunded_at' => now()]);
        return response()->json(['message' => 'Estorno realizado.', 'status' => 'refunded']);
    }

    public function export(Request $request): StreamedResponse
    {
        $query = $this->baseQuery()->with('customer', 'integration');

        if ($request->filled('status'))    $query->where('status', $request->status);
        if ($request->filled('date_from')) $query->whereDate('created_at', '>=', $request->date_from);
        if ($request->filled('date_to'))   $query->whereDate('created_at', '<=', $request->date_to);

        $transactions = $query->latest()->get();

        $filename = 'transacoes-' . now()->format('Y-m-d') . '.csv';

        return response()->streamDownload(function () use ($transactions) {
            $file = fopen('php://output', 'w');
            fprintf($file, chr(0xEF).chr(0xBB).chr(0xBF)); // BOM UTF-8
            fputcsv($file, ['UUID','Status','Método','Valor','Cliente','Email','Documento','Integração','Data']);
            foreach ($transactions as $tx) {
                fputcsv($file, [
                    $tx->uuid,
                    $tx->status,
                    $tx->payment_method,
                    number_format($tx->amount, 2, ',', '.'),
                    $tx->customer_name ?? $tx->customer?->name,
                    $tx->customer_email ?? $tx->customer?->email,
                    $tx->customer_document ?? $tx->customer?->document,
                    $tx->integration?->name,
                    $tx->created_at->format('d/m/Y H:i'),
                ]);
            }
            fclose($file);
        }, $filename, ['Content-Type' => 'text/csv; charset=UTF-8']);
    }
}
