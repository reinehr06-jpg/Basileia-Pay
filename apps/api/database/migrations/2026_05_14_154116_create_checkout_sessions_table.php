<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('checkout_sessions', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('connected_system_id')->constrained()->onDelete('cascade');
            $table->foreignId('checkout_experience_id')->nullable()->constrained()->nullOnDelete();
            
            $table->string('external_order_id')->nullable()->index();
            $table->string('idempotency_key')->nullable();
            
            $table->unique(['connected_system_id', 'idempotency_key']);

            $table->json('customer'); // name, email, document, phone
            $table->json('items'); // Array of products/items
            $table->integer('amount'); // Total in cents
            $table->string('currency', 3)->default('BRL');

            $table->string('success_url')->nullable();
            $table->string('cancel_url')->nullable();
            
            $table->json('metadata')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->string('status')->default('open'); // open, completed, expired, cancelled
            
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('checkout_sessions');
    }
};
