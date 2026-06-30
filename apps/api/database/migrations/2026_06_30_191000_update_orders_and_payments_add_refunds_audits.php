<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            if (!Schema::hasColumn('orders', 'checkout_id')) {
                $table->foreignUuid('checkout_id')->nullable()->constrained('checkouts')->nullOnDelete();
            }
            if (!Schema::hasColumn('orders', 'checkout_publication_id')) {
                $table->foreignId('checkout_publication_id')->nullable()->constrained('checkout_publications')->nullOnDelete();
            }
            if (!Schema::hasColumn('orders', 'customer_name')) {
                $table->string('customer_name')->nullable();
                $table->string('customer_email')->nullable();
                $table->string('customer_document')->nullable();
            }
            if (!Schema::hasColumn('orders', 'metadata')) {
                $table->jsonb('metadata')->nullable();
            }
        });

        Schema::create('refunds', function (Blueprint $table) {
            $table->id();
            $table->foreignId('payment_id')->constrained('payments')->cascadeOnDelete();
            $table->bigInteger('amount');
            $table->string('reason')->nullable();
            $table->string('status')->default('requested'); // requested, processing, completed, failed
            $table->foreignId('requested_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('financial_audit_logs', function (Blueprint $table) {
            $table->id();
            $table->string('entity_type'); // order, payment, refund
            $table->unsignedBigInteger('entity_id');
            $table->string('action');
            $table->foreignId('actor_id')->nullable()->constrained('users')->nullOnDelete();
            $table->jsonb('before_state')->nullable();
            $table->jsonb('after_state')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('financial_audit_logs');
        Schema::dropIfExists('refunds');

        Schema::table('orders', function (Blueprint $table) {
            $table->dropForeign(['checkout_id']);
            $table->dropForeign(['checkout_publication_id']);
            $table->dropColumn([
                'checkout_id',
                'checkout_publication_id',
                'customer_name',
                'customer_email',
                'customer_document',
                'metadata'
            ]);
        });
    }
};
