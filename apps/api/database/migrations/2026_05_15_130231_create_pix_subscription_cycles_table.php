<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pix_subscription_cycles', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('subscription_id')->constrained('pix_subscriptions');
            $table->foreignId('company_id')->constrained('companies');
            $table->integer('cycle_number');
            $table->bigInteger('amount');
            $table->string('currency')->default('BRL');
            $table->date('due_date');
            $table->enum('status', ['scheduled', 'processing', 'paid', 'failed', 'skipped', 'refunded']);
            $table->unsignedBigInteger('payment_id')->nullable(); // FK manually or constrained
            $table->timestamp('scheduled_at');
            $table->timestamp('processed_at')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->timestamp('failed_at')->nullable();
            $table->integer('retry_count')->default(0);
            $table->timestamp('next_retry_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pix_subscription_cycles');
    }
};
