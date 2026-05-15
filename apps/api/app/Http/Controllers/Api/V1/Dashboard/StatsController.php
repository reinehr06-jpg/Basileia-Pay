<?php

namespace App\Http\Controllers\Api\V1\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\Order;
use App\Services\TenantContext;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class StatsController extends Controller
{
    public function index()
    {
        $companyId = TenantContext::companyId();
        
        $today = now()->startOfDay();

        // 1. Valor aprovado hoje
        $approvedToday = Payment::where('company_id', $companyId)
            ->where('status', 'paid')
            ->where('created_at', '>=', $today)
            ->sum('amount');

        // 2. Quantidade de vendas hoje
        $ordersToday = Order::where('company_id', $companyId)
            ->where('created_at', '>=', $today)
            ->count();

        // 3. Pagamentos pendentes
        $pendingPayments = Payment::where('company_id', $companyId)
            ->where('status', 'pending')
            ->count();

        // 4. Falhas de gateway (24h)
        $failedPayments = Payment::where('company_id', $companyId)
            ->where('status', 'failed')
            ->where('created_at', '>=', now()->subDay())
            ->count();

        // 5. Últimos eventos (simplificado por enquanto)
        $latestPayments = Payment::where('company_id', $companyId)
            ->with(['order'])
            ->latest()
            ->limit(5)
            ->get()
            ->map(fn($p) => [
                'event' => 'Pagamento ' . $p->status,
                'time_ago' => $p->created_at->diffForHumans(),
            ]);

        return response()->json([
            'success' => true,
            'data' => [
                'approved_today' => $approvedToday,
                'orders_today' => $ordersToday,
                'pending_payments' => $pendingPayments,
                'failed_payments' => $failedPayments,
                'latest_events' => $latestPayments,
            ]
        ]);
    }
}
