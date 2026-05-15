<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pix_subscriptions', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('company_id')->constrained('companies');
            $table->foreignId('system_id')->constrained('connected_systems');
            $table->foreignId('customer_id')->constrained('customers');
            $table->foreignId('gateway_account_id')->constrained('gateway_accounts');
            $table->string('name');
            $table->string('description')->nullable();
            $table->bigInteger('amount'); // centavos
            $table->string('currency')->default('BRL');
            $table->enum('interval_type', ['daily', 'weekly', 'monthly', 'yearly']);
            $table->integer('interval_count')->default(1);
            $table->integer('billing_day')->nullable();
            $table->enum('status', ['pending_mandate', 'active', 'paused', 'cancelled', 'expired']);
            $table->unsignedBigInteger('mandate_id')->nullable();
            $table->integer('trial_days')->default(0);
            $table->timestamp('trial_ends_at')->nullable();
            $table->timestamp('starts_at');
            $table->timestamp('ends_at')->nullable();
            $table->timestamp('next_billing_at')->nullable();
            $table->integer('current_cycle')->default(0);
            $table->bigInteger('total_paid')->default(0);
            $table->integer('total_failed')->default(0);
            $table->string('cancel_reason')->nullable();
            $table->timestamp('cancelled_at')->nullable();
            $table->jsonb('metadata')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pix_subscriptions');
    }
};
