<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('checkout_ab_tests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('config_a_id')->constrained('checkout_configs')->cascadeOnDelete();
            $table->foreignId('config_b_id')->constrained('checkout_configs')->cascadeOnDelete();
            $table->unsignedTinyInteger('split_percent')->default(50);
            $table->boolean('is_active')->default(false);
            $table->unsignedInteger('visits_a')->default(0);
            $table->unsignedInteger('visits_b')->default(0);
            $table->unsignedInteger('conversions_a')->default(0);
            $table->unsignedInteger('conversions_b')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('checkout_ab_tests');
    }
};
