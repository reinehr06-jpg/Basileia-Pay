<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('routing_rules', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('company_id')->index();

            $table->string('name', 100);
            $table->unsignedInteger('priority')->default(100); // menor = mais alta
            $table->boolean('active')->default(true);

            // Condições em JSON (country, method, amount_min/max, integration, bin...)
            $table->json('conditions');

            // Ação em JSON (gateway_id, fallback array)
            $table->json('action');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('routing_rules');
    }
};
