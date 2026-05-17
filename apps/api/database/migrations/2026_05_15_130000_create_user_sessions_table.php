<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_sessions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('token_id')->unique(); // Sanctum token ID
            $table->string('ip_address', 45);
            $table->text('user_agent');
            $table->string('device_fingerprint')->nullable();
            $table->timestamp('last_active_at')->nullable();
            $table->timestamp('2fa_verified_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_sessions');
    }
};
