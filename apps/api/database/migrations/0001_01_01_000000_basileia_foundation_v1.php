<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Companies
        Schema::create('companies', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->string('slug')->unique();
            $table->string('name');
            $table->string('display_name')->nullable();
            $table->string('document')->nullable();
            $table->string('email')->nullable()->unique();
            $table->string('logo_url')->nullable();
            $table->string('status')->default('active');
            $table->string('plan')->nullable();
            $table->jsonb('settings')->nullable();
            $table->timestamps();
        });

        // 2. Users
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('company_id')->nullable()->constrained('companies')->nullOnDelete();
            $table->string('name');
            $table->string('email')->unique();
            $table->string('password');
            $table->string('role')->default('operator');
            $table->string('status')->default('active');
            
            // Security & 2FA
            $table->boolean('two_factor_enabled')->default(false);
            $table->string('two_factor_secret')->nullable();
            $table->timestamp('two_factor_confirmed_at')->nullable();
            $table->boolean('must_change_password')->default(false);
            $table->timestamp('password_changed_at')->nullable();
            $table->integer('failed_attempts')->default(0);
            $table->timestamp('locked_at')->nullable();
            $table->timestamp('last_login_at')->nullable();
            
            $table->rememberToken();
            $table->timestamps();
        });

        // 3. Connected Systems
        Schema::create('connected_systems', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('company_id')->constrained('companies')->cascadeOnDelete();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('webhook_url')->nullable();
            $table->string('webhook_secret_hash')->nullable();
            $table->string('environment')->default('sandbox'); // sandbox, production
            $table->string('status')->default('active');
            $table->softDeletes();
            $table->timestamps();
        });

        // 4. API Keys
        Schema::create('api_keys', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('company_id')->constrained('companies')->cascadeOnDelete();
            $table->foreignId('connected_system_id')->constrained('connected_systems')->cascadeOnDelete();
            $table->string('name');
            $table->string('key')->unique(); // bp_live_... or bp_test_...
            $table->string('key_hash')->unique();
            $table->string('environment')->default('sandbox');
            $table->jsonb('scopes')->nullable();
            $table->timestamp('last_used_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->timestamp('revoked_at')->nullable();
            $table->softDeletes();
            $table->timestamps();
        });

        // 5. Gateway Accounts
        Schema::create('gateway_accounts', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('company_id')->constrained('companies')->cascadeOnDelete();
            $table->string('name');
            $table->string('provider'); // asaas, stripe, pagseguro, etc
            $table->text('credentials_encrypted');
            $table->string('environment')->default('sandbox');
            $table->string('status')->default('active');
            $table->timestamp('last_tested_at')->nullable();
            $table->string('last_test_status')->nullable();
            $table->softDeletes();
            $table->timestamps();
        });

        // 6. Checkout Experiences
        Schema::create('checkout_experiences', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('company_id')->constrained('companies')->cascadeOnDelete();
            $table->foreignId('connected_system_id')->nullable()->constrained('connected_systems')->nullOnDelete();
            $table->string('name');
            $table->string('status')->default('draft');
            $table->unsignedBigInteger('published_version_id')->nullable();
            $table->jsonb('settings')->nullable();
            $table->timestamps();
        });

        // 7. Checkout Experience Versions
        Schema::create('checkout_experience_versions', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('checkout_experience_id')->constrained('checkout_experiences')->cascadeOnDelete();
            $table->foreignId('company_id')->constrained('companies')->cascadeOnDelete();
            $table->integer('version_number');
            $table->jsonb('config_json');
            $table->string('status')->default('draft');
            $table->timestamps();
        });

        // Add FK back to experiences for published_version_id
        Schema::table('checkout_experiences', function (Blueprint $table) {
            $table->foreign('published_version_id')->references('id')->on('checkout_experience_versions')->nullOnDelete();
        });

        // 8. Checkout Sessions
        Schema::create('checkout_sessions', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('company_id')->constrained('companies')->cascadeOnDelete();
            $table->foreignId('connected_system_id')->constrained('connected_systems')->cascadeOnDelete();
            $table->foreignId('checkout_experience_id')->nullable()->constrained('checkout_experiences')->nullOnDelete();
            $table->string('session_token')->unique();
            $table->bigInteger('amount');
            $table->string('currency', 3)->default('BRL');
            $table->string('status')->default('created');
            $table->string('environment')->default('sandbox');
            $table->jsonb('customer_data')->nullable();
            $table->jsonb('metadata')->nullable();
            $table->timestamp('expires_at');
            $table->timestamps();
        });

        // 9. Orders
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('company_id')->constrained('companies')->cascadeOnDelete();
            $table->foreignId('connected_system_id')->nullable()->constrained('connected_systems')->nullOnDelete();
            $table->foreignId('checkout_session_id')->nullable()->constrained('checkout_sessions')->nullOnDelete();
            $table->string('external_order_id')->nullable();
            $table->bigInteger('amount');
            $table->string('currency', 3)->default('BRL');
            $table->string('status')->default('created');
            $table->jsonb('metadata')->nullable();
            $table->timestamps();
        });

        // 10. Payments
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('company_id')->constrained('companies')->cascadeOnDelete();
            $table->foreignId('order_id')->constrained('orders')->cascadeOnDelete();
            $table->foreignId('checkout_session_id')->nullable()->constrained('checkout_sessions')->nullOnDelete();
            $table->foreignId('gateway_account_id')->constrained('gateway_accounts')->cascadeOnDelete();
            $table->string('method'); // pix, credit_card, boleto
            $table->string('status')->default('pending');
            $table->bigInteger('amount');
            $table->string('currency', 3)->default('BRL');
            $table->string('gateway_payment_id')->nullable();
            $table->string('idempotency_key')->nullable()->unique();
            $table->string('trace_id')->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->timestamp('refunded_at')->nullable();
            $table->timestamps();
        });

        // 11. Payment Attempts
        Schema::create('payment_attempts', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('payment_id')->constrained('payments')->cascadeOnDelete();
            $table->string('status');
            $table->jsonb('request_payload')->nullable();
            $table->jsonb('response_payload')->nullable();
            $table->string('error_code')->nullable();
            $table->string('error_message')->nullable();
            $table->integer('latency_ms')->nullable();
            $table->timestamps();
        });

        // 12. Webhook Endpoints
        Schema::create('webhook_endpoints', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('company_id')->constrained('companies')->cascadeOnDelete();
            $table->foreignId('connected_system_id')->constrained('connected_systems')->cascadeOnDelete();
            $table->string('url');
            $table->string('secret_hash');
            $table->jsonb('events')->nullable();
            $table->string('status')->default('active');
            $table->timestamps();
        });

        // 13. Webhook Deliveries
        Schema::create('webhook_deliveries', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('company_id')->constrained('companies')->cascadeOnDelete();
            $table->foreignId('webhook_endpoint_id')->constrained('webhook_endpoints')->cascadeOnDelete();
            $table->string('event_type');
            $table->string('payload_masked');
            $table->string('status')->default('pending');
            $table->integer('http_status')->nullable();
            $table->integer('attempts')->default(0);
            $table->string('request_id')->nullable();
            $table->string('trace_id')->nullable();
            $table->timestamps();
        });

        // 14. Idempotency Keys
        Schema::create('idempotency_keys', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->foreignId('company_id')->constrained('companies')->cascadeOnDelete();
            $table->string('request_path');
            $table->jsonb('response_payload');
            $table->integer('response_status');
            $table->timestamp('expires_at');
            $table->timestamps();
        });

        // 15. Audit Logs (Standard)
        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('company_id')->nullable()->constrained('companies')->nullOnDelete();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('event');
            $table->string('entity_type')->nullable();
            $table->unsignedBigInteger('entity_id')->nullable();
            $table->jsonb('old_values')->nullable();
            $table->jsonb('new_values')->nullable();
            $table->string('ip_address')->nullable();
            $table->string('user_agent')->nullable();
            $table->string('request_id')->nullable();
            $table->string('trace_id')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
        Schema::dropIfExists('idempotency_keys');
        Schema::dropIfExists('webhook_deliveries');
        Schema::dropIfExists('webhook_endpoints');
        Schema::dropIfExists('payment_attempts');
        Schema::dropIfExists('payments');
        Schema::dropIfExists('orders');
        Schema::dropIfExists('checkout_sessions');
        Schema::dropIfExists('checkout_experience_versions');
        Schema::dropIfExists('checkout_experiences');
        Schema::dropIfExists('gateway_accounts');
        Schema::dropIfExists('api_keys');
        Schema::dropIfExists('connected_systems');
        Schema::dropIfExists('users');
        Schema::dropIfExists('companies');
    }
};
