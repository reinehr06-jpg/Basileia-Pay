<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

class FixGatewaySlug extends Command
{
    protected $signature = 'gateway:fix-slug';
    protected $description = 'Fix missing slug column in gateways table';

    public function handle(): int
    {
        try {
            if (!Schema::hasColumn('gateways', 'slug')) {
                DB::statement('ALTER TABLE gateways ADD COLUMN slug VARCHAR(255) UNIQUE');
                $this->info('Added slug column');
            }

            DB::table('gateways')
                ->whereNull('slug')
                ->where('type', 'asaas')
                ->update(['slug' => 'asaas']);
            
            $this->info('Updated existing gateways with slug');
            return Command::SUCCESS;
        } catch (\Exception $e) {
            $this->error('Error: ' . $e->getMessage());
            return Command::FAILURE;
        }
    }
}
