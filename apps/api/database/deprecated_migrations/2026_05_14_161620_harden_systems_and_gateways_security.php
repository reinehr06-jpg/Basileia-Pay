<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('connected_systems', function (Blueprint $table) {
            $table->dropColumn('api_key');
        });

        Schema::table('gateway_accounts', function (Blueprint $table) {
            $table->dropColumn('credentials');
        });
    }

    public function down(): void
    {
        Schema::table('connected_systems', function (Blueprint $table) {
            $table->string('api_key')->nullable();
        });

        Schema::table('gateway_accounts', function (Blueprint $table) {
            $table->json('credentials')->nullable();
        });
    }
};
