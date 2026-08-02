<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (Schema::hasTable('transactions') && Schema::hasColumn('transactions', 'amount')) {
            Schema::table('transactions', function (Blueprint $table) {
                $table->renameColumn('amount', 'amount_old');
            });

            Schema::table('transactions', function (Blueprint $table) {
                $table->bigInteger('amount')->default(0);
            });

            // Convert decimal values to integer cents
            // Uses explicit multiplication by 100 to avoid losing precision.
            DB::statement('UPDATE transactions SET amount = CAST(amount_old * 100 AS BIGINT)');

            Schema::table('transactions', function (Blueprint $table) {
                $table->dropColumn('amount_old');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('transactions') && Schema::hasColumn('transactions', 'amount')) {
            Schema::table('transactions', function (Blueprint $table) {
                $table->renameColumn('amount', 'amount_old');
            });

            Schema::table('transactions', function (Blueprint $table) {
                $table->decimal('amount', 12, 2)->default(0);
            });

            DB::statement('UPDATE transactions SET amount = CAST(amount_old AS DECIMAL(12,2)) / 100');

            Schema::table('transactions', function (Blueprint $table) {
                $table->dropColumn('amount_old');
            });
        }
    }
};
