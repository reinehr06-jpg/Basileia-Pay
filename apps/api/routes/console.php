<?php

use Illuminate\Support\Facades\Schedule;
use App\Commands\RetryFailedWebhooks;

Schedule::command('webhooks:retry-failed')->everyFiveMinutes();
Schedule::command('payments:sync-pending')->everyTenMinutes();
Schedule::command('reports:generate-daily')->dailyAt('02:00');
Schedule::command('logs:cleanup')->weekly();
Schedule::command('payments:check-health')->everyFiveMinutes();
