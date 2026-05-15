<?php

namespace Database\Seeders;

use App\Models\ConnectedSystem;
use App\Models\ApiKey;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class ConnectedSystemSeeder extends Seeder
{
    public function run(): void
    {
        $system = ConnectedSystem::create([
            'company_id' => 1,
            'name' => 'Sistema Vendas Principal',
            'slug' => 'vendas-principal',
            'environment' => 'sandbox',
            'status' => 'active',
        ]);

        // Create a default API Key
        ApiKey::create([
            'company_id' => 1,
            'connected_system_id' => $system->id,
            'name' => 'Default API Key',
            'key' => 'bp_test_default_key',
            'key_hash' => hash('sha256', 'bp_test_default_key'),
            'environment' => 'sandbox',
        ]);
    }
}
