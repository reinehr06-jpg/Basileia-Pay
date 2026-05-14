<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AnalyticsController extends Controller
{
    /**
     * Resumo de vendas e recusas
     */
    public function overview(Request $request)
    {
        $companyId = $request->user()->company_id;

        // Se usar mysql vs postgres/sqlite, o "date(occurred_at)" pode variar, 
        // mas aspas simples para sqlite/mysql e date() funciona bem na maioria.
        $from = $request->query('from', now()->subDays(7)->startOfDay());
        $to   = $request->query('to', now()->endOfDay());

        // Se estiver usando MySQL ou PostgreSQL:
        // no MySQL/SQLite DATE() funciona, PostgreSQL DATE() tbm
        $rows = DB::table('payment_events')
            ->selectRaw("
                DATE(occurred_at) as day,
                count(*) as total_events,
                sum(case when status_normalized = 'approved' then 1 else 0 end) as approved,
                sum(case when status_normalized = 'refused' then 1 else 0 end) as refused
            ")
            ->where('company_id', $companyId)
            ->whereBetween('occurred_at', [$from, $to])
            ->where('event_type', 'payment_status_update')
            ->groupByRaw('DATE(occurred_at)')
            ->orderBy('day')
            ->get();

        return response()->json([
            'from' => $from,
            'to'   => $to,
            'data' => $rows
        ]);
    }

    /**
     * Desempenho por gateway
     */
    public function byGateway(Request $request)
    {
        $companyId = $request->user()->company_id;
        
        $from = $request->query('from', now()->subDays(7)->startOfDay());
        $to   = $request->query('to', now()->endOfDay());

        $rows = DB::table('payment_events')
            ->selectRaw("
                gateway_type,
                count(*) as attempts,
                sum(case when status_normalized = 'approved' then 1 else 0 end) as approved,
                sum(case when status_normalized = 'refused' then 1 else 0 end) as refused
            ")
            ->where('company_id', $companyId)
            ->whereBetween('occurred_at', [$from, $to])
            ->where('event_type', 'payment_status_update')
            ->groupBy('gateway_type')
            ->get();

        return response()->json([
            'from' => $from,
            'to'   => $to,
            'data' => $rows
        ]);
    }
}
