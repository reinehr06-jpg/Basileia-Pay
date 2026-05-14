<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('idempotency_keys', function (Blueprint $table) {
            $table->id();
            $table->foreignId('connected_system_id')->constrained('connected_systems')->onDelete('cascade');
            $table->string('idempotency_key');
            $table->string('request_hash');
            $table->json('response_json');
            $table->string('resource_type')->nullable(); // CheckoutSession, Payment
            $table->unsignedBigInteger('resource_id')->nullable();
            $table->timestamp('expires_at');
            $table->timestamps();

            $table->unique(['connected_system_id', 'idempotency_key']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('idempotency_keys');
    }
};
