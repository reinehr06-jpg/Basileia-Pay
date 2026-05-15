<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('checkout_session_analytics', function (Blueprint $table) {
            $table->id();
            $table->foreignId('session_id')->constrained('checkout_sessions');
            $table->foreignId('company_id')->constrained('companies');
            $table->foreignId('system_id')->constrained('connected_systems');
            $table->foreignId('checkout_experience_id')->constrained('checkout_experiences');
            $table->foreignId('version_id')->constrained('checkout_experience_versions');
            
            $table->string('country', 2)->nullable();
            $table->string('state')->nullable();
            $table->string('city')->nullable();
            $table->string('timezone')->nullable();
            $table->enum('device_type', ['desktop', 'mobile', 'tablet', 'unknown']);
            $table->string('device_brand')->nullable();
            $table->string('os')->nullable();
            $table->string('browser')->nullable();
            $table->integer('screen_width')->nullable();
            $table->enum('connection_type', ['wifi', 'cellular', 'ethernet', 'unknown']);

            $table->timestamp('opened_at')->nullable();
            $table->timestamp('first_interaction_at')->nullable();
            $table->string('method_selected')->nullable();
            $table->timestamp('form_started_at')->nullable();
            $table->timestamp('form_completed_at')->nullable();
            $table->timestamp('payment_initiated_at')->nullable();
            $table->timestamp('payment_confirmed_at')->nullable();

            $table->enum('status', ['opened', 'abandoned', 'pix_generated', 'paid', 'failed', 'expired']);
            $table->timestamp('abandoned_at')->nullable();
            $table->enum('abandoned_stage', ['before_form', 'during_form', 'after_pix', 'after_error'])->nullable();
            $table->string('payment_method_final')->nullable();
            $table->integer('total_method_switches')->default(0);
            $table->integer('time_to_pay_seconds')->nullable();

            $table->jsonb('friction_signals')->nullable();
            $table->string('utm_source')->nullable();
            $table->string('utm_medium')->nullable();
            $table->string('utm_campaign')->nullable();
            $table->string('referrer')->nullable();
            $table->timestamps();
        });

        Schema::create('abandonment_events', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('session_id')->constrained('checkout_sessions');
            $table->foreignId('company_id')->constrained('companies');
            $table->foreignId('checkout_experience_id')->constrained('checkout_experiences');
            $table->enum('stage', ['before_form', 'during_form', 'pix_waiting', 'error_screen', 'success_pending']);
            $table->string('last_field_interacted')->nullable();
            $table->string('last_section')->nullable();
            $table->integer('time_in_session_seconds');
            $table->enum('device_type', ['desktop', 'mobile', 'tablet', 'unknown']);
            $table->bigInteger('amount');
            $table->string('method_at_abandon')->nullable();
            $table->boolean('had_pix_generated')->default(false);
            $table->boolean('had_error')->default(false);
            $table->string('last_error_code')->nullable();
            $table->string('country', 2)->nullable();
            $table->string('state')->nullable();
            $table->integer('hour_bucket');
            $table->integer('day_of_week');
            $table->timestamp('occurred_at', 6);
        });

        Schema::create('checkout_scores', function (Blueprint $table) {
            $table->id();
            $table->foreignId('checkout_experience_id')->constrained('checkout_experiences');
            $table->foreignId('version_id')->constrained('checkout_experience_versions');
            $table->foreignId('company_id')->constrained('companies');
            $table->integer('score_overall');
            $table->integer('score_clarity');
            $table->integer('score_trust');
            $table->integer('score_mobile');
            $table->integer('score_payment');
            $table->integer('score_security');
            $table->integer('score_conversion');
            $table->jsonb('issues')->nullable();
            $table->jsonb('suggestions')->nullable();
            $table->integer('sessions_analyzed')->default(0);
            $table->decimal('conversion_rate', 5, 2)->nullable();
            $table->integer('avg_time_to_pay')->nullable();
            $table->timestamp('calculated_at');
            $table->timestamps();
        });

        Schema::create('geographic_risk_signals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('companies');
            $table->foreignId('system_id')->nullable()->constrained('connected_systems');
            $table->foreignId('gateway_account_id')->nullable()->constrained('gateway_accounts');
            $table->string('country', 2);
            $table->string('state')->nullable();
            $table->string('city')->nullable();
            $table->integer('hour_bucket');
            $table->integer('day_of_week');
            $table->string('device_type')->nullable();
            $table->integer('total_sessions')->default(0);
            $table->integer('total_paid')->default(0);
            $table->integer('total_abandoned')->default(0);
            $table->integer('total_refused')->default(0);
            $table->integer('total_fraud_signals')->default(0);
            $table->decimal('conversion_rate', 5, 2)->default(0);
            $table->decimal('refusal_rate', 5, 2)->default(0);
            $table->integer('avg_latency_ms')->nullable();
            $table->enum('risk_level', ['low', 'medium', 'high', 'critical']);
            $table->timestamp('window_start');
            $table->timestamp('window_end');
            $table->timestamp('updated_at');
        });

        Schema::create('session_forensics_frames', function (Blueprint $table) {
            $table->id();
            $table->foreignId('session_id')->constrained('checkout_sessions');
            $table->foreignId('company_id')->constrained('companies');
            $table->enum('frame_type', ['scroll', 'focus', 'blur', 'click', 'pause', 'method_change', 'error', 'abandon']);
            $table->string('element_id')->nullable();
            $table->integer('scroll_position')->nullable();
            $table->integer('time_in_session_ms');
            $table->string('method_context')->nullable();
            $table->string('error_code')->nullable();
            $table->timestamp('occurred_at', 6);
        });

        Schema::create('checkout_score_issues', function (Blueprint $table) {
            $table->id();
            $table->foreignId('score_id')->constrained('checkout_scores');
            $table->enum('category', ['clarity', 'trust', 'mobile', 'payment', 'security', 'conversion']);
            $table->enum('severity', ['critical', 'warning', 'info']);
            $table->string('code');
            $table->string('title');
            $table->string('description');
            $table->string('suggestion');
            $table->decimal('estimated_impact', 4, 2)->nullable();
            $table->boolean('auto_fixable')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('checkout_score_issues');
        Schema::dropIfExists('session_forensics_frames');
        Schema::dropIfExists('geographic_risk_signals');
        Schema::dropIfExists('checkout_scores');
        Schema::dropIfExists('abandonment_events');
        Schema::dropIfExists('checkout_session_analytics');
    }
};
