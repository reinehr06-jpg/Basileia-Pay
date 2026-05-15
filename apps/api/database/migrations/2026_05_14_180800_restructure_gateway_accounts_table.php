<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('gateway_accounts', function (Blueprint $table) {
            // Drop foreign key constraint for connected_system_id (if exists)
            // We'll attempt to drop foreign key; Laravel doesn't track name, so we need to use DB statement.
        });

        // Drop foreign key constraint by name (PostgreSQL)
        DB::statement('ALTER TABLE gateway_accounts DROP CONSTRAINT IF EXISTS gateway_accounts_connected_system_id_foreign');

        Schema::table('gateway_accounts', function (Blueprint $table) {
            // Remove old columns
            $table->dropColumn(['connected_system_id', 'is_active', 'is_default', 'credentials']);
        });

        // Add new columns
        Schema::table('gateway_accounts', function (Blueprint $table) {
            $table->uuid('uuid')->unique()->after('id');
            $table->foreignId('company_id')->nullable()->constrained()->nullOnDelete()->after('id');
            $table->string('provider')->after('name'); // previously gateway_type, but we will rename in separate step? Actually we kept gateway_type; we need to rename it.
            $table->text('credentials_encrypted')->nullable()->after('provider');
            $table->enum('environment', ['sandbox', 'production'])->default('production')->after('credentials_encrypted');
            $table->enum('status', ['active', 'inactive', 'testing'])->default('active')->after('environment');
            $table->integer('priority')->default(0)->after('status');
            $table->json('settings')->nullable()->after('priority');
            $table->timestamp('last_tested_at')->nullable()->after('settings');
            $table->enum('last_test_status', ['success', 'failed'])->nullable()->after('last_tested_at');
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete()->after('last_test_status');
            $table->timestamp('last_test_status_updated_at')->nullable()->after('last_test_status');
        });

        // Rename gateway_type column to provider if exists
        DB::statement('ALTER TABLE gateway_accounts RENAME COLUMN gateway_type TO provider');

        // Backfill UUID
        DB::statement('UPDATE gateway_accounts SET uuid = gen_random_uuid() WHERE uuid IS NULL');

        // Ensure uuid not nullable
        Schema::table('gateway_accounts', function (Blueprint $table) {
            $table->uuid('uuid')->nullable(false)->unique()->change();
        });
    }

    public function down(): void
    {
        Schema::table('gateway_accounts', function (Blueprint $table) {
            $table->dropColumn([
                'uuid', 'company_id', 'provider', 'credentials_encrypted',
                'environment', 'status', 'priority', 'settings',
                'last_tested_at', 'last_test_status', 'last_test_status_updated_at', 'created_by'
            ]);
        });

        // Restore old columns? Hard to reverse.
        Schema::table('gateway_accounts', function (Blueprint $table) {
            $table->string('gateway_type');
            $table->json('credentials')->nullable();
            $table->boolean('is_active')->default(true);
            $table->boolean('is_default')->default(false);
            $table->foreignId('connected_system_id')->constrained()->onDelete('cascade');
        });
    }
};
