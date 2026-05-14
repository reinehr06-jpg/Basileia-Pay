<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('checkout_experiences', function (Blueprint $table) {
            $table->id();
            $table->foreignId('connected_system_id')->constrained()->onDelete('cascade');
            $table->string('name');
            $table->json('config'); // Visual: colors, logo, fonts, layout, success/cancel urls
            $table->boolean('active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('checkout_experiences');
    }
};
