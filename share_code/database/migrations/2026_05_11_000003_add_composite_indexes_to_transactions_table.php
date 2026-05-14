<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            // Índice composto para buscas por empresa + status (dashboard queries)
            $table->index(['company_id', 'status'], 'transactions_company_status');

            // Índice composto para buscas por empresa + método de pagamento
            $table->index(['company_id', 'payment_method'], 'transactions_company_payment_method');

            // Índice para lookup rápido por asaas_payment_id (já existente como único, mas adicionar se não existir)
            if (!collect(Schema::getColumnListing('transactions'))->contains('asaas_payment_id')) {
                $table->string('asaas_payment_id')->nullable()->after('uuid');
            }

            // Índice para buscas por gateway_transaction_id
            $table->index(['gateway_transaction_id'], 'transactions_gateway_txn_id');
        });
    }

    public function down(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->dropIndex('transactions_company_status');
            $table->dropIndex('transactions_company_payment_method');
            $table->dropIndex('transactions_gateway_txn_id');
        });
    }
};