<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            // Assegurar que 'idempotency_key' não seja null para aplicar o unique constraint corretamente
            $table->string('idempotency_key')->nullable(false)->change();
            
            // Adicionar a constraint UNIQUE composta para garantir a idempotência
            $table->unique(['company_id', 'idempotency_key'], 'payments_company_idempotency_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->dropUnique('payments_company_idempotency_unique');
            $table->string('idempotency_key')->nullable()->change();
        });
    }
};
