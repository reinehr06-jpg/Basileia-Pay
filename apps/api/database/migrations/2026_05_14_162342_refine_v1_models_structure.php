<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('companies', function (Blueprint $table) {
            $table->string('status')->default('active')->after('document');
            $table->string('email')->nullable()->after('status');
            $table->string('phone')->nullable()->after('email');
        });

        Schema::table('connected_systems', function (Blueprint $table) {
            $table->string('environment')->default('sandbox')->after('slug');
            $table->string('status')->default('active')->after('environment');
            $table->foreignId('default_gateway_account_id')->nullable()->constrained('gateway_accounts')->onDelete('set null');
            $table->foreignId('default_checkout_experience_id')->nullable()->constrained('checkout_experiences')->onDelete('set null');
        });

        Schema::table('checkout_experiences', function (Blueprint $table) {
            $table->string('status')->default('draft')->after('slug');
            $table->foreignId('published_version_id')->nullable()->after('status'); // FK adicionada manualmente depois se necessário
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->string('currency', 3)->default('BRL')->after('amount');
            $table->json('metadata')->nullable()->after('status');
        });

        Schema::table('checkout_sessions', function (Blueprint $table) {
            $table->string('session_token')->unique()->nullable()->after('uuid');
            $table->foreignId('order_id')->nullable()->constrained()->onDelete('cascade')->after('system_id');
            $table->foreignId('checkout_experience_version_id')->nullable()->after('checkout_experience_id');
            $table->json('resolved_config_json')->nullable()->after('expires_at');
        });

        Schema::table('payments', function (Blueprint $table) {
            $table->foreignId('checkout_session_id')->nullable()->constrained()->onDelete('set null')->after('order_id');
        });
    }

    public function down(): void
    {
        // ... (Simplificado por brevidade do ambiente de dev)
    }
};
