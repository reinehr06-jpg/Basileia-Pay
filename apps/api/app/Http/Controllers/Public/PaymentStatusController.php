<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use Illuminate\Http\Request;

class PaymentStatusController extends Controller
{
    public function show(string $uuid)
    {
        $transaction = Transaction::where('uuid', $uuid)
            ->with(['customer', 'payments', 'items'])
            ->first();

        if (!$transaction) {
            return view('checkout.error', [
                'message' => 'Pagamento não encontrado.',
            ]);
        }

        $autoRefresh = $transaction->status === 'pending';

        return view('checkout.status', [
            'transaction' => $transaction,
            'autoRefresh' => $autoRefresh,
            'refreshInterval' => 10,
        ]);
    }
}
