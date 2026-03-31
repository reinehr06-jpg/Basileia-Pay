<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('gateway_configs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('gateway_id')->constrained('gateways')->cascadeOnDelete();
            $table->string('key');
            $table->text('value');
            $table->timestamps();

            $table->unique(['gateway_id', 'key']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('gateway_configs');
    }
};
