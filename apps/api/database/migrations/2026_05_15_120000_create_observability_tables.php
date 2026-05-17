<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Analytics de Sessão (Métricas de performance de carregamento e interação)
        Schema::create('checkout_sessions_analytics', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('companies')->cascadeOnDelete();
            $table->foreignId('checkout_session_id')->constrained('checkout_sessions')->cascadeOnDelete();
            $table->string('event_type'); // session_opened, method_selected, form_focused, etc
            $table->string('device_type')->nullable(); // mobile, desktop, tablet
            $table->string('browser')->nullable();
            $table->string('os')->nullable();
            $table->string('ip_address')->nullable();
            $table->string('country')->nullable();
            $table->string('region')->nullable();
            $table->string('city')->nullable();
            $table->jsonb('metadata')->nullable();
            $table->timestamp('occurred_at');
            $table->timestamps();
        });

        // 2. Analytics de Pagamento (Funil de conversão)
        Schema::create('payment_analytics', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('companies')->cascadeOnDelete();
            $table->foreignId('payment_id')->constrained('payments')->cascadeOnDelete();
            $table->string('method');
            $table->string('status');
            $table->bigInteger('amount');
            $table->integer('latency_ms')->nullable(); // Tempo de resposta do gateway
            $table->string('error_code')->nullable();
            $table->string('bin')->nullable(); // Primeiros 6 dígitos do cartão
            $table->string('brand')->nullable();
            $table->timestamp('occurred_at');
            $table->timestamps();
        });

        // 3. Eventos de Abandono (Forensics)
        Schema::create('abandonment_events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('companies')->cascadeOnDelete();
            $table->foreignId('checkout_session_id')->constrained('checkout_sessions')->cascadeOnDelete();
            $table->string('last_action')->nullable();
            $table->string('last_field_focused')->nullable();
            $table->integer('time_spent_seconds')->nullable();
            $table->boolean('has_payment_attempt')->default(false);
            $table->timestamp('abandoned_at');
            $table->timestamps();
        });

        // 4. Checkout Scores (Calculado por experiência/versão)
        Schema::create('checkout_scores', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('companies')->cascadeOnDelete();
            $table->foreignId('checkout_experience_id')->constrained('checkout_experiences')->cascadeOnDelete();
            $table->integer('version_number');
            $table->decimal('conversion_rate', 5, 2)->default(0);
            $table->decimal('approval_rate', 5, 2)->default(0);
            $table->decimal('health_score', 5, 2)->default(100); // 0-100
            $table->integer('total_sessions')->default(0);
            $table->integer('total_success')->default(0);
            $table->timestamps();
        });

        // 5. Geographic Risk Signals (Mapa de calor de risco)
        Schema::create('geographic_risk_signals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('companies')->cascadeOnDelete();
            $table->string('country')->nullable();
            $table->string('region')->nullable();
            $table->string('city')->nullable();
            $table->integer('total_attempts')->default(0);
            $table->integer('total_failed')->default(0);
            $table->decimal('risk_index', 5, 2)->default(0); // 0-100
            $table->timestamps();
            
            $table->unique(['company_id', 'country', 'region', 'city'], 'geo_risk_unique');
        });

        // 6. Session Forensics Frames (Telemetria detalhada)
        Schema::create('session_forensics_frames', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('companies')->cascadeOnDelete();
            $table->foreignId('session_id')->constrained('checkout_sessions')->cascadeOnDelete();
            $table->string('frame_type');
            $table->string('element_id')->nullable();
            $table->integer('scroll_position')->nullable();
            $table->integer('time_in_session_ms')->default(0);
            $table->string('method_context')->nullable();
            $table->string('error_code')->nullable();
            $table->timestamp('occurred_at');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('session_forensics_frames');
        Schema::dropIfExists('geographic_risk_signals');
        Schema::dropIfExists('checkout_scores');
        Schema::dropIfExists('abandonment_events');
        Schema::dropIfExists('payment_analytics');
        Schema::dropIfExists('checkout_sessions_analytics');
    }
};
