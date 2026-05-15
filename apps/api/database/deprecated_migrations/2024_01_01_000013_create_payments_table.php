<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->uuid()->unique()->index();
            $table->foreignId('transaction_id')->constrained('transactions')->cascadeOnDelete();
            $table->foreignId('gateway_id')->nullable()->constrained('gateways')->nullOnDelete();
            $table->string('gateway_payment_id')->nullable()->index();
            $table->decimal('amount', 12, 2);
            $table->enum('status', ['pending', 'processing', 'approved', 'refused', 'refunded', 'chargeback'])->default('pending');
            $table->string('payment_method');
            $table->text('pix_qrcode')->nullable();
            $table->timestamp('pix_expires_at')->nullable();
            $table->string('boleto_url')->nullable();
            $table->string('boleto_barcode')->nullable();
            $table->timestamp('boleto_expires_at')->nullable();
            $table->string('card_last4')->nullable();
            $table->string('card_brand')->nullable();
            $table->json('gateway_response')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
