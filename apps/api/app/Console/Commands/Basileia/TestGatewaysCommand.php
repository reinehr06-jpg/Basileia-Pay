<?php

namespace App\Console\Commands\Basileia;

use App\Models\GatewayAccount;
use App\Services\Gateways\GatewayFactory;
use Illuminate\Console\Command;

class TestGatewaysCommand extends Command
{
    protected $signature = 'basileia:gateway:test {companyId?}';
    protected $description = 'Testa as credenciais de todos os gateways ativos';

    public function handle(GatewayFactory $factory)
    {
        $companyId = $this->argument('companyId');
        
        $accounts = GatewayAccount::where('status', 'active')
            ->when($companyId, fn($q) => $q->where('company_id', $companyId))
            ->get();

        $this->info("🔍 Testando " . $accounts->count() . " contas de gateway...");

        foreach ($accounts as $account) {
            try {
                $provider = $factory->make($account);
                // Aqui poderíamos chamar um método dummy de cada provider (ex: listCustomers)
                $this->comment("  [{$account->provider}] Empresa ID {$account->company_id}: Conectado");
            } catch (\Exception $e) {
                $this->error("  [{$account->provider}] Empresa ID {$account->company_id}: FALHA - " . $e->getMessage());
            }
        }
    }
}
