<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('source_configs', function (Blueprint $table) {
            $table->id();
            $table->string('source_name')->unique();
            $table->string('callback_url');
            $table->string('webhook_secret');
            $table->boolean('active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('source_configs');
    }
};