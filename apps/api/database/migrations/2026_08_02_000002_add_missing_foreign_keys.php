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
        if (Schema::hasTable('pix_subscriptions')) {
            Schema::table('pix_subscriptions', function (Blueprint $table) {
                $foreignKeys = array_column(Schema::getForeignKeys('pix_subscriptions'), 'name');
                if (!in_array('pix_subscriptions_company_id_foreign', $foreignKeys)) {
                    $table->foreign('company_id')->references('id')->on('companies')->onDelete('cascade');
                }
                if (!in_array('pix_subscriptions_gateway_account_id_foreign', $foreignKeys)) {
                    $table->foreign('gateway_account_id')->references('id')->on('gateway_accounts')->onDelete('set null');
                }
            });
        }

        if (Schema::hasTable('refunds')) {
            Schema::table('refunds', function (Blueprint $table) {
                $foreignKeys = array_column(Schema::getForeignKeys('refunds'), 'name');
                if (!in_array('refunds_payment_id_foreign', $foreignKeys)) {
                    $table->foreign('payment_id')->references('id')->on('payments')->onDelete('cascade');
                }
            });
        }

        // Only add foreign key if polymorphic entity_type is payment, but since entity_id is mixed (polymorphic), adding a strict foreign key might break for other entity_types. 
        // We will skip strict foreign key on financial_audit_logs for entity_id since it's polymorphic. The user suggested it, but polymorphic foreign keys aren't supported generically in SQL without a composite check. 
        // But if they specifically requested it and their system only uses it for payments, we can add it without constraint or skip. We will skip it or add it but it might crash.
        // Actually, the user wrote "// se entity_type = payment", which means it's polymorphic. SQL cannot do conditional foreign keys easily. Let's just create an index instead of a strict FK, or just ignore since polymorphic FKs are not natively supported in most relational DBs without workarounds.
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('pix_subscriptions')) {
            Schema::table('pix_subscriptions', function (Blueprint $table) {
                $foreignKeys = array_column(Schema::getForeignKeys('pix_subscriptions'), 'name');
                if (in_array('pix_subscriptions_company_id_foreign', $foreignKeys)) {
                    $table->dropForeign(['company_id']);
                }
                if (in_array('pix_subscriptions_gateway_account_id_foreign', $foreignKeys)) {
                    $table->dropForeign(['gateway_account_id']);
                }
            });
        }

        if (Schema::hasTable('refunds')) {
            Schema::table('refunds', function (Blueprint $table) {
                $foreignKeys = array_column(Schema::getForeignKeys('refunds'), 'name');
                if (in_array('refunds_payment_id_foreign', $foreignKeys)) {
                    $table->dropForeign(['payment_id']);
                }
            });
        }
    }
};
