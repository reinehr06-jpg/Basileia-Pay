<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('checkout_experience_versions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('checkout_experience_id')->constrained()->onDelete('cascade');
            $table->integer('version_number');
            $table->string('status')->default('draft'); // draft, published, archived
            $table->json('config_json');
            $table->timestamp('published_at')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('checkout_experience_versions');
    }
};
