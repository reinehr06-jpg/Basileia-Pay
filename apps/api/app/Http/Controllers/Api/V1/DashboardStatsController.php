<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Payment;
use App\Models\ConnectedSystem;
use App\Models\GatewayWebhookEvent;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class DashboardStatsController extends Controller
{
    public function index(): JsonResponse
    {
        $companyId = Auth::user()->company_id;

        // Hoje
        $today = now()->startOfDay();
        
        $approvedToday = (float) Payment::where('company_id', $companyId)
            ->where('status', 'approved')
            ->where('approved_at', '>=', $today)
            ->sum('amount');

        $ordersToday = Order::where('company_id', $companyId)
            ->where('created_at', '>=', $today)
            ->count();

        $pendingPayments = Payment::where('company_id', $companyId)
            ->where('status', 'pending')
            ->count();

        $gatewayFailures = GatewayWebhookEvent::where('company_id', $companyId)
            ->where('status', 'error')
            ->where('created_at', '>=', now()->subHours(24))
            ->count();

        // Gráfico 7 dias
        $salesLast7Days = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = now()->subDays($i)->startOfDay();
            $salesLast7Days[] = [
                'date'   => $date->format('d/m'),
                'amount' => (float) Payment::where('company_id', $companyId)
                    ->where('status', 'approved')
                    ->whereDate('approved_at', $date->toDateString())
                    ->sum('amount')
            ];
        }

        // Sistemas Status
        $systemsStatus = ConnectedSystem::where('company_id', $companyId)
            ->get()
            ->map(fn($system) => [
                'name'   => $system->name,
                'status' => $system->status,
            ]);

        return response()->json([
            'approvedToday'    => $approvedToday,
            'ordersToday'      => $ordersToday,
            'pendingPayments'  => $pendingPayments,
            'gatewayFailures'  => $gatewayFailures,
            'salesLast7Days'   => $salesLast7Days,
            'systemsStatus'    => $systemsStatus,
            // Trends mock for now
            'approvedTrend'    => '+12.5%',
            'ordersTrend'      => '+5.2%',
            'recentEvents'     => $this->getRecentEvents($companyId),
        ]);
    }

    private function getRecentEvents($companyId)
    {
        // Simple mock of recent audit events or timeline events
        return [
            ['event' => 'Pagamento aprovado', 'time' => 'Há 5 min'],
            ['event' => 'Checkout publicado', 'time' => 'Há 1h'],
            ['event' => 'Gateway configurado', 'time' => 'Há 3h'],
        ];
    }
}
