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
        $company = Company::first();

        $senhaAleatoria = $this->gerarSenhaSegura();

        $admin = User::updateOrCreate(
            ['email' => 'admin@checkout.com'],
            [
                'company_id' => $company?->id,
                'name' => 'Admin',
                'password' => Hash::make($senhaAleatoria),
                'role' => 'super_admin',
                'status' => 'active',
                'email_verified_at' => now(),
                'must_change_password' => true,
                'password_changed_at' => null,
                'failed_login_attempts' => 0,
                'locked_until' => null,
            ]
        );

        $this->salvarSenhaEmArquivo($senhaAleatoria);

        $this->command->info("===========================================");
        $this->command->info("ADMIN CRIADO COM SUCESSO!");
        $this->command->info("===========================================");
        $this->command->info("Email: admin@checkout.com");
        $this->command->info("Senha temporária: {$senhaAleatoria}");
        $this->command->info("IMPORTANTE: Altere a senha no primeiro login!");
        $this->command->info("===========================================");
    }

    private function gerarSenhaSegura(): string
    {
        $maiusculas = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        $minusculas = 'abcdefghijklmnopqrstuvwxyz';
        $numeros = '0123456789';
        $especiais = '!@#$%&*';

        $senha = '';
        $senha .= $maiusculas[random_int(0, strlen($maiusculas) - 1)];
        $senha .= $minusculas[random_int(0, strlen($minusculas) - 1)];
        $senha .= $numeros[random_int(0, strlen($numeros) - 1)];
        $senha .= $especiais[random_int(0, strlen($especiais) - 1)];

        $todos = $maiusculas . $minusculas . $numeros . $especiais;
        for ($i = 0; $i < 8; $i++) {
            $senha .= $todos[random_int(0, strlen($todos) - 1)];
        }

        return str_shuffle($senha);
    }

    private function salvarSenhaEmArquivo(string $senha): void
    {
        $caminho = base_path('.admin_password');
        $conteudo = "Admin Login Credentials\n";
        $conteudo .= "=======================\n";
        $conteudo .= "Email: admin@checkout.com\n";
        $conteudo .= "Senha temporária: {$senha}\n";
        $conteudo .= "Gerado em: " . now()->format('Y-m-d H:i:s') . "\n";
        $conteudo .= "========================\n";

        file_put_contents($caminho, $conteudo);
    }
}