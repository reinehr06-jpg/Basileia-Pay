<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->uuid()->unique()->index();
            $table->foreignId('company_id')->constrained('companies')->cascadeOnDelete();
            $table->foreignId('integration_id')->nullable()->constrained('integrations')->nullOnDelete();
            $table->foreignId('gateway_id')->nullable()->constrained('gateways')->nullOnDelete();
            $table->foreignId('customer_id')->nullable()->constrained('customers')->nullOnDelete();
            $table->string('external_id')->nullable();
            $table->string('reference')->nullable();
            $table->text('description')->nullable();
            $table->decimal('amount', 12, 2);
            $table->decimal('net_amount', 12, 2)->nullable();
            $table->string('currency')->default('BRL');
            $table->enum('payment_method', ['pix', 'boleto', 'credit_card', 'debit_card'])->default('credit_card');
            $table->enum('status', ['pending', 'processing', 'approved', 'refused', 'cancelled', 'refunded', 'chargeback', 'overdue'])->default('pending');
            $table->unsignedTinyInteger('installments')->default(1);
            $table->string('gateway_transaction_id')->nullable();
            $table->json('gateway_response')->nullable();
            $table->json('metadata')->nullable();
            $table->string('ip_address')->nullable();
            $table->text('user_agent')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->timestamp('cancelled_at')->nullable();
            $table->timestamp('refunded_at')->nullable();
            $table->timestamps();

            $table->index(['company_id', 'status']);
            $table->index(['company_id', 'created_at']);
            $table->index('integration_id');
            $table->index('gateway_transaction_id');
            $table->index('external_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
