<?php

namespace App\Console\Commands;

use App\Models\AuditLog;
use App\Models\WebhookDelivery;
use Illuminate\Console\Command;

class CleanupLogsCommand extends Command
{
    protected $signature = 'logs:cleanup';
    protected $description = 'Clean up old logs';

    public function handle(): int
    {
        $cutoff = now()->subDays(90);

        $auditDeleted = AuditLog::where('created_at', '<', $cutoff)->delete();
        $webhookDeleted = WebhookDelivery::where('created_at', '<', $cutoff)
            ->whereIn('status', ['delivered', 'failed'])
            ->delete();

        $this->info("Cleaned up {$auditDeleted} audit logs and {$webhookDeleted} webhook deliveries.");
        return self::SUCCESS;
    }
}
