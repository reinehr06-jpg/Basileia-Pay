<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('system_api_keys', function (Blueprint $table) {
            $table->id();
            $table->foreignId('connected_system_id')->constrained('connected_systems')->onDelete('cascade');
            $table->string('name')->nullable();
            $table->string('key_prefix', 16);
            $table->string('key_hash', 128)->unique();
            $table->json('scopes')->nullable();
            $table->timestamp('last_used_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->timestamp('revoked_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('system_api_keys');
    }
};
