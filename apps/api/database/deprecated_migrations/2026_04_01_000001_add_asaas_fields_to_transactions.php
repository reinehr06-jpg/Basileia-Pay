<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->string('asaas_payment_id')->nullable()->after('gateway_transaction_id');
            $table->string('source')->nullable()->after('asaas_payment_id');
            $table->string('callback_url')->nullable()->after('source');
            $table->string('asaas_customer_id')->nullable()->after('customer_document');
            $table->text('customer_address')->nullable()->after('asaas_customer_id');
        });
    }

    public function down(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->dropColumn([
                'asaas_payment_id',
                'source',
                'callback_url',
                'asaas_customer_id',
                'customer_address',
            ]);
        });
    }
};