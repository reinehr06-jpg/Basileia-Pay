<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pix_subscription_mandates', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('subscription_id')->constrained('pix_subscriptions');
            $table->foreignId('company_id')->constrained('companies');
            $table->string('gateway_mandate_id')->nullable();
            $table->enum('status', ['pending', 'active', 'revoked', 'expired']);
            $table->string('authorization_url')->nullable();
            $table->timestamp('authorized_at')->nullable();
            $table->timestamp('revoked_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->jsonb('metadata')->nullable();
            $table->timestamps();
        });

        Schema::table('pix_subscriptions', function (Blueprint $table) {
            $table->foreign('mandate_id')->references('id')->on('pix_subscription_mandates');
        });
    }

    public function down(): void
    {
        Schema::table('pix_subscriptions', function (Blueprint $table) {
            $table->dropForeign(['mandate_id']);
        });
        Schema::dropIfExists('pix_subscription_mandates');
    }
};
