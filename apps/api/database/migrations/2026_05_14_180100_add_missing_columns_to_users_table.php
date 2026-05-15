<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Add UUID
            $table->uuid('uuid')->unique()->after('id');

            // Add new timestamp columns
            $table->timestamp('two_factor_confirmed_at')->nullable()->after('two_factor_enabled');
            $table->timestamp('last_login_at')->nullable()->after('last_auth_at');

            // Rename columns (create new, copy, drop old)
            $table->integer('failed_attempts')->nullable()->after('last_login_at');
            $table->timestamp('locked_at')->nullable()->after('failed_attempts');
        });

        // Backfill data
        DB::statement("UPDATE users SET uuid = gen_random_uuid() WHERE uuid IS NULL");
        DB::statement("UPDATE users SET failed_attempts = failed_login_attempts");
        DB::statement("UPDATE users SET locked_at = locked_until");

        // Drop old columns
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['failed_login_attempts', 'locked_until']);
        });

        // Role mapping: convert existing role values to spec values
        DB::table('users')->where('role', 'super_admin')->update(['role' => 'owner']);
        DB::table('users')->where('role', 'operator')->update(['role' => 'finance']);

        // Change role column to enum with new values? In PostgreSQL we need to alter type.
        // For simplicity, we'll keep as string; add check constraint if desired.
        // Optionally, we could use a string column and validate in app.
        // We'll not enforce enum at DB level to avoid complexity.
    }

    public function down(): void
    {
        // This is destructive; reverse would be complicated.
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['uuid', 'two_factor_confirmed_at', 'last_login_at', 'failed_attempts', 'locked_at']);
            $table->integer('failed_login_attempts')->nullable();
            $table->timestamp('locked_until')->nullable();
        });

        // Restore old role values
        DB::table('users')->where('role', 'owner')->update(['role' => 'super_admin']);
        DB::table('users')->where('role', 'finance')->update(['role' => 'operator']);
    }
};
