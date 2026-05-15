<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Master Access Challenges
        Schema::create('master_access_challenges', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->string('token_prefix', 16);
            $table->string('token_hash', 64);
            $table->string('ephemeral_secret_hash');
            $table->string('generated_by');
            $table->string('generated_from_ip');
            $table->string('generated_from_device_hash')->nullable();
            $table->string('allowed_email');
            $table->enum('status', ['created', 'consumed', 'expired', 'blocked', 'revoked'])->default('created');
            $table->timestamp('expires_at');
            $table->timestamp('consumed_at')->nullable();
            $table->integer('failed_attempts')->default(0);
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->useCurrentOnUpdate();
        });

        // Master Sessions
        Schema::create('master_sessions', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('company_id')->nullable()->constrained()->nullOnDelete();
            $table->string('session_token_hash');
            $table->string('ip_address');
            $table->string('device_fingerprint_hash')->nullable();
            $table->string('user_agent')->nullable();
            $table->timestamp('started_at')->useCurrent();
            $table->timestamp('expires_at');
            $table->timestamp('last_seen_at')->nullable();
            $table->timestamp('revoked_at')->nullable();
            $table->string('revoked_reason')->nullable();
            $table->timestamp('created_at')->useCurrent();
        });

        // Master Access Audit Logs
        Schema::create('master_access_audit_logs', function (Blueprint $table) {
            $table->id();
            $table->string('event');
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('email')->nullable();
            $table->string('ip_address');
            $table->string('device_fingerprint_hash')->nullable();
            $table->string('user_agent')->nullable();
            $table->foreignId('challenge_id')->nullable()->constrained('master_access_challenges')->nullOnDelete();
            $table->foreignId('session_id')->nullable()->constrained('master_sessions')->nullOnDelete();
            $table->json('metadata_masked')->nullable();
            $table->timestamp('created_at')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('master_access_audit_logs');
        Schema::dropIfExists('master_sessions');
        Schema::dropIfExists('master_access_challenges');
    }
};
