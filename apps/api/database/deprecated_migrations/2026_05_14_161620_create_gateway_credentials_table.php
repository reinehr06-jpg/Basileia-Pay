<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('gateway_credentials', function (Blueprint $table) {
            $table->id();
            $table->foreignId('gateway_account_id')->constrained('gateway_accounts')->onDelete('cascade');
            $table->string('key'); // e.g. api_key, client_secret
            $table->text('encrypted_value');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('gateway_credentials');
    }
};
