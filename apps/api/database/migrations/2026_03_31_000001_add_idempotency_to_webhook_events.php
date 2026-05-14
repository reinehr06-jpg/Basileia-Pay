<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('webhook_events', function (Blueprint $table) {
            if (!Schema::hasColumn('webhook_events', 'idempotency_key')) {
                $table->string('idempotency_key', 255)->nullable()->unique()->after('event_type');
            }
            if (!Schema::hasColumn('webhook_events', 'integration_id')) {
                $table->foreignId('integration_id')->nullable()->constrained('integrations')->nullOnDelete()->after('company_id');
            }
            if (!Schema::hasColumn('webhook_events', 'transaction_id')) {
                $table->foreignId('transaction_id')->nullable()->constrained('transactions')->nullOnDelete()->after('integration_id');
            }
        });
    }

    public function down(): void
    {
        Schema::table('webhook_events', function (Blueprint $table) {
            $table->dropForeign(['integration_id']);
            $table->dropForeign(['transaction_id']);
            $table->dropColumn(['idempotency_key', 'integration_id', 'transaction_id']);
        });
    }
};
