<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('studio_sessions', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('company_id')->constrained('companies');
            $table->foreignId('checkout_experience_id')->constrained('checkout_experiences');
            $table->foreignId('user_id')->constrained('users');
            $table->timestamp('started_at');
            $table->timestamp('last_active_at');
            $table->timestamp('closed_at')->nullable();
            $table->string('device')->nullable();
            $table->integer('changes_count')->default(0);
            $table->foreignId('published_version_id')->nullable()->constrained('checkout_experience_versions');
            $table->timestamps();
        });

        Schema::create('block_presets', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->string('name');
            $table->string('niche')->nullable();
            $table->string('block_type');
            $table->jsonb('config_json');
            $table->string('thumbnail_url')->nullable();
            $table->boolean('is_platform_preset')->default(true);
            $table->foreignId('company_id')->nullable()->constrained('companies');
            $table->integer('usage_count')->default(0);
            $table->timestamps();
        });

        Schema::create('ai_providers', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('company_id')->nullable()->constrained('companies');
            $table->string('name');
            $table->string('slug');
            $table->string('base_url')->nullable();
            $table->text('api_key_encrypted');
            $table->string('default_model')->nullable();
            $table->jsonb('available_models')->nullable();
            $table->enum('status', ['active', 'inactive', 'error'])->default('active');
            $table->timestamp('last_tested_at')->nullable();
            $table->string('last_error')->nullable();
            $table->decimal('cost_limit_usd_monthly', 10, 2)->nullable();
            $table->decimal('cost_used_usd_monthly', 10, 2)->default(0);
            $table->timestamps();
        });

        Schema::create('ai_usage_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('companies');
            $table->foreignId('provider_id')->constrained('ai_providers');
            $table->string('model');
            $table->string('feature');
            $table->integer('prompt_tokens')->default(0);
            $table->integer('completion_tokens')->default(0);
            $table->integer('total_tokens')->default(0);
            $table->decimal('cost_usd', 10, 6)->default(0);
            $table->integer('latency_ms')->default(0);
            $table->enum('status', ['success', 'error', 'timeout'])->default('success');
            $table->string('error_message')->nullable();
            $table->string('entity_type')->nullable();
            $table->bigInteger('entity_id')->nullable();
            $table->timestamps();
        });

        Schema::create('ab_tests', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('company_id')->constrained('companies');
            $table->foreignId('checkout_experience_id')->constrained('checkout_experiences');
            $table->string('name');
            $table->enum('status', ['draft', 'running', 'paused', 'completed', 'cancelled'])->default('draft');
            $table->integer('traffic_split')->default(50);
            $table->timestamp('started_at')->nullable();
            $table->timestamp('ended_at')->nullable();
            $table->foreignId('winner_version_id')->nullable()->constrained('checkout_experience_versions');
            $table->integer('min_sessions')->default(100);
            $table->decimal('significance_level', 4, 2)->default(95.00);
            $table->timestamps();
        });

        Schema::create('ab_test_variants', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ab_test_id')->constrained('ab_tests')->onDelete('cascade');
            $table->foreignId('version_id')->constrained('checkout_experience_versions');
            $table->enum('variant', ['control', 'treatment']);
            $table->integer('sessions_count')->default(0);
            $table->integer('conversions_count')->default(0);
            $table->decimal('conversion_rate', 5, 2)->default(0);
            $table->bigInteger('revenue_total')->default(0);
            $table->boolean('is_winner')->default(false);
            $table->timestamps();
        });

        Schema::create('pix_subscriptions', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('company_id')->constrained('companies');
            $table->foreignId('system_id')->constrained('connected_systems');
            $table->foreignId('gateway_account_id')->constrained('gateway_accounts');
            $table->string('customer_email');
            $table->string('customer_name');
            $table->string('customer_document')->nullable();
            $table->string('customer_phone')->nullable();
            $table->string('customer_pix_key')->nullable();
            $table->string('plan_name');
            $table->bigInteger('amount');
            $table->string('currency', 3)->default('BRL');
            $table->enum('interval_type', ['daily', 'weekly', 'monthly', 'yearly']);
            $table->integer('interval_count')->default(1);
            $table->integer('billing_day')->nullable();
            $table->timestamp('first_billing_at');
            $table->timestamp('next_billing_at')->nullable();
            $table->string('mandate_id')->nullable();
            $table->enum('mandate_status', ['pending', 'active', 'inactive'])->nullable();
            $table->timestamp('mandate_authorized_at')->nullable();
            $table->enum('status', ['pending_mandate', 'active', 'paused', 'past_due', 'cancelled', 'expired'])->default('pending_mandate');
            $table->timestamp('trial_ends_at')->nullable();
            $table->timestamp('cancelled_at')->nullable();
            $table->string('cancel_reason')->nullable();
            $table->timestamp('pause_until')->nullable();
            $table->timestamp('overdue_since')->nullable();
            $table->integer('overdue_retries')->default(0);
            $table->integer('max_retries')->default(3);
            $table->timestamp('next_retry_at')->nullable();
            $table->string('external_subscription_id')->nullable();
            $table->jsonb('metadata')->nullable();
            $table->timestamps();
        });

        Schema::create('pix_subscription_mandates', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('subscription_id')->constrained('pix_subscriptions')->onDelete('cascade');
            $table->foreignId('company_id')->constrained('companies');
            $table->string('gateway_mandate_id');
            $table->enum('status', ['pending', 'authorized', 'rejected', 'cancelled'])->default('pending');
            $table->text('qr_code')->nullable();
            $table->string('qr_code_url')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->timestamp('authorized_at')->nullable();
            $table->timestamp('rejected_at')->nullable();
            $table->string('rejected_reason')->nullable();
            $table->timestamps();
        });

        Schema::create('pix_subscription_cycles', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('subscription_id')->constrained('pix_subscriptions')->onDelete('cascade');
            $table->foreignId('company_id')->constrained('companies');
            $table->integer('cycle_number');
            $table->bigInteger('amount');
            $table->date('due_date');
            $table->enum('status', ['pending', 'processing', 'paid', 'failed', 'cancelled'])->default('pending');
            $table->foreignId('payment_id')->nullable()->constrained('payments');
            $table->timestamp('expires_at')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->timestamp('failed_at')->nullable();
            $table->string('failure_reason')->nullable();
            $table->timestamps();
        });

        Schema::create('pix_subscription_attempts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cycle_id')->constrained('pix_subscription_cycles')->onDelete('cascade');
            $table->foreignId('subscription_id')->constrained('pix_subscriptions');
            $table->integer('attempt_number');
            $table->enum('status', ['processing', 'success', 'failed']);
            $table->string('gateway_charge_id')->nullable();
            $table->string('error_code')->nullable();
            $table->timestamp('attempted_at');
            $table->timestamps();
        });

        Schema::create('pix_subscription_events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('subscription_id')->constrained('pix_subscriptions')->onDelete('cascade');
            $table->foreignId('company_id')->constrained('companies');
            $table->string('event_type');
            $table->jsonb('payload')->nullable();
            $table->enum('triggered_by', ['system', 'webhook', 'user', 'api']);
            $table->foreignId('user_id')->nullable()->constrained('users');
            $table->timestamp('occurred_at', 6);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pix_subscription_events');
        Schema::dropIfExists('pix_subscription_attempts');
        Schema::dropIfExists('pix_subscription_cycles');
        Schema::dropIfExists('pix_subscription_mandates');
        Schema::dropIfExists('pix_subscriptions');
        Schema::dropIfExists('ab_test_variants');
        Schema::dropIfExists('ab_tests');
        Schema::dropIfExists('ai_usage_logs');
        Schema::dropIfExists('ai_providers');
        Schema::dropIfExists('block_presets');
        Schema::dropIfExists('studio_sessions');
    }
};
