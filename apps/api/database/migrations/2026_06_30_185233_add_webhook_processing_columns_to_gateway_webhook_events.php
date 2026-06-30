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
        Schema::table('gateway_webhook_events', function (Blueprint $table) {
            $table->boolean('signature_valid')->default(false)->after('payload_masked');
            $table->integer('retry_count')->default(0)->after('status');
            $table->timestamp('processed_at')->nullable()->after('retry_count');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('gateway_webhook_events', function (Blueprint $table) {
            $table->dropColumn(['signature_valid', 'retry_count', 'processed_at']);
        });
    }
};
