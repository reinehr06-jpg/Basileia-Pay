<?php

namespace Database\Seeders;

use App\Models\SourceConfig;
use Illuminate\Database\Seeder;

class SourceConfigSeeder extends Seeder
{
    public function run(): void
    {
        $sources = [
            [
                'source_name' => 'basileia_vendas',
                'callback_url' => env('BASILEIA_VENDAS_WEBHOOK_URL', 'http://localhost:8000/api/webhook/checkout'),
                'webhook_secret' => env('BASILEIA_VENDAS_WEBHOOK_SECRET', 'change_me_in_production'),
                'active' => true,
            ],
        ];

        foreach ($sources as $source) {
            SourceConfig::updateOrCreate(
                ['source_name' => $source['source_name']],
                $source
            );
        }
    }
}