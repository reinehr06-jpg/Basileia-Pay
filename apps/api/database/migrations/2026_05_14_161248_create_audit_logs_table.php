<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->nullable()->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('connected_system_id')->nullable()->constrained('connected_systems')->onDelete('set null');
            
            $table->string('action'); // login, system.created, gateway.updated, session.created, payment.approved
            $table->string('entity_type')->nullable(); // App\Models\Payment
            $table->unsignedBigInteger('entity_id')->nullable();
            
            $table->string('ip')->nullable();
            $table->string('user_agent')->nullable();
            $table->json('metadata_masked')->nullable();
            
            $table->timestamp('created_at')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
    }
};
