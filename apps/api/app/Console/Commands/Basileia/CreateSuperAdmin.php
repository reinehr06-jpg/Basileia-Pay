<?php

namespace App\Console\Commands\Basileia;

use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class CreateSuperAdmin extends Command
{
    protected $signature = 'basileia:create-super-admin
        {--email= : Email do super admin}
        {--password= : Senha do super admin}
        {--name= : Nome do super admin}';

    protected $description = 'Cria o usuario super admin com acesso total ao sistema';

    public function handle(): int
    {
        $this->info('╔══════════════════════════════════════════════════════╗');
        $this->info('║       BASILEIA PAY — Super Admin Setup              ║');
        $this->info('╚══════════════════════════════════════════════════════╝');
        $this->newLine();

        $email = $this->option('email') ?? $this->ask('Email do super admin');
        $name = $this->option('name') ?? $this->ask('Nome do super admin', 'Master Administrator');
        $password = $this->option('password');

        if (!$password) {
            $password = $this->generateStrongPassword();
            $this->newLine();
            $this->warn('⚠️  SENHA GERADA AUTOMATICAMENTE — SALVE AGORA:');
            $this->line("   <fg=yellow;options=bold>{$password}</>");
            $this->newLine();
            $this->warn('   Ela nao sera mostrada novamente.');
        }

        if (strlen($password) < 8) {
            $this->error('❌ Senha deve ter no minimo 8 caracteres.');
            return self::FAILURE;
        }

        $existing = User::where('email', $email)->first();

        $userData = [
            'name' => $name,
            'company_id' => null,
            'status' => 'active',
            'password' => Hash::make($password),
            'email_verified_at' => now(),
            'must_change_password' => false,
            'two_factor_enabled' => false,
            'failed_attempts' => 0,
            'locked_at' => null,
        ];

        if (\Illuminate\Support\Facades\Schema::hasColumn('users', 'role')) {
            $userData['role'] = 'super_admin';
        }

        if ($existing) {
            $this->warn("⚠️  Usuario com email {$email} ja existe. Atualizando para super_admin...");
            $existing->update($userData);
            $superAdmin = $existing;
        } else {
            $userData['uuid'] = Str::uuid();
            $userData['email'] = $email;
            $superAdmin = User::create($userData);
        }

        if (\Illuminate\Support\Facades\Schema::hasTable('roles')) {
            $superAdminRole = \App\Models\Role::firstOrCreate(
                ['slug' => 'super-admin'],
                [
                    'name' => 'Super Admin',
                    'description' => 'Acesso irrestrito a toda a plataforma',
                    'company_id' => null,
                ]
            );

            if (\Illuminate\Support\Facades\Schema::hasTable('user_role_assignments')) {
                $superAdmin->roles()->syncWithoutDetaching([$superAdminRole->id => ['company_id' => null]]);
            }
        }

        $this->info("✅ Super admin criado/atualizado: {$email}");
        $this->line("   ID: {$superAdmin->uuid}");
        $this->line("   Company ID: null (acesso total)");

        $this->newLine();
        $this->info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        $this->info('📌 Login: ' . $email);
        if ($this->option('password')) {
            $this->info('📌 Senha: ' . $password);
        }
        $this->info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        return self::SUCCESS;
    }

    private function generateStrongPassword(): string
    {
        $lower = 'abcdefghjkmnpqrstuvwxyz';
        $upper = 'ABCDEFGHJKMNPQRSTUVWXYZ';
        $numbers = '23456789';
        $symbols = '!@#$%&*-+=';

        $password = $lower[random_int(0, strlen($lower) - 1)]
            . $upper[random_int(0, strlen($upper) - 1)]
            . $numbers[random_int(0, strlen($numbers) - 1)]
            . $symbols[random_int(0, strlen($symbols) - 1)];

        $all = $lower . $upper . $numbers . $symbols;
        for ($i = 0; $i < 12; $i++) {
            $password .= $all[random_int(0, strlen($all) - 1)];
        }

        return str_shuffle($password);
    }
}
