<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\Company;
use App\Models\Gateway;
use App\Models\Integration;
use App\Models\Transaction;
use App\Models\WebhookDelivery;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        $companyId = $user->company_id;

        // If no company_id (super_admin), get first company
        if (!$companyId) {
            $company = Company::first();
            $companyId = $company?->id;
        }

        $monthStart = now()->startOfMonth();
        $lastMonthStart = now()->subMonth()->startOfMonth();
        $lastMonthEnd = now()->subMonth()->endOfMonth();
        $today = now()->startOfDay();

        // ─── Volume Stats ─────────────────────────────
        $volumeMonth = (float) Transaction::where('company_id', $companyId)
            ->where('created_at', '>=', $monthStart)
            ->sum('amount');

        $volumeLastMonth = (float) Transaction::where('company_id', $companyId)
            ->whereBetween('created_at', [$lastMonthStart, $lastMonthEnd])
            ->sum('amount');

        $volumeTrend = $volumeLastMonth > 0
            ? round((($volumeMonth - $volumeLastMonth) / $volumeLastMonth) * 100, 1)
            : 0;

        // ─── Approval Rate ───────────────────────────
        $totalMonth = Transaction::where('company_id', $companyId)
            ->where('created_at', '>=', $monthStart)
            ->count();

        $approvedCount = Transaction::where('company_id', $companyId)
            ->where('created_at', '>=', $monthStart)
            ->where('status', 'approved')
            ->count();

        $approvalRate = $totalMonth > 0 ? round(($approvedCount / $totalMonth) * 100, 1) : 0;

        // ─── Today Stats ─────────────────────────────
        $todayTransactions = Transaction::where('company_id', $companyId)
            ->where('created_at', '>=', $today)
            ->count();

        $todayVolume = (float) Transaction::where('company_id', $companyId)
            ->where('created_at', '>=', $today)
            ->sum('amount');

        // ─── Pending Transactions ────────────────────
        $pendingTransactions = Transaction::where('company_id', $companyId)
            ->where('status', 'pending')
            ->count();

        // ─── Integrations ────────────────────────────
        $activeIntegrations = Integration::where('company_id', $companyId)
            ->where('status', 'active')
            ->count();

        $totalIntegrations = Integration::where('company_id', $companyId)->count();

        // ─── Gateways ────────────────────────────────
        $defaultGateway = Gateway::where('company_id', $companyId)
            ->where('is_default', true)
            ->first();

        $activeGateways = Gateway::where('company_id', $companyId)
            ->where('status', 'active')
            ->count();

        // ─── Webhook Stats ───────────────────────────
        $webhookDelivered = WebhookDelivery::whereHas('endpoint.integration', function ($q) use ($companyId) {
                $q->where('company_id', $companyId);
            })
            ->where('status', 'delivered')
            ->count();

        $webhookFailed = WebhookDelivery::whereHas('endpoint.integration', function ($q) use ($companyId) {
                $q->where('company_id', $companyId);
            })
            ->where('status', 'failed')
            ->count();

        // ─── Daily Volume (last 7 days) ──────────────
        $dailyLabels = [];
        $dailyVolumes = [];

        for ($i = 6; $i >= 0; $i--) {
            $date = now()->subDays($i);
            $dayStart = $date->copy()->startOfDay();
            $dayEnd = $date->copy()->endOfDay();

            $dayVolume = (float) Transaction::where('company_id', $companyId)
                ->whereBetween('created_at', [$dayStart, $dayEnd])
                ->sum('amount');

            $dailyLabels[] = $date->translatedFormat('D');
            $dailyVolumes[] = round($dayVolume, 2);
        }

        // ─── Recent Transactions ─────────────────────
        $recentTransactions = Transaction::where('company_id', $companyId)
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        return view('dashboard.index', [
            'userName' => $user->name,
            'volumeMonth' => $volumeMonth,
            'volumeTrend' => $volumeTrend,
            'approvalRate' => $approvalRate,
            'approvedCount' => $approvedCount,
            'activeIntegrations' => $activeIntegrations,
            'totalIntegrations' => $totalIntegrations,
            'webhookDelivered' => $webhookDelivered,
            'webhookFailed' => $webhookFailed,
            'todayTransactions' => $todayTransactions,
            'todayVolume' => $todayVolume,
            'pendingTransactions' => $pendingTransactions,
            'defaultGateway' => $defaultGateway?->name ?? 'Nenhum',
            'activeGateways' => $activeGateways,
            'dailyLabels' => $dailyLabels,
            'dailyVolumes' => $dailyVolumes,
            'recentTransactions' => $recentTransactions,
        ]);
    }
}
