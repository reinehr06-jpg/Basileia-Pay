<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('connected_systems', function (Blueprint $table) {
            $table->uuid('uuid')->unique()->after('id');
            $table->string('description')->nullable()->after('name');
            $table->string('webhook_url')->nullable()->after('settings');
            $table->string('webhook_secret_hash')->nullable()->after('webhook_url');
            $table->enum('environment', ['sandbox', 'production'])->default('production')->after('webhook_secret_hash');
            $table->enum('status', ['active', 'inactive'])->default('active')->after('environment');
        });

        // Backfill uuid
        DB::statement('UPDATE connected_systems SET uuid = gen_random_uuid() WHERE uuid IS NULL');

        // Ensure uuid not nullable
        Schema::table('connected_systems', function (Blueprint $table) {
            $table->uuid('uuid')->nullable(false)->unique()->change();
        });
    }

    public function down(): void
    {
        Schema::table('connected_systems', function (Blueprint $table) {
            $table->dropColumn([
                'uuid', 'description', 'webhook_url', 'webhook_secret_hash', 'environment', 'status'
            ]);
        });
    }
};
