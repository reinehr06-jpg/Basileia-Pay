<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Split Rules (Regras de divisão de pagamento)
        Schema::create('payment_split_rules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('companies')->cascadeOnDelete();
            $table->morphs('target'); // Order, CheckoutExperience, or System
            $table->string('recipient_id'); // Gateway's internal account ID
            $table->decimal('percentage', 5, 2)->nullable();
            $table->integer('fixed_amount')->nullable(); // Em centavos
            $table->boolean('charge_processing_fee')->default(false);
            $table->boolean('liable')->default(false); // Responsável por chargebacks
            $table->timestamps();
        });

        // 2. Payment Splits (Registro das divisões executadas)
        Schema::create('payment_splits', function (Blueprint $table) {
            $table->id();
            $table->foreignId('payment_id')->constrained('payments')->cascadeOnDelete();
            $table->string('recipient_id');
            $table->integer('amount');
            $table->integer('fee')->default(0);
            $table->string('status')->default('pending'); // pending, paid, reversed
            $table->timestamp('processed_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payment_splits');
        Schema::dropIfExists('payment_split_rules');
    }
};
