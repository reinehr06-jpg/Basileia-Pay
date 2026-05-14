<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('customers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('companies')->cascadeOnDelete();
            $table->string('external_id')->nullable();
            $table->string('name');
            $table->string('email')->nullable();
            $table->string('document')->nullable();
            $table->string('phone')->nullable();
            $table->json('address')->nullable();
            $table->string('gateway_customer_id')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->index(['company_id', 'external_id']);
            $table->index(['company_id', 'document']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('customers');
    }
};
