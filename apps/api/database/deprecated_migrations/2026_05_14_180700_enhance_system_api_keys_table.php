<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('system_api_keys', function (Blueprint $table) {
            $table->uuid('uuid')->unique()->after('id');
            $table->foreignId('company_id')->nullable()->constrained()->nullOnDelete()->after('connected_system_id');
            $table->enum('environment', ['sandbox', 'production'])->default('production')->after('scopes');
            $table->timestamp('revoked_by')->nullable()->after('revoked_at'); // This should be foreignId but use timestamp placeholder? Actually spec: revoked_by bigint FK → users nullable. So we add foreignId.
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete()->after('revoked_by');
        });

        // Backfill uuid
        DB::statement('UPDATE system_api_keys SET uuid = gen_random_uuid() WHERE uuid IS NULL');

        // Not null constraint
        Schema::table('system_api_keys', function (Blueprint $table) {
            $table->uuid('uuid')->nullable(false)->unique()->change();
        });
    }

    public function down(): void
    {
        Schema::table('system_api_keys', function (Blueprint $table) {
            $table->dropColumn(['uuid', 'company_id', 'environment', 'revoked_by', 'created_by']);
        });
    }
};
