<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. User Companies (Many-to-Many Tenancy)
        Schema::create('user_companies', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('company_id')->constrained('companies')->cascadeOnDelete();
            $table->string('status')->default('active'); // active, invited, suspended
            $table->timestamps();

            $table->unique(['user_id', 'company_id']);
        });

        // 2. Roles (Perfis)
        Schema::create('roles', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('company_id')->nullable()->constrained('companies')->cascadeOnDelete(); // Nullable for global/system roles
            $table->string('name');
            $table->string('slug')->unique(); // e.g. super-admin, company-owner, operator
            $table->string('description')->nullable();
            $table->timestamps();
        });

        // 3. Permissions
        Schema::create('permissions', function (Blueprint $table) {
            $table->id();
            $table->string('slug')->unique(); // e.g. checkouts.publish
            $table->string('name');
            $table->string('group'); // e.g. checkouts, gateways, users
            $table->timestamps();
        });

        // 4. Role Permissions
        Schema::create('role_permissions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('role_id')->constrained('roles')->cascadeOnDelete();
            $table->foreignId('permission_id')->constrained('permissions')->cascadeOnDelete();
            $table->unique(['role_id', 'permission_id']);
        });

        // 5. User Role Assignments (Contextual Roles)
        Schema::create('user_role_assignments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('role_id')->constrained('roles')->cascadeOnDelete();
            $table->foreignId('company_id')->nullable()->constrained('companies')->cascadeOnDelete();
            $table->timestamps();

            // A user can only have a specific role once per company context
            $table->unique(['user_id', 'role_id', 'company_id']);
        });

        // 6. Auth Sessions (Detailed tracking)
        Schema::create('auth_sessions', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('company_id')->nullable()->constrained('companies')->nullOnDelete();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->string('token_id')->nullable(); // Sanctum token reference if needed
            $table->timestamp('last_activity')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->string('status')->default('active'); // active, revoked, expired
            $table->timestamps();
        });

        // 7. Two Factor Secrets (Isolated table for better security)
        Schema::create('two_factor_secrets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->text('secret');
            $table->text('recovery_codes')->nullable();
            $table->timestamp('confirmed_at')->nullable();
            $table->timestamps();
        });

        // Adjust Users table to remove legacy columns
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['role']);
            // We can optionally drop the old two_factor_secret, two_factor_confirmed_at 
            // since we moved them, but keeping two_factor_enabled is good for quick checks.
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('role')->default('operator');
        });

        Schema::dropIfExists('two_factor_secrets');
        Schema::dropIfExists('auth_sessions');
        Schema::dropIfExists('user_role_assignments');
        Schema::dropIfExists('role_permissions');
        Schema::dropIfExists('permissions');
        Schema::dropIfExists('roles');
        Schema::dropIfExists('user_companies');
    }
};
