<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('webhook_deliveries', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('connected_system_id')->constrained('connected_systems')->onDelete('cascade');
            $table->foreignId('webhook_endpoint_id')->constrained('webhook_endpoints')->onDelete('cascade');
            $table->string('event');
            $table->json('payload_masked');
            $table->string('status')->default('pending'); // pending, delivered, failed, retrying, cancelled
            $table->integer('attempts')->default(0);
            $table->integer('last_response_code')->nullable();
            $table->text('last_response_body_masked')->nullable();
            $table->timestamp('next_retry_at')->nullable();
            $table->timestamp('delivered_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('webhook_deliveries');
    }
};
