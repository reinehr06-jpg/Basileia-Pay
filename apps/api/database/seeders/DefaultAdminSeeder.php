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
        $adminEmail = env('ADMIN_EMAIL');
        $adminPassword = env('ADMIN_PASSWORD');

        if (!$adminEmail || !$adminPassword) {
            $this->command->warn("ADMIN_EMAIL ou ADMIN_PASSWORD não definidos no .env. Ignorando criação de admin.");
            return;
        }

        $company = Company::first();

        User::updateOrCreate(
            ['email' => $adminEmail],
            [
                'company_id' => $company?->id,
                'name' => 'Administrator',
                'password' => Hash::make($adminPassword),
                'role' => 'super_admin',
                'status' => 'active',
                'email_verified_at' => now(),
                'must_change_password' => false,
                'failed_login_attempts' => 0,
                'locked_until' => null,
            ]
        );

        $this->command->info("Admin configurado com as credenciais de ambiente com sucesso.");
    }
}