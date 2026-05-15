<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->string('customer_name')->nullable()->after('customer_id');
            $table->string('customer_email')->nullable()->after('customer_name');
            $table->string('customer_document')->nullable()->after('customer_email');
            $table->unsignedInteger('fraud_score')->nullable()->after('refunded_at');
            $table->string('fraud_risk_level')->nullable()->after('fraud_score');
            $table->json('fraud_flags')->nullable()->after('fraud_risk_level');
            $table->string('fraud_recommendation')->nullable()->after('fraud_flags');
            $table->decimal('refunded_amount', 12, 2)->nullable()->after('fraud_recommendation');
            $table->timestamp('status_changed_at')->nullable()->after('refunded_amount');
        });
    }

    public function down(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->dropColumn([
                'customer_name', 'customer_email', 'customer_document',
                'fraud_score', 'fraud_risk_level', 'fraud_flags', 'fraud_recommendation',
                'refunded_amount', 'status_changed_at',
            ]);
        });
    }
};
