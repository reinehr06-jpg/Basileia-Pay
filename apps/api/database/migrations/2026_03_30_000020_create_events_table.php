<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->string('slug')->unique();
            $table->string('titulo');
            $table->text('descricao')->nullable();
            $table->decimal('valor', 12, 2);
            $table->string('moeda', 3)->default('BRL');
            $table->unsignedInteger('vagas_total');
            $table->unsignedInteger('vagas_ocupadas')->default(0);
            $table->string('whatsapp_vendedor')->nullable();
            $table->enum('metodo_pagamento', ['pix', 'boleto', 'credit_card', 'all'])->default('all');
            $table->timestamp('data_inicio')->nullable();
            $table->timestamp('data_fim')->nullable();
            $table->enum('status', ['ativo', 'esgotado', 'expirado'])->default('ativo');
            $table->string('gateway_transaction_id')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('events');
    }
};
