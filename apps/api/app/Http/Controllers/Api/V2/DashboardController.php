<?php

namespace App\Http\Controllers\Api\V2;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use App\Models\Integration;
use App\Models\WebhookLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class DashboardController extends Controller
{
    public function stats(): JsonResponse
    {
        $companyId = Auth::user()->company_id;

        $base = Transaction::whereHas('integration', fn($q) => $q->where('company_id', $companyId));

        // Volume mensal atual
        $volumeMonth = (float) (clone $base)
            ->whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->where('status', 'approved')
            ->sum('amount');

        // Volume mês anterior
        $volumeLastMonth = (float) (clone $base)
            ->whereMonth('created_at', now()->subMonth()->month)
            ->whereYear('created_at', now()->subMonth()->year)
            ->where('status', 'approved')
            ->sum('amount');

        $volumeTrend = $volumeLastMonth > 0
            ? round((($volumeMonth - $volumeLastMonth) / $volumeLastMonth) * 100, 1)
            : 0;

        // Taxa de aprovação
        $total    = (clone $base)->count();
        $approved = (clone $base)->where('status', 'approved')->count();
        $approvalRate = $total > 0 ? round($approved / $total * 100, 1) : 0;

        // Hoje
        $todayBase = (clone $base)->whereDate('created_at', today());
        $todayVolume = (float) (clone $todayBase)->where('status', 'approved')->sum('amount');
        $todayTransactions = (clone $todayBase)->count();
        $pendingTransactions = (clone $base)->where('status', 'pending')->count();

        // Gráfico 7 dias
        $dailyLabels  = [];
        $dailyVolumes = array_fill(0, 7, 0);
        $dateKeys = [];

        for ($i = 6; $i >= 0; $i--) {
            $day = now()->subDays($i);
            $dailyLabels[] = $day->format('d/m');
            $dateKeys[$day->toDateString()] = 6 - $i;
        }

        $chartData = (clone $base)
            ->where('created_at', '>=', now()->subDays(6)->startOfDay())
            ->where('status', 'approved')
            ->select(
                \Illuminate\Support\Facades\DB::raw('DATE(created_at) as date'),
                \Illuminate\Support\Facades\DB::raw('SUM(amount) as volume')
            )
            ->groupBy(\Illuminate\Support\Facades\DB::raw('DATE(created_at)'))
            ->get();

        foreach ($chartData as $stat) {
            $dateStr = $stat->date;
            if (isset($dateKeys[$dateStr])) {
                $idx = $dateKeys[$dateStr];
                $dailyVolumes[$idx] = (float) $stat->volume;
            }
        }

        // Conexões
        $integrations      = Integration::where('company_id', $companyId);
        $activeIntegrations = (clone $integrations)->where('status', 'active')->count();
        $totalIntegrations  = (clone $integrations)->count();

        // Webhook health
        $webhookDelivered = WebhookLog::where('company_id', $companyId)
            ->where('status', 'delivered')->count();
        $webhookFailed = WebhookLog::where('company_id', $companyId)
            ->where('status', 'failed')->count();

        // Transações recentes
        $recentTransactions = (clone $base)
            ->with('customer')
            ->latest()
            ->limit(10)
            ->get()
            ->map(fn($tx) => [
                'uuid'          => $tx->uuid,
                'customer_name' => $tx->customer_name ?? $tx->customer?->name,
                'amount'        => $tx->amount,
                'status'        => $tx->status,
                'payment_method'=> $tx->payment_method,
                'created_at'    => $tx->created_at,
            ]);

        return response()->json([
            'volume_month'        => $volumeMonth,
            'volume_trend'        => $volumeTrend,
            'approval_rate'       => $approvalRate,
            'approved_count'      => $approved,
            'today_volume'        => $todayVolume,
            'today_transactions'  => $todayTransactions,
            'pending_transactions'=> $pendingTransactions,
            'active_integrations' => $activeIntegrations,
            'total_integrations'  => $totalIntegrations,
            'webhook_delivered'   => $webhookDelivered,
            'webhook_failed'      => $webhookFailed,
            'daily_labels'        => $dailyLabels,
            'daily_volumes'       => $dailyVolumes,
            'recent_transactions' => $recentTransactions,
        ]);
    }
}
