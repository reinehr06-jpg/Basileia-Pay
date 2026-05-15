<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('webhook_endpoints', function (Blueprint $table) {
            $table->id();
            $table->foreignId('connected_system_id')->constrained('connected_systems')->onDelete('cascade');
            $table->string('url');
            $table->string('secret_hash')->nullable();
            $table->json('events')->nullable(); // Array of subscribed events
            $table->string('status')->default('active'); // active, inactive, paused
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('webhook_endpoints');
    }
};
