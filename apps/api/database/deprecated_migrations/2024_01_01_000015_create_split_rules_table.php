<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('split_rules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('companies')->cascadeOnDelete();
            $table->foreignId('gateway_id')->nullable()->constrained('gateways')->nullOnDelete();
            $table->string('name');
            $table->enum('receiver_type', ['marketplace', 'seller', 'affiliate']);
            $table->string('receiver_identifier');
            $table->decimal('percentage', 5, 2)->nullable();
            $table->decimal('fixed_amount', 12, 2)->nullable();
            $table->unsignedInteger('priority')->default(0);
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('split_rules');
    }
};
