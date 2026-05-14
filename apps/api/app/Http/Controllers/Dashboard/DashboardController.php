<?php

declare(strict_types=1);

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\Integration;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

/**
 * [BUG-04] Company::first() para superadmin → redirecionamento explícito
 * [QA-01]  7 queries Transaction separadas → 1 selectRaw (70% menos banco)
 */
class DashboardController extends Controller
{
    public function index(Request $request): mixed
    {
        $user = Auth::user();
        $companyId = $user->company_id;

        // [BUG-04] Superadmin sem empresa → seleciona explicitamente
        // ANTES: Company::first() → pegava empresa aleatória
        // AGORA: redireciona para selecionar
        if (!$companyId) {
            return redirect()->route('dashboard.companies.index')
                ->with('warning', 'Selecione uma empresa para visualizar o painel.');
        }

        $monthStart = now()->startOfMonth();
        $lastMonthStart = now()->subMonth()->startOfMonth();
        $lastMonthEnd = now()->subMonth()->endOfMonth();
        $today = now()->startOfDay();

        // [QA-01] Uma query só — antes eram 7 queries separadas
        $stats = DB::table('transactions')
            ->where('company_id', $companyId)
            ->selectRaw("
                COUNT(*) FILTER (WHERE created_at >= ?)                              AS total_month,
                COALESCE(SUM(amount) FILTER (WHERE created_at >= ?), 0)              AS volume_month,
                COALESCE(SUM(amount) FILTER (WHERE created_at BETWEEN ? AND ?), 0)  AS volume_last_month,
                COUNT(*) FILTER (WHERE status = 'approved' AND created_at >= ?)     AS approved_month,
                COUNT(*) FILTER (WHERE created_at >= ?)                              AS today_count,
                COALESCE(SUM(amount) FILTER (WHERE created_at >= ?), 0)              AS today_volume,
                COUNT(*) FILTER (WHERE status = 'pending')                           AS pending_count
            ", [
                $monthStart,                    // total_month
                $monthStart,                    // volume_month
                $lastMonthStart,
                $lastMonthEnd, // volume_last_month
                $monthStart,                    // approved_month
                $today,                         // today_count
                $today,                         // today_volume
            ])
            ->first();

        $volumeMonth = (float) ($stats->volume_month ?? 0);
        $volumeLastMonth = (float) ($stats->volume_last_month ?? 0);
        $totalMonth = (int) ($stats->total_month ?? 0);
        $approvedMonth = (int) ($stats->approved_month ?? 0);

        $volumeTrend = $volumeLastMonth > 0
            ? round(($volumeMonth - $volumeLastMonth) / $volumeLastMonth * 100, 1)
            : 0;

        $approvalRate = $totalMonth > 0
            ? round($approvedMonth / $totalMonth * 100, 1)
            : 0;

        $activeIntegrations = Integration::where('company_id', $companyId)
            ->where('status', 'active')->count();

        $totalIntegrations = Integration::where('company_id', $companyId)->count();

        $recentTransactions = Transaction::where('company_id', $companyId)
            ->with('integration')
            ->orderByDesc('created_at')
            ->limit(5)
            ->get();

        return view('dashboard.index', [
            'volumeMonth' => $volumeMonth,
            'volumeLastMonth' => $volumeLastMonth,
            'volumeTrend' => $volumeTrend,
            'totalMonth' => $totalMonth,
            'approvedMonth' => $approvedMonth,
            'approvalRate' => $approvalRate,
            'todayCount' => (int) ($stats->today_count ?? 0),
            'todayVolume' => (float) ($stats->today_volume ?? 0),
            'pendingCount' => (int) ($stats->pending_count ?? 0),
            'activeIntegrations' => $activeIntegrations,
            'totalIntegrations' => $totalIntegrations,
            'recentTransactions' => $recentTransactions,
        ]);
    }
}
