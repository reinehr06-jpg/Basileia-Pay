<?php

namespace Database\Seeders;

use App\Models\GatewayAccount;
use App\Models\GatewayCredential;
use Illuminate\Database\Seeder;

class GatewaySeeder extends Seeder
{
    public function run(): void
    {
        $account = GatewayAccount::create([
            'company_id' => 1,
            'name' => 'Asaas Principal',
            'gateway_type' => 'asaas',
            'environment' => 'sandbox',
            'status' => 'active',
        ]);

        GatewayCredential::create([
            'gateway_account_id' => $account->id,
            'key' => 'api_key',
            'value' => 'fake_asaas_key_for_testing',
        ]);
        
        // Stripe for testing Phase 2
        $stripe = GatewayAccount::create([
            'company_id' => 1,
            'name' => 'Stripe Global',
            'gateway_type' => 'stripe',
            'environment' => 'sandbox',
            'status' => 'active',
        ]);

        GatewayCredential::create([
            'gateway_account_id' => $stripe->id,
            'key' => 'secret_key',
            'value' => 'sk_test_fake_stripe_key',
        ]);
    }
}
