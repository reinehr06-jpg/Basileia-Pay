<?php

namespace App\Console\Commands\Checkout;

use App\Services\Recovery\RecoveryEngine;
use Illuminate\Console\Command;

class RecoverSessionsCommand extends Command
{
    protected $signature = 'checkout:recover';
    protected $description = 'Processa a recuperação de checkouts abandonados';

    public function handle(RecoveryEngine $engine)
    {
        $this->info('Iniciando processamento de recuperação...');
        
        $engine->run();
        
        $this->info('Processamento concluído.');
    }
}
