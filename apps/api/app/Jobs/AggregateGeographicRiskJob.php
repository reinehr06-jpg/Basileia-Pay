<?php

namespace App\Jobs;

use App\Models\CheckoutSessionAnalytics;
use App\Models\GeographicRiskSignal;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;

class AggregateGeographicRiskJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $queue = 'analytics';

    public function handle(): void
    {
        $window = now()->subHour();
        $windowEnd = now();

        $sessions = CheckoutSessionAnalytics::whereBetween('created_at', [$window, $windowEnd])
            ->select([
                'company_id', 'system_id',
                'country', 'state', 'city', 'device_type',
                DB::raw("EXTRACT(HOUR FROM created_at) as hour_bucket"),
                DB::raw("EXTRACT(DOW FROM created_at) as day_of_week"),
                DB::raw("COUNT(*) as total_sessions"),
                DB::raw("SUM(CASE WHEN status = 'paid' THEN 1 ELSE 0 END) as total_paid"),
                DB::raw("SUM(CASE WHEN status = 'abandoned' THEN 1 ELSE 0 END) as total_abandoned"),
                DB::raw("SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as total_refused"),
            ])
            ->groupBy([
                'company_id', 'system_id',
                'country', 'state', 'city', 'device_type',
                'hour_bucket', 'day_of_week',
            ])
            ->get();

        foreach ($sessions as $row) {
            $conversionRate = $row->total_sessions > 0
                ? round(($row->total_paid / $row->total_sessions) * 100, 2)
                : 0;

            $refusalRate = $row->total_sessions > 0
                ? round(($row->total_refused / $row->total_sessions) * 100, 2)
                : 0;

            $riskLevel = $this->calculateRiskLevel($conversionRate, $refusalRate, $row->total_sessions);

            GeographicRiskSignal::updateOrCreate(
                [
                    'company_id' => $row->company_id,
                    'country' => $row->country ?? 'BR',
                    'state' => $row->state,
                    'hour_bucket' => $row->hour_bucket,
                    'day_of_week' => $row->day_of_week,
                    'device_type' => $row->device_type,
                    'window_start' => $window,
                ],
                [
                    'system_id' => $row->system_id,
                    'total_sessions' => $row->total_sessions,
                    'total_paid' => $row->total_paid,
                    'total_abandoned' => $row->total_abandoned,
                    'total_refused' => $row->total_refused,
                    'conversion_rate' => $conversionRate,
                    'refusal_rate' => $refusalRate,
                    'risk_level' => $riskLevel,
                    'window_end' => $windowEnd,
                    'updated_at' => now(),
                ]
            );
        }
    }

    private function calculateRiskLevel(float $conversion, float $refusal, int $total): string
    {
        if ($total < 5) return 'low';
        return match(true) {
            $refusal >= 40 || $conversion < 5   => 'critical',
            $refusal >= 25 || $conversion < 15  => 'high',
            $refusal >= 10 || $conversion < 25  => 'medium',
            default                              => 'low',
        };
    }
}
