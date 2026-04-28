<?php
/**
 * Emergency Admin Password Reset
 * Upload this file to your server and access it once to reset the admin password.
 * DELETE THIS FILE AFTER USE!
 */

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\User;
use Illuminate\Support\Facades\Hash;

echo "Starting password reset...\n";

try {
    $user = User::where('email', 'admin@checkout.com')->first();
    
    if (!$user) {
        echo "User not found! Creating new admin...\n";
        
        $company = \App\Models\Company::first();
        
        $user = User::create([
            'email' => 'admin@checkout.com',
            'name' => 'Admin',
            'company_id' => $company?->id,
            'password' => Hash::make('BasileiaCheck@2026!99'),
            'role' => 'super_admin',
            'status' => 'active',
            'password_changed_at' => now(),
            'must_change_password' => false,
            'locked_until' => null,
            'failed_login_attempts' => 0,
        ]);
        
        echo "Admin created with new password!\n";
    } else {
        $user->update([
            'password' => Hash::make('BasileiaCheck@2026!99'),
            'password_changed_at' => now(),
            'must_change_password' => false,
            'locked_until' => null,
            'failed_login_attempts' => 0,
            'status' => 'active',
        ]);
        
        echo "Password updated for admin@checkout.com!\n";
    }
    
    echo "SUCCESS! Delete this file now!\n";
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}