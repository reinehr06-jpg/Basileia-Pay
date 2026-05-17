<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Customer Memory (Lembrar preferências do comprador)
        Schema::create('customer_memories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('companies')->cascadeOnDelete();
            $table->string('email')->index();
            $table->string('preferred_method')->nullable(); // pix, card, boleto
            $table->string('last_card_brand')->nullable();
            $table->jsonb('metadata')->nullable(); // Outras preferências (ex: parcelas preferidas)
            $table->timestamp('last_seen_at')->nullable();
            $table->timestamps();

            $table->unique(['company_id', 'email']);
        });

        // 2. Recovery Campaigns (Configuração de réguas de recuperação)
        Schema::create('recovery_campaigns', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('companies')->cascadeOnDelete();
            $table->string('name');
            $table->string('channel'); // email, whatsapp, sms
            $table->integer('delay_minutes');
            $table->string('status')->default('active');
            $table->jsonb('content')->nullable(); // Template ou mensagem
            $table->timestamps();
        });

        // 3. Notification Logs (Rastro de comunicações)
        Schema::create('notification_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('companies')->cascadeOnDelete();
            $table->foreignId('checkout_session_id')->constrained('checkout_sessions')->cascadeOnDelete();
            $table->string('channel');
            $table->string('type'); // recovery, receipt, failure
            $table->string('recipient');
            $table->string('status')->default('sent'); // sent, failed, opened, clicked
            $table->timestamp('sent_at');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notification_logs');
        Schema::dropIfExists('recovery_campaigns');
        Schema::dropIfExists('customer_memories');
    }
};
