<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

/**
 * PARTE 2 — Tabelas Core Financeiras e Motor de Pagamentos
 *
 * Esta migration consolida as tabelas para o motor financeiro:
 * - checkout_experiences & versions
 * - customers
 * - checkout_sessions
 * - orders
 * - payments
 * - payment_attempts
 * - payment_events (immutable)
 * - pix_charges
 * - boleto_charges
 * - checkout_recovery
 * - checkout_events
 * - webhook_endpoints & deliveries
 * - gateway_webhook_events
 */
return new class extends Migration
{
    public function up(): void
    {
        // ─── checkout_versions (forward declaration for experiences) ───
        if (!Schema::hasTable('checkout_versions')) {
            Schema::create('checkout_versions', function (Blueprint $table) {
                $table->id();
                $table->uuid('uuid')->unique();
                $table->unsignedBigInteger('checkout_id'); // FK added later
                $table->integer('version_number');
                $table->jsonb('snapshot');
                $table->timestamp('published_at')->nullable();
                $table->unsignedBigInteger('published_by')->nullable();
                $table->timestamp('created_at')->useCurrent();
            });
        }

        // ─── checkout_experiences ───
        if (!Schema::hasTable('checkout_experiences')) {
            Schema::create('checkout_experiences', function (Blueprint $table) {
                $table->id();
                $table->uuid('uuid')->unique();
                $table->foreignId('company_id')->constrained('companies')->cascadeOnDelete();
                $table->foreignId('system_id')->nullable()->constrained('connected_systems')->nullOnDelete();
                $table->string('name');
                $table->string('description')->nullable();
                $table->string('status')->default('draft');
                $table->unsignedBigInteger('current_version_id')->nullable();
                $table->jsonb('settings')->nullable();
                $table->unsignedBigInteger('created_by')->nullable();
                $table->timestamps();
            });

            // Add FK constraints now that both exist
            Schema::table('checkout_versions', function (Blueprint $table) {
                $table->foreign('checkout_id')->references('id')->on('checkout_experiences')->cascadeOnDelete();
                $table->foreign('published_by')->references('id')->on('users')->nullOnDelete();
            });
            
            Schema::table('checkout_experiences', function (Blueprint $table) {
                $table->foreign('current_version_id')->references('id')->on('checkout_versions')->nullOnDelete();
                $table->foreign('created_by')->references('id')->on('users')->nullOnDelete();
            });
        }

        // ─── customers (update or create) ───
        if (!Schema::hasTable('customers')) {
            Schema::create('customers', function (Blueprint $table) {
                $table->id();
                $table->uuid('uuid')->unique();
                $table->foreignId('company_id')->constrained('companies')->cascadeOnDelete();
                $table->string('name')->nullable();
                $table->string('email')->nullable();
                $table->string('document')->nullable();
                $table->string('document_type')->nullable();
                $table->string('phone')->nullable();
                $table->jsonb('metadata')->nullable();
                $table->timestamps();
            });
        } else {
            if (!Schema::hasColumn('customers', 'uuid')) {
                Schema::table('customers', function (Blueprint $table) {
                    $table->uuid('uuid')->unique()->nullable()->after('id');
                });
            }
            if (!Schema::hasColumn('customers', 'document_type')) {
                Schema::table('customers', function (Blueprint $table) {
                    $table->string('document_type')->nullable()->after('document');
                });
            }
        }

        // ─── checkout_sessions (update or create) ───
        if (!Schema::hasTable('checkout_sessions')) {
            Schema::create('checkout_sessions', function (Blueprint $table) {
                $table->id();
                $table->uuid('uuid')->unique();
                $table->foreignId('company_id')->constrained('companies')->cascadeOnDelete();
                $table->foreignId('system_id')->constrained('connected_systems')->cascadeOnDelete();
                $table->foreignId('checkout_version_id')->nullable()->constrained('checkout_versions')->nullOnDelete();
                $table->foreignId('customer_id')->nullable()->constrained('customers')->nullOnDelete();
                $table->string('session_token')->unique();
                $table->bigInteger('amount');
                $table->string('currency')->default('BRL');
                $table->string('status')->default('created');
                $table->jsonb('metadata')->nullable();
                $table->string('recovery_token')->nullable()->unique();
                $table->timestamp('abandoned_at')->nullable();
                $table->timestamp('recovery_email_sent_at')->nullable();
                $table->timestamp('expires_at');
                $table->timestamps();
            });
        } else {
             // Add missing columns to checkout_sessions
             if (!Schema::hasColumn('checkout_sessions', 'recovery_token')) {
                 Schema::table('checkout_sessions', function(Blueprint $table) {
                     $table->string('recovery_token')->nullable()->unique();
                     $table->timestamp('abandoned_at')->nullable();
                     $table->timestamp('recovery_email_sent_at')->nullable();
                 });
             }
             if (Schema::hasColumn('checkout_sessions', 'checkout_experience_version_id')) {
                 Schema::table('checkout_sessions', function(Blueprint $table) {
                    // Rename for consistency if it exists
                    $table->renameColumn('checkout_experience_version_id', 'checkout_version_id');
                 });
             }
             if (!Schema::hasColumn('checkout_sessions', 'checkout_version_id')) {
                Schema::table('checkout_sessions', function(Blueprint $table) {
                    $table->foreignId('checkout_version_id')->nullable()->constrained('checkout_versions')->nullOnDelete();
                });
             }
        }

        // ─── orders (update or create) ───
        if (!Schema::hasTable('orders')) {
            Schema::create('orders', function (Blueprint $table) {
                $table->id();
                $table->uuid('uuid')->unique();
                $table->foreignId('company_id')->constrained('companies')->cascadeOnDelete();
                $table->foreignId('system_id')->nullable()->constrained('connected_systems')->nullOnDelete();
                $table->foreignId('checkout_session_id')->nullable()->constrained('checkout_sessions')->nullOnDelete();
                $table->foreignId('customer_id')->nullable()->constrained('customers')->nullOnDelete();
                $table->string('external_order_id')->nullable();
                $table->bigInteger('amount');
                $table->string('currency')->default('BRL');
                $table->bigInteger('discount_amount')->default(0);
                $table->bigInteger('tax_amount')->default(0);
                $table->jsonb('items')->nullable();
                $table->string('status')->default('created');
                $table->timestamp('paid_at')->nullable();
                $table->timestamp('expires_at')->nullable();
                $table->jsonb('metadata')->nullable();
                $table->timestamps();
            });
        } else {
             if (!Schema::hasColumn('orders', 'discount_amount')) {
                 Schema::table('orders', function(Blueprint $table) {
                     $table->bigInteger('discount_amount')->default(0);
                     $table->bigInteger('tax_amount')->default(0);
                     $table->timestamp('paid_at')->nullable();
                     $table->timestamp('expires_at')->nullable();
                 });
             }
             if (!Schema::hasColumn('orders', 'customer_id')) {
                Schema::table('orders', function (Blueprint $table) {
                    $table->foreignId('customer_id')->nullable()->constrained('customers')->nullOnDelete();
                });
             }
        }

        // ─── payments (update or create) ───
        if (!Schema::hasTable('payments')) {
            Schema::create('payments', function (Blueprint $table) {
                $table->id();
                $table->uuid('uuid')->unique();
                $table->foreignId('company_id')->constrained('companies')->cascadeOnDelete();
                $table->foreignId('order_id')->constrained('orders')->cascadeOnDelete();
                $table->foreignId('gateway_account_id')->constrained('gateway_accounts')->cascadeOnDelete();
                $table->string('method');
                $table->string('status')->default('pending');
                $table->bigInteger('amount');
                $table->string('currency')->default('BRL');
                $table->string('idempotency_key')->unique();
                $table->foreignId('customer_id')->nullable()->constrained('customers')->nullOnDelete();
                $table->string('card_brand')->nullable();
                $table->string('card_last4')->nullable();
                $table->string('card_token_external')->nullable();
                $table->integer('installments')->default(1);
                $table->string('gateway_payment_id')->nullable();
                $table->string('gateway_status')->nullable();
                $table->timestamp('approved_at')->nullable();
                $table->timestamp('refunded_at')->nullable();
                $table->timestamp('expires_at')->nullable();
                $table->integer('trust_score')->nullable();
                $table->jsonb('trust_signals')->nullable();
                $table->timestamps();
            });
        } else {
             if (!Schema::hasColumn('payments', 'idempotency_key')) {
                 Schema::table('payments', function(Blueprint $table) {
                     $table->string('idempotency_key')->nullable()->unique();
                     $table->foreignId('customer_id')->nullable()->constrained('customers')->nullOnDelete();
                     $table->string('card_token_external')->nullable();
                     $table->integer('installments')->default(1);
                     $table->string('gateway_payment_id')->nullable();
                     $table->string('gateway_status')->nullable();
                     $table->timestamp('approved_at')->nullable();
                     $table->timestamp('refunded_at')->nullable();
                     $table->integer('trust_score')->nullable();
                     $table->jsonb('trust_signals')->nullable();
                 });
             }
             if (Schema::hasColumn('payments', 'card_last_digits')) {
                 Schema::table('payments', function(Blueprint $table) {
                     $table->renameColumn('card_last_digits', 'card_last4');
                 });
             }
        }

        // ─── payment_attempts (update or create) ───
        if (!Schema::hasTable('payment_attempts')) {
            Schema::create('payment_attempts', function (Blueprint $table) {
                $table->id();
                $table->uuid('uuid')->unique();
                $table->foreignId('payment_id')->constrained('payments')->cascadeOnDelete();
                $table->foreignId('gateway_account_id')->constrained('gateway_accounts')->cascadeOnDelete();
                $table->string('method');
                $table->string('status');
                $table->string('gateway_attempt_id')->nullable();
                $table->jsonb('request_masked')->nullable();
                $table->jsonb('response_masked')->nullable();
                $table->string('error_code')->nullable();
                $table->string('error_message')->nullable();
                $table->integer('latency_ms')->nullable();
                $table->timestamp('created_at')->useCurrent();
            });
        } else {
             if (!Schema::hasColumn('payment_attempts', 'gateway_attempt_id')) {
                 Schema::table('payment_attempts', function(Blueprint $table) {
                     $table->string('gateway_attempt_id')->nullable();
                     $table->integer('latency_ms')->nullable();
                 });
             }
             if (Schema::hasColumn('payment_attempts', 'request_payload_masked')) {
                  Schema::table('payment_attempts', function(Blueprint $table) {
                      $table->renameColumn('request_payload_masked', 'request_masked');
                      $table->renameColumn('response_payload_masked', 'response_masked');
                  });
             }
        }

        // ─── payment_events ───
        if (!Schema::hasTable('payment_events')) {
            Schema::create('payment_events', function (Blueprint $table) {
                $table->id();
                $table->foreignId('payment_id')->constrained('payments')->cascadeOnDelete();
                $table->string('event_type');
                $table->string('from_status')->nullable();
                $table->string('to_status')->nullable();
                $table->string('actor')->nullable();
                $table->jsonb('metadata')->nullable();
                $table->timestamp('occurred_at', 6);
            });
        } else {
            // Se já existe, garante que as colunas da Parte 2 existam
            if (!Schema::hasColumn('payment_events', 'from_status')) {
                 Schema::table('payment_events', function (Blueprint $table) {
                     $table->string('from_status')->nullable();
                     $table->string('to_status')->nullable();
                     $table->string('actor')->nullable();
                 });
            }
            if (!Schema::hasColumn('payment_events', 'payment_id')) {
                 Schema::table('payment_events', function (Blueprint $table) {
                     $table->unsignedBigInteger('payment_id')->nullable();
                 });
            }
        }

        // Trigger de imutabilidade para payment_events (PostgreSQL)
        if (config('database.default') === 'pgsql') {
            DB::statement("
                CREATE OR REPLACE FUNCTION prevent_payment_event_modification()
                RETURNS TRIGGER AS \$\$
                BEGIN
                    RAISE EXCEPTION 'payment_events são imutáveis — operação % negada.', TG_OP;
                    RETURN NULL;
                END;
                \$\$ LANGUAGE plpgsql;
            ");

            DB::statement("DROP TRIGGER IF EXISTS payment_events_immutable ON payment_events;");

            DB::statement("
                CREATE TRIGGER payment_events_immutable
                    BEFORE UPDATE OR DELETE ON payment_events
                    FOR EACH ROW EXECUTE FUNCTION prevent_payment_event_modification();
            ");
        }

        // ─── pix_charges ───
        if (!Schema::hasTable('pix_charges')) {
            Schema::create('pix_charges', function (Blueprint $table) {
                $table->id();
                $table->uuid('uuid')->unique();
                $table->foreignId('payment_attempt_id')->constrained('payment_attempts')->cascadeOnDelete();
                $table->string('gateway_pix_id');
                $table->text('qr_code_base64');
                $table->text('copy_paste_code');
                $table->timestamp('expires_at');
                $table->string('status')->default('pending');
                $table->integer('poll_count')->default(0);
                $table->timestamp('last_polled_at')->nullable();
                $table->timestamp('paid_at')->nullable();
                $table->timestamps();
            });
        }

        // ─── boleto_charges ───
        if (!Schema::hasTable('boleto_charges')) {
            Schema::create('boleto_charges', function (Blueprint $table) {
                $table->id();
                $table->uuid('uuid')->unique();
                $table->foreignId('payment_attempt_id')->constrained('payment_attempts')->cascadeOnDelete();
                $table->string('gateway_boleto_id');
                $table->string('barcode');
                $table->string('pdf_url')->nullable();
                $table->date('due_date');
                $table->string('status')->default('pending');
                $table->timestamp('paid_at')->nullable();
                $table->timestamps();
            });
        }

        // ─── checkout_recovery ───
        if (!Schema::hasTable('checkout_recovery')) {
            Schema::create('checkout_recovery', function (Blueprint $table) {
                $table->id();
                $table->uuid('uuid')->unique();
                $table->foreignId('checkout_session_id')->constrained('checkout_sessions')->cascadeOnDelete();
                $table->foreignId('company_id')->constrained('companies')->cascadeOnDelete();
                $table->string('recovery_token')->unique();
                $table->timestamp('abandoned_at');
                $table->timestamp('email_sent_at')->nullable();
                $table->timestamp('opened_at')->nullable();
                $table->timestamp('converted_at')->nullable();
                $table->unsignedBigInteger('converted_payment_id')->nullable();
                $table->timestamp('expires_at');
                $table->timestamp('created_at')->useCurrent();
            });
        }

        // ─── checkout_events ───
        if (!Schema::hasTable('checkout_events')) {
            Schema::create('checkout_events', function (Blueprint $table) {
                $table->id();
                $table->foreignId('checkout_session_id')->constrained('checkout_sessions')->cascadeOnDelete();
                $table->foreignId('company_id')->constrained('companies')->cascadeOnDelete();
                $table->string('event_type');
                $table->string('ip_hash')->nullable();
                $table->string('device_type')->nullable();
                $table->jsonb('metadata')->nullable();
                $table->timestamp('occurred_at', 6);
            });
        }

        // ─── webhook_endpoints ───
        if (!Schema::hasTable('webhook_endpoints')) {
            Schema::create('webhook_endpoints', function (Blueprint $table) {
                $table->id();
                $table->uuid('uuid')->unique();
                $table->foreignId('company_id')->constrained('companies')->cascadeOnDelete();
                $table->foreignId('system_id')->constrained('connected_systems')->cascadeOnDelete();
                $table->string('url');
                $table->string('secret_hash');
                $table->jsonb('events');
                $table->string('status')->default('active');
                $table->integer('failure_count')->default(0);
                $table->timestamp('last_delivery_at')->nullable();
                $table->string('last_delivery_status')->nullable();
                $table->timestamps();
            });
        }

        // ─── webhook_deliveries ───
        if (!Schema::hasTable('webhook_deliveries')) {
            Schema::create('webhook_deliveries', function (Blueprint $table) {
                $table->id();
                $table->uuid('uuid')->unique();
                $table->foreignId('company_id')->constrained('companies')->cascadeOnDelete();
                $table->foreignId('endpoint_id')->constrained('webhook_endpoints')->cascadeOnDelete();
                $table->string('event_type');
                $table->string('idempotency_key');
                $table->jsonb('payload_masked');
                $table->string('status')->default('pending');
                $table->integer('http_status')->nullable();
                $table->text('response_body')->nullable();
                $table->integer('attempts')->default(0);
                $table->timestamp('next_retry_at')->nullable();
                $table->timestamp('delivered_at')->nullable();
                $table->timestamps();
            });
        }

        // ─── gateway_webhook_events ───
        if (!Schema::hasTable('gateway_webhook_events')) {
            Schema::create('gateway_webhook_events', function (Blueprint $table) {
                $table->id();
                $table->uuid('uuid')->unique();
                $table->foreignId('company_id')->constrained('companies')->cascadeOnDelete();
                $table->string('gateway');
                $table->string('gateway_event_id')->unique();
                $table->string('event_type');
                $table->jsonb('payload_masked');
                $table->timestamp('processed_at')->nullable();
                $table->string('status')->default('received');
                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        if (config('database.default') === 'pgsql') {
            DB::statement("DROP TRIGGER IF EXISTS payment_events_immutable ON payment_events;");
            DB::statement("DROP FUNCTION IF EXISTS prevent_payment_event_modification();");
        }

        Schema::dropIfExists('gateway_webhook_events');
        Schema::dropIfExists('webhook_deliveries');
        Schema::dropIfExists('webhook_endpoints');
        Schema::dropIfExists('checkout_events');
        Schema::dropIfExists('checkout_recovery');
        Schema::dropIfExists('boleto_charges');
        Schema::dropIfExists('pix_charges');
        // keep payment_events since we modified it, dropping might cause data loss.
        // schema drops for others could be defined here, but usually down() in a large refactor migration is tricky.
        // We'll leave it simple.
    }
};
