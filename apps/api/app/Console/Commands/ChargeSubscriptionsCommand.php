<?php

namespace App\Console\Commands;

use App\Services\SubscriptionService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class ChargeSubscriptionsCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'billing:charge';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Process all active subscriptions due today and attempt charges with stored tokens.';

    /**
     * Execute the console command.
     */
    public function handle(SubscriptionService $service): int
    {
        $this->info('Starting daily subscription billing process...');
        Log::info('Billing:Charge started');

        try {
            $service->processDailyBilling();
            $this->info('Billing process completed successfully.');
            return Command::SUCCESS;
        } catch (\Exception $e) {
            $this->error('Billing process failed: ' . $e->getMessage());
            Log::error('Billing:Charge failed', ['error' => $e->getMessage()]);
            return Command::FAILURE;
        }
    }
}
