<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('card_vault', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('company_id');          // tenant dono do cartão
            $table->uuid('card_token')->unique();              // token opaco usado pelo checkout
            $table->string('brand', 20)->nullable();           // VISA/MC/...
            $table->string('last4', 4)->nullable();            // final do cartão

            $table->binary('ciphertext');                      // PAN+expiry+cvv criptografados
            $table->binary('iv');                              // IV do AES
            $table->binary('tag');                             // tag do GCM

            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('last_used_at')->nullable();

            $table->index(['company_id']);
            
            // Foreign key se desejar, mas opcional caso o vault seja "desacoplado" logicamente
            // $table->foreign('company_id')->references('id')->on('companies')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('card_vault');
    }
};
