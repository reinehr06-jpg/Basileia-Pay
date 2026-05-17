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
        
        // 2. Customers
        Schema::create('customers', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('company_id')->constrained('companies')->cascadeOnDelete();
            $table->string('name')->nullable();
            $table->string('email')->nullable();
            $table->string('document')->nullable();
            $table->string('document_type')->nullable(); // cpf, cnpj
            $table->string('phone')->nullable();
            $table->jsonb('metadata')->nullable();
            $table->timestamps();
            
            $table->index(['company_id', 'email']);
            $table->index(['company_id', 'document']);
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
            $table->string('description')->nullable();
            $table->string('logo_url')->nullable();
            $table->string('webhook_url')->nullable();
            $table->string('webhook_secret_hash')->nullable();
            $table->string('environment')->default('sandbox');
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
            $table->string('key_prefix')->nullable();
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
            $table->string('gateway_type'); // asaas, stripe, pagseguro
            $table->string('environment')->default('sandbox');
            $table->string('status')->default('active');
            $table->integer('priority')->default(0);
            $table->jsonb('settings')->nullable();
            $table->softDeletes();
            $table->timestamps();
        });

        // 6. Gateway Credentials
        Schema::create('gateway_credentials', function (Blueprint $table) {
            $table->id();
            $table->foreignId('gateway_account_id')->constrained('gateway_accounts')->cascadeOnDelete();
            $table->string('key');
            $table->text('encrypted_value'); // encrypted
            $table->string('key_version')->nullable();
            $table->timestamp('rotated_at')->nullable();
            $table->timestamps();
        });

        // 7. Checkout Experiences
        Schema::create('checkout_experiences', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('company_id')->constrained('companies')->cascadeOnDelete();
            $table->foreignId('connected_system_id')->nullable()->constrained('connected_systems')->nullOnDelete();
            $table->string('name');
            $table->string('status')->default('draft');
            $table->unsignedBigInteger('published_version_id')->nullable();
            $table->jsonb('config')->nullable();
            $table->timestamps();
        });

        // 8. Checkout Experience Versions
        Schema::create('checkout_experience_versions', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('checkout_experience_id')->constrained('checkout_experiences')->cascadeOnDelete();
            $table->integer('version_number');
            $table->jsonb('config_json');
            $table->timestamps();
        });

        // 9. Checkout Sessions
        Schema::create('checkout_sessions', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('company_id')->constrained('companies')->cascadeOnDelete();
            $table->foreignId('connected_system_id')->constrained('connected_systems')->cascadeOnDelete();
            $table->foreignId('checkout_experience_id')->nullable()->constrained('checkout_experiences')->nullOnDelete();
            $table->foreignId('gateway_account_id')->nullable()->constrained('gateway_accounts')->nullOnDelete();
            $table->string('session_token')->unique();
            $table->bigInteger('amount');
            $table->string('currency', 3)->default('BRL');
            $table->string('status')->default('open');
            $table->jsonb('customer')->nullable();
            $table->jsonb('items')->nullable();
            $table->jsonb('resolved_config_json')->nullable();
            $table->timestamp('expires_at');
            $table->timestamps();
        });

        // 10. Orders
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
            $table->timestamps();
        });

        // 11. Payments
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('company_id')->constrained('companies')->cascadeOnDelete();
            $table->foreignId('order_id')->constrained('orders')->cascadeOnDelete();
            $table->foreignId('checkout_session_id')->nullable()->constrained('checkout_sessions')->nullOnDelete();
            $table->foreignId('gateway_account_id')->constrained('gateway_accounts')->cascadeOnDelete();
            $table->string('method');
            $table->string('status')->default('pending');
            $table->bigInteger('amount');
            $table->string('currency', 3)->default('BRL');
            $table->string('gateway_payment_id')->nullable()->index();
            $table->string('idempotency_key')->nullable()->index();
            $table->text('pix_qrcode')->nullable();
            $table->text('pix_qrcode_url')->nullable();
            $table->timestamp('pix_expires_at')->nullable();
            $table->text('boleto_url')->nullable();
            $table->string('boleto_barcode')->nullable();
            $table->jsonb('gateway_response')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();
        });

        // 12. Payment Attempts
        Schema::create('payment_attempts', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('company_id')->constrained('companies')->cascadeOnDelete();
            $table->foreignId('payment_id')->constrained('payments')->cascadeOnDelete();
            $table->foreignId('gateway_account_id')->constrained('gateway_accounts')->cascadeOnDelete();
            $table->string('method');
            $table->string('status');
            $table->string('gateway_payment_id')->nullable()->index();
            $table->jsonb('request_payload_masked')->nullable();
            $table->jsonb('response_payload_masked')->nullable();
            $table->timestamp('started_at')->nullable();
            $table->timestamp('finished_at')->nullable();
            $table->timestamps();
        });

        // 13. Payment Events (Lifecycle Tracking)
        Schema::create('payment_events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('companies')->cascadeOnDelete();
            $table->foreignId('payment_id')->constrained('payments')->cascadeOnDelete();
            $table->foreignId('payment_attempt_id')->nullable()->constrained('payment_attempts')->nullOnDelete();
            $table->foreignId('order_id')->constrained('orders')->cascadeOnDelete();
            $table->foreignId('checkout_session_id')->constrained('checkout_sessions')->cascadeOnDelete();
            $table->string('event_type');
            $table->string('status_from')->nullable();
            $table->string('status_to')->nullable();
            $table->string('provider')->nullable();
            $table->string('gateway_payment_id')->nullable();
            $table->string('request_id')->nullable();
            $table->string('trace_id')->nullable();
            $table->jsonb('metadata_masked')->nullable();
            $table->timestamps();
        });

        // 14. Webhook Endpoints (Outbound)
        Schema::create('webhook_endpoints', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('company_id')->constrained('companies')->cascadeOnDelete();
            $table->foreignId('connected_system_id')->constrained('connected_systems')->cascadeOnDelete();
            $table->string('url');
            $table->string('secret')->nullable();
            $table->string('status')->default('active');
            $table->boolean('active')->default(true);
            $table->timestamps();
        });

        // 15. Webhook Deliveries (Outbound Tracking)
        Schema::create('webhook_deliveries', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('company_id')->constrained('companies')->cascadeOnDelete();
            $table->foreignId('webhook_endpoint_id')->constrained('webhook_endpoints')->cascadeOnDelete();
            $table->string('event');
            $table->jsonb('payload')->nullable();
            $table->string('status')->default('pending');
            $table->integer('response_status')->nullable();
            $table->text('response_body')->nullable();
            $table->integer('attempt_count')->default(0);
            $table->timestamps();
        });

        // 16. Gateway Webhook Events (Inbound tracking)
        Schema::create('gateway_webhook_events', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('company_id')->constrained('companies')->cascadeOnDelete();
            $table->string('gateway');
            $table->string('gateway_event_id')->unique();
            $table->string('event_type');
            $table->jsonb('payload_masked');
            $table->string('status')->default('received');
            $table->timestamps();
        });

        // 17. Idempotency Keys
        Schema::create('idempotency_keys', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('companies')->cascadeOnDelete();
            $table->foreignId('checkout_session_id')->nullable()->constrained('checkout_sessions')->nullOnDelete();
            $table->string('key')->index();
            $table->string('request_hash')->index();
            $table->jsonb('response_payload')->nullable();
            $table->integer('status_code')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();

            $table->unique(['company_id', 'key']);
        });

        // 18. Personal Access Tokens (Sanctum)
        Schema::create('personal_access_tokens', function (Blueprint $table) {
            $table->id();
            $table->morphs('tokenable');
            $table->string('name');
            $table->string('token', 64)->unique();
            $table->text('abilities')->nullable();
            $table->timestamp('last_used_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();
        });

        // 19. Audit Logs
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
            $table->string('ip_address_hash')->nullable();
            $table->string('user_agent')->nullable();
            $table->jsonb('metadata')->nullable();
            $table->string('request_id')->nullable();
            $table->string('trace_id')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('personal_access_tokens');
        Schema::dropIfExists('audit_logs');
        Schema::dropIfExists('idempotency_keys');
        Schema::dropIfExists('gateway_webhook_events');
        Schema::dropIfExists('webhook_deliveries');
        Schema::dropIfExists('webhook_endpoints');
        Schema::dropIfExists('payment_events');
        Schema::dropIfExists('payment_attempts');
        Schema::dropIfExists('payments');
        Schema::dropIfExists('orders');
        Schema::dropIfExists('checkout_sessions');
        Schema::dropIfExists('checkout_experience_versions');
        Schema::dropIfExists('checkout_experiences');
        Schema::dropIfExists('gateway_credentials');
        Schema::dropIfExists('gateway_accounts');
        Schema::dropIfExists('api_keys');
        Schema::dropIfExists('connected_systems');
        Schema::dropIfExists('users');
        Schema::dropIfExists('customers');
        Schema::dropIfExists('companies');
    }
};
