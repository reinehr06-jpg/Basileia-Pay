<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Drop existing 'checkouts' table that was created today with user_id
        Schema::dropIfExists('checkouts');

        // 2. Create the proper checkouts table with company_id
        Schema::create('checkouts', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignId('company_id')->constrained('companies')->cascadeOnDelete();
            $table->string('name');
            $table->string('system_id')->nullable()->unique();
            $table->string('status')->default('draft'); // draft, published, archived
            $table->integer('current_version')->default(1);
            $table->jsonb('config')->nullable();
            $table->float('trust_score')->nullable();
            $table->float('conversion_rate')->nullable();
            $table->timestamps();
        });

        // 3. Create checkout_versions table
        Schema::create('checkout_versions', function (Blueprint $table) {
            $table->id();
            $table->foreignUuid('checkout_id')->constrained('checkouts')->cascadeOnDelete();
            $table->integer('version_number');
            $table->jsonb('config');
            $table->float('trust_score')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        // 4. Create checkout_publications table
        Schema::create('checkout_publications', function (Blueprint $table) {
            $table->id();
            $table->foreignUuid('checkout_id')->constrained('checkouts')->cascadeOnDelete();
            $table->foreignId('checkout_version_id')->constrained('checkout_versions')->cascadeOnDelete();
            $table->timestamp('published_at');
            $table->foreignId('published_by')->nullable()->constrained('users')->nullOnDelete();
            $table->string('public_url')->nullable();
            $table->string('status')->default('active'); // active, superseded, rolled_back
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('checkout_publications');
        Schema::dropIfExists('checkout_versions');
        Schema::dropIfExists('checkouts');
    }
};
