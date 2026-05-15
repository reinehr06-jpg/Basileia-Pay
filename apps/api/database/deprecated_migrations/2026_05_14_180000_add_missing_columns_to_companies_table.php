<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('companies', function (Blueprint $table) {
            $table->uuid('uuid')->unique()->after('id');
            $table->string('display_name')->nullable()->after('name');
            $table->string('document')->nullable()->after('display_name');
            $table->string('email')->nullable()->after('document');
            $table->string('logo_url')->nullable()->after('email');
            $table->string('plan')->nullable()->after('logo_url');
        });

        // Backfill UUIDs for existing companies
        DB::statement('UPDATE companies SET uuid = gen_random_uuid() WHERE uuid IS NULL');

        // Make uuid not nullable after population
        Schema::table('companies', function (Blueprint $table) {
            $table->uuid('uuid')->nullable(false)->unique()->change();
        });
    }

    public function down(): void
    {
        Schema::table('companies', function (Blueprint $table) {
            $table->dropColumn([
                'uuid', 'display_name', 'document', 'email', 'logo_url', 'plan'
            ]);
        });
    }
};
