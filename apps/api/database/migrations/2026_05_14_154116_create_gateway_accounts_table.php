<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('gateway_accounts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('connected_system_id')->constrained()->onDelete('cascade');
            $table->string('gateway_type'); // asaas, itau, stripe, mercadopago
            $table->string('name')->nullable();
            $table->json('credentials'); // API Keys, secrets, tokens
            $table->boolean('is_active')->default(true);
            $table->boolean('is_default')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('gateway_accounts');
    }
};
