<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('connected_system_id')->constrained()->onDelete('cascade');
            $table->foreignId('checkout_session_id')->nullable()->constrained()->nullOnDelete();
            
            $table->string('external_order_id')->nullable()->index();
            $table->json('customer'); // name, email, document, phone
            $table->json('items'); // Array of products/items
            $table->integer('amount'); // Total in cents
            $table->string('currency', 3)->default('BRL');

            $table->string('status')->default('created'); // created, pending_payment, paid, cancelled, expired, refunded
            
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
