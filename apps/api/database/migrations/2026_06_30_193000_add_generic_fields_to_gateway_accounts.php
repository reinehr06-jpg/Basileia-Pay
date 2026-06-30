<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('gateway_accounts', function (Blueprint $table) {
            $table->string('driver_type')->default('native')->after('gateway_id'); // 'native' ou 'generic'
            $table->jsonb('config_map')->nullable()->after('is_active');
        });
    }

    public function down(): void
    {
        Schema::table('gateway_accounts', function (Blueprint $table) {
            $table->dropColumn(['driver_type', 'config_map']);
        });
    }
};
