<?php

namespace Database\Seeders;

use App\Models\GatewayAccount;
use Illuminate\Database\Seeder;

class GatewaySeeder extends Seeder
{
    public function run(): void
    {
        GatewayAccount::create([
            'company_id' => 1,
            'name' => 'Asaas Principal',
            'provider' => 'asaas',
            'credentials_encrypted' => encrypt([
                'api_key' => 'fake_key',
            ]),
            'environment' => 'sandbox',
            'status' => 'active',
        ]);
    }
}
