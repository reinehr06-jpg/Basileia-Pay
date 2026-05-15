<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bci_analyses', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('company_id')->constrained('companies');
            $table->foreignId('checkout_experience_id')->constrained('checkout_experiences');
            $table->foreignId('version_id')->constrained('checkout_experience_versions');
            $table->string('niche')->nullable();
            $table->enum('ticket_range', ['low', 'medium', 'high', 'premium'])->nullable();
            $table->integer('score_overall')->default(0);
            $table->integer('score_copy')->default(0);
            $table->integer('score_layout')->default(0);
            $table->integer('score_social_proof')->default(0);
            $table->integer('score_guarantee')->default(0);
            $table->integer('score_urgency')->default(0);
            $table->integer('score_method_fit')->default(0);
            $table->integer('benchmark_niche_avg')->nullable();
            $table->integer('benchmark_platform_avg')->nullable();
            $table->integer('benchmark_top10_avg')->nullable();
            $table->jsonb('recommendations')->nullable();
            $table->decimal('predicted_conversion_rate', 5, 2)->nullable();
            $table->integer('sessions_used_in_model')->default(0);
            $table->string('ai_model')->nullable();
            $table->integer('tokens_used')->nullable();
            $table->decimal('cost_usd', 10, 6)->nullable();
            $table->enum('status', ['pending', 'processing', 'completed', 'failed'])->default('pending');
            $table->string('error_message')->nullable();
            $table->timestamp('analyzed_at')->nullable();
            $table->timestamps();
        });

        Schema::create('bci_recommendations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('analysis_id')->constrained('bci_analyses')->onDelete('cascade');
            $table->foreignId('company_id')->constrained('companies');
            $table->integer('priority');
            $table->enum('category', ['copy', 'layout', 'social_proof', 'guarantee', 'urgency', 'method', 'mobile', 'trust', 'conversion']);
            $table->enum('severity', ['critical', 'high', 'medium', 'low']);
            $table->string('code');
            $table->string('title');
            $table->text('problem');
            $table->text('suggestion');
            $table->text('example_before')->nullable();
            $table->text('example_after')->nullable();
            $table->decimal('estimated_lift', 5, 2)->nullable();
            $table->enum('confidence', ['low', 'medium', 'high']);
            $table->boolean('auto_applicable')->default(false);
            $table->boolean('applied')->default(false);
            $table->timestamp('applied_at')->nullable();
            $table->foreignId('applied_by')->nullable()->constrained('users');
            $table->timestamps();
        });

        Schema::dropIfExists('split_rules');
        Schema::create('split_rules', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('company_id')->constrained('companies');
            $table->foreignId('system_id')->nullable()->constrained('connected_systems');
            $table->foreignId('checkout_experience_id')->nullable()->constrained('checkout_experiences');
            $table->string('name');
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->enum('applies_to', ['all', 'method', 'amount_range', 'tag'])->default('all');
            $table->string('method_filter')->nullable();
            $table->bigInteger('amount_min')->nullable();
            $table->bigInteger('amount_max')->nullable();
            $table->enum('refund_strategy', ['proportional', 'primary_first', 'manual'])->default('proportional');
            $table->timestamps();
        });

        Schema::create('split_rule_recipients', function (Blueprint $table) {
            $table->id();
            $table->foreignId('split_rule_id')->constrained('split_rules')->onDelete('cascade');
            $table->foreignId('company_id')->constrained('companies');
            $table->foreignId('gateway_account_id')->constrained('gateway_accounts');
            $table->string('name');
            $table->enum('split_type', ['percent', 'fixed']);
            $table->bigInteger('split_value');
            $table->integer('order')->default(0);
            $table->boolean('is_platform_fee')->default(false);
            $table->string('webhook_url')->nullable();
            $table->timestamps();
        });

        Schema::create('split_executions', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('payment_id')->constrained('payments');
            $table->foreignId('split_rule_id')->constrained('split_rules');
            $table->foreignId('company_id')->constrained('companies');
            $table->enum('status', ['pending', 'processing', 'completed', 'failed', 'reversed'])->default('pending');
            $table->bigInteger('total_amount');
            $table->bigInteger('platform_fee')->default(0);
            $table->timestamps();
        });

        Schema::create('split_execution_transfers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('split_execution_id')->constrained('split_executions')->onDelete('cascade');
            $table->foreignId('recipient_id')->constrained('split_rule_recipients');
            $table->foreignId('gateway_account_id')->constrained('gateway_accounts');
            $table->bigInteger('amount');
            $table->enum('status', ['pending', 'processing', 'completed', 'failed'])->default('pending');
            $table->string('gateway_transfer_id')->nullable();
            $table->timestamp('transferred_at')->nullable();
            $table->timestamp('failed_at')->nullable();
            $table->string('error_code')->nullable();
            $table->timestamps();
        });

        Schema::create('fx_rates', function (Blueprint $table) {
            $table->id();
            $table->string('from_currency', 3);
            $table->string('to_currency', 3);
            $table->decimal('rate', 18, 8);
            $table->string('source');
            $table->timestamp('fetched_at');
            $table->timestamp('valid_until')->nullable();
            $table->timestamps();
        });

        Schema::create('checkout_fx_configs', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('company_id')->constrained('companies');
            $table->foreignId('checkout_experience_id')->constrained('checkout_experiences');
            $table->boolean('enabled')->default(false);
            $table->jsonb('display_currencies')->nullable();
            $table->string('base_currency', 3)->default('BRL');
            $table->string('receive_currency', 3)->default('BRL');
            $table->boolean('show_approximate_badge')->default(true);
            $table->decimal('rate_markup_percent', 5, 2)->default(0.00);
            $table->timestamps();
        });

        Schema::create('payment_fx_records', function (Blueprint $table) {
            $table->id();
            $table->foreignId('payment_id')->constrained('payments')->unique();
            $table->string('display_currency', 3);
            $table->bigInteger('display_amount');
            $table->string('base_currency', 3);
            $table->bigInteger('base_amount');
            $table->decimal('fx_rate', 18, 8);
            $table->string('rate_source');
            $table->decimal('rate_markup', 5, 2);
            $table->timestamp('locked_at');
            $table->timestamps();
        });

        Schema::create('living_receipts', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('payment_id')->constrained('payments')->unique();
            $table->foreignId('company_id')->constrained('companies');
            $table->string('receipt_number')->unique();
            $table->string('verify_token')->unique();
            $table->string('signed_hash');
            $table->string('current_status');
            $table->string('last_event')->nullable();
            $table->timestamp('last_event_at')->nullable();
            $table->integer('total_views')->default(0);
            $table->timestamp('last_viewed_at')->nullable();
            $table->foreignId('guarantee_claim_id')->nullable()->constrained('guarantee_claims');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('living_receipts');
        Schema::dropIfExists('payment_fx_records');
        Schema::dropIfExists('checkout_fx_configs');
        Schema::dropIfExists('fx_rates');
        Schema::dropIfExists('split_execution_transfers');
        Schema::dropIfExists('split_executions');
        Schema::dropIfExists('split_rule_recipients');
        Schema::dropIfExists('split_rules');
        Schema::dropIfExists('bci_recommendations');
        Schema::dropIfExists('bci_analyses');
    }
};
