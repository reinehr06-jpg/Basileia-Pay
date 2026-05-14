<?php

namespace Database\Seeders;

use App\Models\Company;
use Illuminate\Database\Seeder;

class CompanySeeder extends Seeder
{
    public function run(): void
    {
        Company::create([
            'name' => 'Checkout Platform',
            'slug' => 'checkout-platform',
            'status' => 'active',
            'settings' => [
                'default_currency' => 'BRL',
                'default_gateway' => 'asaas',
            ],
        ]);
    }
}
