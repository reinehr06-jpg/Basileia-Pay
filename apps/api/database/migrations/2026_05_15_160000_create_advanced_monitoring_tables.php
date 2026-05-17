<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Alertas (Monitoramento e Segurança)
        Schema::create('alerts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('companies')->cascadeOnDelete();
            $table->string('environment')->default('production'); // sandbox, production
            $table->string('severity'); // info, low, medium, high, critical
            $table->string('category'); // financial, technical, security
            $table->string('type'); // ex: webhook_failure_rate
            $table->string('title');
            $table->text('message');
            $table->string('status')->default('open'); // open, acknowledged, resolved, muted
            $table->string('source')->nullable();
            $table->string('entity_type')->nullable();
            $table->string('entity_id')->nullable();
            $table->string('request_id')->nullable();
            $table->string('trace_id')->nullable();
            $table->jsonb('metadata')->nullable();
            $table->text('recommended_action')->nullable();
            $table->timestamp('first_seen_at');
            $table->timestamp('last_seen_at')->nullable();
            $table->timestamp('resolved_at')->nullable();
            $table->timestamps();
        });

        // 2. Snapshots de Saúde (Para gráficos e histórico)
        Schema::create('health_snapshots', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('companies')->cascadeOnDelete();
            $table->string('entity_type'); // gateway, webhook, checkout
            $table->string('entity_id');
            $table->jsonb('metrics'); // rates, latency, etc
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('health_snapshots');
        Schema::dropIfExists('alerts');
    }
};
