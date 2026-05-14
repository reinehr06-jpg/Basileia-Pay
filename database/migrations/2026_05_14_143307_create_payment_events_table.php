<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payment_events', function (Blueprint $table) {
            $table->id();

            $table->uuid('transaction_uuid')->index();
            $table->unsignedBigInteger('company_id')->nullable()->index();
            $table->unsignedBigInteger('integration_id')->nullable()->index();
            $table->unsignedBigInteger('gateway_id')->nullable()->index();
            $table->string('gateway_type', 50)->nullable();   // asaas, pagbank, etc.

            $table->string('event_type', 50);                 // created, requested, approved, refused, refunded, webhook_received...
            $table->string('status_normalized', 30)->nullable(); // approved, pending, refused, refunded, cancelled, error

            $table->string('payment_method', 30)->nullable(); // creditcard, pix, boleto, ...
            $table->string('currency', 10)->nullable();       // BRL, USD

            $table->decimal('amount', 15, 2)->nullable();

            $table->string('gateway_status', 100)->nullable(); // status cru do PSP
            $table->string('gateway_code', 100)->nullable();   // código de erro do PSP
            $table->string('gateway_message', 255)->nullable();

            $table->string('bin', 8)->nullable();
            $table->string('brand', 20)->nullable();
            $table->string('country', 2)->nullable();         // BR, US, etc.

            $table->timestamp('occurred_at')->index();        // quando o evento aconteceu
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payment_events');
    }
};
