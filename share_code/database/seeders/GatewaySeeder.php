<?php

namespace Database\Seeders;

use App\Models\Company;
use App\Models\Gateway;
use Illuminate\Database\Seeder;

class GatewaySeeder extends Seeder
{
    public function run(): void
    {
        $company = Company::first();
        if (!$company) return;

        Gateway::create([
            'company_id' => $company->id,
            'name' => 'Asaas Principal',
            'slug' => 'asaas',
            'type' => 'asaas',
            'status' => 'active',
            'is_default' => true,
        ]);
    }
}
