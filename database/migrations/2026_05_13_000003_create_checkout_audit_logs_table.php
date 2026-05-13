<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('checkout_audit_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('checkout_config_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->string('config_name', 255);
            $table->string('user_name', 255)->nullable();
            $table->string('user_email', 255)->nullable();
            $table->string('action', 64)->index();
            $table->json('before')->nullable();
            $table->json('after')->nullable();
            $table->json('diff_keys')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->timestamps();

            $table->index(['company_id', 'created_at']);
            $table->index(['checkout_config_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('checkout_audit_logs');
    }
};
