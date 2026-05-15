<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pix_subscription_attempts', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('cycle_id')->constrained('pix_subscription_cycles');
            $table->foreignId('subscription_id')->constrained('pix_subscriptions');
            $table->unsignedBigInteger('payment_attempt_id')->nullable();
            $table->enum('status', ['pending', 'processing', 'success', 'failed']);
            $table->string('error_code')->nullable();
            $table->string('error_message')->nullable();
            $table->timestamp('attempted_at');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pix_subscription_attempts');
    }
};
