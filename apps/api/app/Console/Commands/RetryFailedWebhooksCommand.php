<?php

namespace App\Console\Commands;

use App\Models\WebhookDelivery;
use App\Services\WebhookService;
use Illuminate\Console\Command;

class RetryFailedWebhooksCommand extends Command
{
    protected $signature = 'webhooks:retry-failed';
    protected $description = 'Retry failed webhook deliveries';

    public function handle(WebhookService $webhookService): int
    {
        $deliveries = WebhookDelivery::where('status', 'pending')
            ->where('next_retry_at', '<=', now())
            ->where('attempts', '<', \DB::raw('max_attempts'))
            ->get();

        foreach ($deliveries as $delivery) {
            $webhookService->retry($delivery);
        }

        $this->info("Retried {$deliveries->count()} webhook deliveries.");
        return self::SUCCESS;
    }
}
