<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('recovery_attempts', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('company_id')->constrained('companies')->cascadeOnDelete();
            $table->foreignId('system_id')->nullable()->constrained('connected_systems')->nullOnDelete();
            $table->foreignId('campaign_id')->constrained('recovery_campaigns')->cascadeOnDelete();
            $table->foreignId('checkout_session_id')->constrained('checkout_sessions')->cascadeOnDelete();
            $table->string('customer_email');
            $table->string('status')->default('pending');
            $table->string('channel');
            $table->string('relink_token', 64)->unique();
            $table->text('relink_url');
            $table->timestamp('relink_expires_at');
            $table->integer('discount_applied')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('recovery_attempts');
    }
};
