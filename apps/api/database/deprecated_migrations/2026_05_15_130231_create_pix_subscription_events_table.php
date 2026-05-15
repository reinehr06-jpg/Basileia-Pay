<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pix_subscription_events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('subscription_id')->constrained('pix_subscriptions');
            $table->foreignId('company_id')->constrained('companies');
            $table->string('event_type');
            $table->string('from_status')->nullable();
            $table->string('to_status')->nullable();
            $table->string('actor')->nullable();
            $table->jsonb('metadata')->nullable();
            $table->timestamp('occurred_at', 6);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pix_subscription_events');
    }
};
