<?php

namespace App\Console\Commands;

use App\Models\Company;
use App\Services\ReportService;
use Illuminate\Console\Command;

class GenerateDailyReportCommand extends Command
{
    protected $signature = 'reports:generate-daily';
    protected $description = 'Generate daily financial reports';

    public function handle(ReportService $reportService): int
    {
        $companies = Company::active()->get();

        foreach ($companies as $company) {
            $reportService->generateSummary(
                $company,
                now()->startOfDay(),
                now()->endOfDay()
            );
        }

        $this->info("Generated daily reports for {$companies->count()} companies.");
        return self::SUCCESS;
    }
}
