<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('customer_payment_profiles', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('company_id')->constrained('companies');
            $table->string('customer_email');
            $table->string('customer_name')->nullable();
            $table->string('customer_document')->nullable();
            $table->string('customer_phone')->nullable();
            
            $table->string('preferred_method')->nullable();
            $table->string('last_method_used')->nullable();
            $table->jsonb('method_success_rates')->nullable();
            
            $table->integer('total_purchases')->default(0);
            $table->bigInteger('total_spent')->default(0);
            $table->bigInteger('avg_ticket')->default(0);
            $table->timestamp('last_purchase_at')->nullable();
            $table->integer('avg_time_to_pay_seconds')->nullable();
            
            $table->boolean('consent_memory')->default(false);
            $table->timestamp('consent_memory_at')->nullable();
            $table->boolean('consent_whatsapp')->default(false);
            $table->timestamp('consent_whatsapp_at')->nullable();
            $table->boolean('consent_marketing')->default(false);
            
            $table->enum('risk_level', ['low', 'medium', 'high'])->default('low');
            $table->integer('fraud_flags')->default(0);
            $table->jsonb('trusted_devices')->nullable();
            
            $table->timestamps();
            $table->unique(['company_id', 'customer_email']);
        });

        Schema::create('adaptive_checkout_rules', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('company_id')->constrained('companies');
            $table->foreignId('system_id')->nullable()->constrained('connected_systems');
            $table->foreignId('checkout_experience_id')->nullable()->constrained('checkout_experiences');
            $table->string('name');
            $table->integer('priority')->default(0);
            $table->jsonb('conditions');
            $table->jsonb('actions');
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->timestamps();
        });

        Schema::create('recovery_campaigns', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('company_id')->constrained('companies');
            $table->foreignId('system_id')->constrained('connected_systems');
            $table->string('name');
            $table->enum('status', ['active', 'inactive', 'draft'])->default('draft');
            $table->enum('trigger_event', ['checkout_abandoned', 'pix_expired', 'payment_failed']);
            $table->integer('trigger_delay_minutes')->default(30);
            $table->boolean('channel_email')->default(true);
            $table->boolean('channel_whatsapp')->default(false);
            $table->boolean('channel_sms')->default(false);
            $table->enum('discount_type', ['none', 'fixed', 'percent'])->default('none');
            $table->bigInteger('discount_value')->nullable();
            $table->integer('discount_expires_hours')->nullable();
            $table->integer('max_recovery_attempts')->default(2);
            $table->integer('relink_expires_hours')->default(24);
            $table->string('email_subject')->nullable();
            $table->text('email_body_template')->nullable();
            $table->string('whatsapp_template')->nullable();
            $table->timestamps();
        });

        Schema::create('recovery_attempts', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('company_id')->constrained('companies');
            $table->foreignId('system_id')->constrained('connected_systems');
            $table->foreignId('campaign_id')->constrained('recovery_campaigns');
            $table->foreignId('checkout_session_id')->constrained('checkout_sessions');
            $table->string('customer_email');
            $table->string('customer_phone')->nullable();
            $table->enum('status', ['pending', 'sent', 'opened', 'clicked', 'recovered', 'expired', 'failed'])->default('pending');
            $table->enum('channel', ['email', 'whatsapp', 'sms']);
            $table->string('relink_token')->unique();
            $table->string('relink_url');
            $table->timestamp('relink_expires_at');
            $table->bigInteger('discount_applied')->nullable();
            $table->string('discount_code')->nullable();
            $table->timestamp('sent_at')->nullable();
            $table->timestamp('opened_at')->nullable();
            $table->timestamp('clicked_at')->nullable();
            $table->timestamp('recovered_at')->nullable();
            $table->foreignId('recovered_payment_id')->nullable()->constrained('payments');
            $table->timestamp('expired_at')->nullable();
            $table->timestamps();
        });

        Schema::create('social_proof_configs', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('company_id')->constrained('companies');
            $table->foreignId('checkout_experience_id')->constrained('checkout_experiences');
            $table->boolean('enabled')->default(false);
            $table->boolean('show_recent_purchases')->default(true);
            $table->boolean('show_active_viewers')->default(false);
            $table->boolean('show_stock_counter')->default(false);
            $table->boolean('show_regional')->default(false);
            $table->integer('min_data_threshold')->default(3);
            $table->integer('lookback_hours')->default(24);
            $table->boolean('mask_customer_name')->default(true);
            $table->boolean('mask_customer_city')->default(false);
            $table->integer('stock_limit')->nullable();
            $table->integer('stock_current')->nullable();
            $table->timestamps();
        });

        Schema::create('guarantee_configs', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('company_id')->constrained('companies');
            $table->foreignId('checkout_experience_id')->constrained('checkout_experiences');
            $table->boolean('enabled')->default(false);
            $table->integer('guarantee_days')->default(7);
            $table->string('title')->default('7 dias de garantia');
            $table->text('description')->nullable();
            $table->enum('badge_style', ['shield', 'badge', 'ribbon'])->default('shield');
            $table->string('color')->default('#16A34A');
            $table->enum('refund_policy', ['automatic', 'manual', 'review'])->default('manual');
            $table->foreignId('refund_gateway_account_id')->nullable()->constrained('gateway_accounts');
            $table->string('support_url')->nullable();
            $table->string('support_email')->nullable();
            $table->boolean('issue_pdf')->default(true);
            $table->boolean('sign_certificate')->default(true);
            $table->boolean('include_in_receipt')->default(true);
            $table->timestamps();
        });

        Schema::create('guarantee_claims', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('company_id')->constrained('companies');
            $table->foreignId('payment_id')->constrained('payments');
            $table->string('customer_email');
            $table->text('reason')->nullable();
            $table->enum('status', ['open', 'reviewing', 'approved', 'rejected', 'refunded'])->default('open');
            $table->bigInteger('refund_amount')->nullable();
            $table->foreignId('reviewed_by')->nullable()->constrained('users');
            $table->timestamp('reviewed_at')->nullable();
            $table->timestamp('refunded_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('guarantee_claims');
        Schema::dropIfExists('guarantee_configs');
        Schema::dropIfExists('social_proof_configs');
        Schema::dropIfExists('recovery_attempts');
        Schema::dropIfExists('recovery_campaigns');
        Schema::dropIfExists('adaptive_checkout_rules');
        Schema::dropIfExists('customer_payment_profiles');
    }
};
