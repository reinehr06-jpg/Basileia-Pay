<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Company;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DefaultAdminSeeder extends Seeder
{
    public function run(): void
    {
        $adminEmail = env('ADMIN_EMAIL');
        $adminPassword = env('ADMIN_PASSWORD');

        // Se estiver rodando no terminal/console de forma interativa e não houver env vars
        if (empty($adminEmail) && app()->runningInConsole() && $this->command) {
            $this->command->info('=== Configuração Segura do Super Admin ===');

            // Solicita o email do administrador
            $adminEmail = $this->command->ask('Digite o e-mail do Super Admin (ex: admin@basileia.global)');
            while (empty($adminEmail) || !filter_var($adminEmail, FILTER_VALIDATE_EMAIL)) {
                $this->command->error('Por favor, insira um endereço de e-mail válido.');
                $adminEmail = $this->command->ask('Digite o e-mail do Super Admin (ex: admin@basileia.global)');
            }

            // Solicita a senha de forma segura (mascarada)
            $adminPassword = $this->command->secret('Digite a senha do Super Admin (deixe vazio para gerar uma senha aleatória)');
        }

        $adminEmail = strtolower(trim($adminEmail ?? ''));

        // Fallbacks caso não seja interativo ou esteja vazio
        if (empty($adminEmail)) {
            $this->command->error('Erro: Nenhum e-mail de administrador foi fornecido (defina ADMIN_EMAIL no .env).');
            return;
        }

        $generated = false;
        if (empty($adminPassword)) {
            $adminPassword = $this->generateStrongPassword();
            $generated = true;
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
                'two_factor_enabled' => false,
                'failed_attempts' => 0,
                'locked_at' => null,
            ]
        );

        $this->command->info("✅ Super admin configurado com sucesso: {$adminEmail}");

        if ($generated) {
            $this->command->line("--------------------------------------------------");
            $this->command->warn("🔑 SENHA GERADA COM SEGURANÇA:");
            $this->command->info($adminPassword);
            $this->command->line("--------------------------------------------------");
            $this->command->warn("⚠️  Salve esta senha imediatamente em um local seguro.");
            $this->command->warn("   Ela não foi salva no arquivo .env e não será exibida novamente.");
        }
    }

    private function generateStrongPassword(): string
    {
        $lower = 'abcdefghjkmnpqrstuvwxyz';
        $upper = 'ABCDEFGHJKMNPQRSTUVWXYZ';
        $numbers = '23456789';
        $symbols = '!@#$%&*-+=';

        // Garante ao menos 1 de cada tipo
        $password = $lower[random_int(0, strlen($lower) - 1)]
            . $upper[random_int(0, strlen($upper) - 1)]
            . $numbers[random_int(0, strlen($numbers) - 1)]
            . $symbols[random_int(0, strlen($symbols) - 1)];

        $all = $lower . $upper . $numbers . $symbols;
        for ($i = 0; $i < 16; $i++) {
            $password .= $all[random_int(0, strlen($all) - 1)];
        }

        return str_shuffle($password);
    }
}
