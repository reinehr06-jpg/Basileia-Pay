<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Trust Decisions (Log de decisões do Trust Layer)
        Schema::create('trust_decisions', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('company_id')->constrained('companies')->cascadeOnDelete();
            $table->string('entity_type'); // checkout, payment, gateway, session
            $table->string('entity_id');
            $table->string('decision'); // allow, warn, recommend_alternative, require_review, block_publish, block_payment
            $table->integer('score');
            $table->text('reason');
            $table->text('recommended_action')->nullable();
            $table->jsonb('signals')->nullable();
            $table->string('environment')->default('production');
            $table->timestamps();
        });

        // 2. Trust Scores (Snapshots de score por entidade)
        Schema::create('trust_scores', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('companies')->cascadeOnDelete();
            $table->string('entity_type'); // checkout, gateway, webhook_endpoint, connected_system, company
            $table->string('entity_id');
            $table->integer('score');
            $table->string('status'); // excellent, healthy, at_risk, critical
            $table->jsonb('breakdown')->nullable(); // { security: 90, conversion: 80, trust: 75 }
            $table->timestamps();
        });

        // 3. Gateway Health Snapshots (Histórico de saúde por gateway)
        Schema::create('gateway_health_snapshots', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('companies')->cascadeOnDelete();
            $table->foreignId('gateway_account_id')->constrained('gateway_accounts')->cascadeOnDelete();
            $table->float('approval_rate')->nullable();
            $table->float('failure_rate')->nullable();
            $table->float('avg_latency_ms')->nullable();
            $table->integer('timeout_count')->default(0);
            $table->integer('fallback_count')->default(0);
            $table->integer('total_transactions')->default(0);
            $table->timestamp('last_approved_at')->nullable();
            $table->timestamp('last_failed_at')->nullable();
            $table->string('period')->default('hourly'); // hourly, daily
            $table->timestamps();
        });

        // 4. Webhook Health Snapshots (Histórico de saúde por webhook endpoint)
        Schema::create('webhook_health_snapshots', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('companies')->cascadeOnDelete();
            $table->foreignId('webhook_endpoint_id')->constrained('webhook_endpoints')->cascadeOnDelete();
            $table->float('success_rate')->nullable();
            $table->float('failure_rate')->nullable();
            $table->float('avg_response_time_ms')->nullable();
            $table->integer('retry_count')->default(0);
            $table->integer('failure_streak')->default(0);
            $table->timestamp('last_success_at')->nullable();
            $table->timestamp('last_failure_at')->nullable();
            $table->string('period')->default('hourly');
            $table->timestamps();
        });

        // 5. Enriquecer checkout_experience_versions com campos da Fase 5
        if (!Schema::hasColumn('checkout_experience_versions', 'status')) {
            // Already has status from previous migration, skip
        }

        // Adicionar campos extras se não existem
        Schema::table('checkout_experience_versions', function (Blueprint $table) {
            if (!Schema::hasColumn('checkout_experience_versions', 'source')) {
                $table->string('source')->nullable()->after('status'); // manual, ai_prompt, duplicate, import
            }
            if (!Schema::hasColumn('checkout_experience_versions', 'publication_score')) {
                $table->integer('publication_score')->nullable()->after('source');
            }
            if (!Schema::hasColumn('checkout_experience_versions', 'prompt_original')) {
                $table->text('prompt_original')->nullable()->after('publication_score');
            }
            if (!Schema::hasColumn('checkout_experience_versions', 'ai_metadata')) {
                $table->jsonb('ai_metadata')->nullable()->after('prompt_original');
            }
        });

        // 6. Routing Rules (Criação completa)
        Schema::create('routing_rules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('companies')->cascadeOnDelete();
            $table->string('name');
            $table->string('method')->nullable();
            $table->string('environment')->default('production');
            $table->unsignedBigInteger('primary_gateway_id')->nullable();
            $table->unsignedBigInteger('fallback_gateway_id')->nullable();
            $table->string('strategy')->default('priority');
            $table->boolean('recommended')->default(false);
            $table->integer('priority')->default(0);
            $table->boolean('active')->default(true);
            $table->jsonb('conditions')->nullable();
            $table->jsonb('action')->nullable();
            $table->timestamps();
        });

        // 7. Routing Decision History (Log de decisões de roteamento)
        Schema::create('routing_decisions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('companies')->cascadeOnDelete();
            $table->string('method');
            $table->string('environment');
            $table->unsignedBigInteger('chosen_gateway_id')->nullable();
            $table->unsignedBigInteger('fallback_gateway_id')->nullable();
            $table->string('decision'); // primary, fallback_activated, blocked
            $table->text('reason');
            $table->float('approval_rate')->nullable();
            $table->integer('trust_score')->nullable();
            $table->bigInteger('amount')->nullable();
            $table->string('checkout_id')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('routing_decisions');
        Schema::dropIfExists('routing_rules');
        Schema::dropIfExists('webhook_health_snapshots');
        Schema::dropIfExists('gateway_health_snapshots');
        Schema::dropIfExists('trust_scores');
        Schema::dropIfExists('trust_decisions');

        // Remove added columns (best effort)
        Schema::table('checkout_experience_versions', function (Blueprint $table) {
            $cols = ['source', 'publication_score', 'prompt_original', 'ai_metadata'];
            foreach ($cols as $col) {
                if (Schema::hasColumn('checkout_experience_versions', $col)) {
                    $table->dropColumn($col);
                }
            }
        });
    }
};
