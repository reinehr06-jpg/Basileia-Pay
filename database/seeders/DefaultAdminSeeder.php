<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Company;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DefaultAdminSeeder extends Seeder
{
    public function run(): void
    {
        $company = Company::first();

        User::create([
            'company_id' => $company?->id,
            'name' => 'Admin',
            'email' => 'admin@checkout.com',
            'password' => Hash::make('admin123'),
            'role' => 'super_admin',
            'status' => 'active',
            'email_verified_at' => now(),
        ]);
    }
}
