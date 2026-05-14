<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('checkout_versions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('checkout_config_id')->constrained()->cascadeOnDelete();
            $table->string('label')->nullable();
            $table->json('snapshot');
            $table->string('created_by')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('checkout_versions');
    }
};
