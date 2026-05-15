<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('audit_logs', function (Blueprint $table) {
            // Add uuid
            $table->uuid('uuid')->unique()->after('id');

            // Rename action -> event (new column)
            $table->renameColumn('action', 'event');

            // Rename ip -> ip_address_hash, and ensure it's string long enough for SHA-256 hex (64)
            $table->renameColumn('ip', 'ip_address_hash');

            // Rename metadata_masked -> metadata
            $table->renameColumn('metadata_masked', 'metadata');

            // Increase length of ip_address_hash to 64 if needed
            $table->string('ip_address_hash', 64)->change();
        });

        // Backfill uuid for existing rows
        DB::statement('UPDATE audit_logs SET uuid = gen_random_uuid() WHERE uuid IS NULL');

        // Ensure uuid not nullable
        Schema::table('audit_logs', function (Blueprint $table) {
            $table->uuid('uuid')->nullable(false)->unique()->change();
            $table->timestamp('created_at')->useCurrent();
        });

        // Create trigger to prevent UPDATE and DELETE
        $this->createImmutableTrigger();
    }

    public function down(): void
    {
        $this->dropImmutableTrigger();

        Schema::table('audit_logs', function (Blueprint $table) {
            $table->dropColumn(['uuid']);
            $table->renameColumn('event', 'action');
            $table->renameColumn('ip_address_hash', 'ip');
            $table->renameColumn('metadata', 'metadata_masked');
        });
    }

    private function createImmutableTrigger(): void
    {
        // PostgreSQL trigger function
        $sql = <<<'SQL'
CREATE OR REPLACE FUNCTION prevent_audit_log_modification()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'audit_logs são imutáveis — operação % negada.', TG_OP;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;
SQL;
        DB::statement($sql);

        $triggerSql = <<<'SQL'
CREATE TRIGGER audit_logs_immutable
    BEFORE UPDATE OR DELETE ON audit_logs
    FOR EACH ROW EXECUTE FUNCTION prevent_audit_log_modification();
SQL;
        DB::statement($triggerSql);
    }

    private function dropImmutableTrigger(): void
    {
        DB::statement('DROP TRIGGER IF EXISTS audit_logs_immutable ON audit_logs');
        DB::statement('DROP FUNCTION IF EXISTS prevent_audit_log_modification()');
    }
};
