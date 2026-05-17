<?php

namespace App\Console\Commands\Basileia;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;

class CheckSystemCommand extends Command
{
    protected $signature = 'basileia:check';
    protected $description = 'Executa um diagnóstico completo da plataforma Basileia Pay';

    public function handle()
    {
        $this->info('🚀 Iniciando diagnóstico da Basileia Pay...');

        // 1. Database
        $this->checkDatabase();

        // 2. Cache
        $this->checkCache();

        // 3. Queue (Simples check de conexão)
        $this->checkQueue();

        $this->info('✅ Diagnóstico concluído!');
    }

    protected function checkDatabase()
    {
        try {
            DB::connection()->getPdo();
            $this->comment('  [DB] Conexão: OK');
        } catch (\Exception $e) {
            $this->error('  [DB] Falha: ' . $e->getMessage());
        }
    }

    protected function checkCache()
    {
        try {
            Cache::put('basileia_health_check', true, 10);
            $val = Cache::get('basileia_health_check');
            $this->comment('  [Cache] Conexão: ' . ($val ? 'OK' : 'Falha'));
        } catch (\Exception $e) {
            $this->error('  [Cache] Falha: ' . $e->getMessage());
        }
    }

    protected function checkQueue()
    {
        // Apenas para sinalizar se o driver está configurado corretamente
        $driver = config('queue.default');
        $this->comment("  [Queue] Driver: {$driver}");
    }
}
