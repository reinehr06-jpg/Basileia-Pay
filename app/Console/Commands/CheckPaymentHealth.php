<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class CheckPaymentHealth extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'payments:check-health';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Verifica taxa de aprovação e alerta se cair demais';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        // Analisa os últimos 15 minutos
        $since = now()->subMinutes(15);

        $stats = DB::table('payment_events')
            ->selectRaw("
                gateway_type,
                count(*) as attempts,
                sum(case when status_normalized = 'approved' then 1 else 0 end) as approved
            ")
            ->where('occurred_at', '>=', $since)
            ->where('event_type', 'payment_status_update')
            ->groupBy('gateway_type')
            ->get();

        foreach ($stats as $row) {
            // Se tiver menos de 10 tentativas em 15 minutos, a amostragem é pequena demais para alertar
            if ($row->attempts < 10) {
                continue;
            }

            $rate = $row->approved / max($row->attempts, 1);

            // Menos de 70% de aprovação (ajustável)
            if ($rate < 0.70) {
                // Emita um log de warning que será pego por sistemas como ELK/Sentry
                Log::warning('payments.low_approval_rate', [
                    'gateway'  => $row->gateway_type,
                    'attempts' => $row->attempts,
                    'approved' => $row->approved,
                    'rate'     => round($rate * 100, 2) . '%',
                    'since'    => $since->toIso8601String(),
                ]);
                
                $this->warn("Alerta: Gateway {$row->gateway_type} com aprovação de " . round($rate * 100, 2) . "%");
            } else {
                $this->info("Saudável: Gateway {$row->gateway_type} com aprovação de " . round($rate * 100, 2) . "%");
            }
        }

        return Command::SUCCESS;
    }
}
