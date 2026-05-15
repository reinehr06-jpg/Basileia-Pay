<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::dropIfExists('payments'); // Drop legacy table if it exists
        
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('order_id')->constrained()->onDelete('cascade');
            $table->foreignId('gateway_account_id')->nullable()->constrained()->nullOnDelete();
            
            $table->string('gateway_transaction_id')->nullable()->index();
            $table->string('method'); // pix, credit_card, boleto
            $table->integer('amount'); // in cents
            $table->string('status')->default('pending'); // pending, processing, approved, refused, cancelled, refunded, expired, failed
            
            $table->json('gateway_response')->nullable();
            
            // Payment specific details
            $table->text('pix_qrcode')->nullable();
            $table->text('pix_qrcode_url')->nullable();
            $table->timestamp('pix_expires_at')->nullable();
            
            $table->string('boleto_url')->nullable();
            $table->timestamp('boleto_expires_at')->nullable();
            
            $table->string('card_last_digits', 4)->nullable();
            $table->string('card_brand')->nullable();

            $table->timestamp('paid_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
