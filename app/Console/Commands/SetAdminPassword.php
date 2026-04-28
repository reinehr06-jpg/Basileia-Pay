<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;

class SetAdminPassword extends Command
{
    protected $signature = 'admin:set-password {password?}';
    protected $description = 'Set admin password';

    public function handle()
    {
        $password = $this->argument('password') ?? 'BasileiaCheck@2026!99[]09';
        
        $user = User::where('email', 'admin@checkout.com')->first();
        
        if (!$user) {
            $this->error('Admin not found!');
            return 1;
        }
        
        $user->update([
            'password' => Hash::make($password),
            'locked_until' => null,
            'failed_login_attempts' => 0,
        ]);
        
        $this->info("Password updated for admin@checkout.com");
        return 0;
    }
}