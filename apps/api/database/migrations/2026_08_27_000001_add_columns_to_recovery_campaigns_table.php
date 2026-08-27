<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('recovery_campaigns', function (Blueprint $table) {
            $table->foreignId('system_id')->nullable()->after('company_id')->constrained('connected_systems')->nullOnDelete();
            $table->string('trigger_event')->after('channel')->default('cart_abandoned');
            $table->integer('max_recovery_attempts')->after('delay_minutes')->default(3);
            $table->boolean('channel_email')->after('max_recovery_attempts')->default(true);
            $table->string('discount_type')->nullable()->after('channel_email');
            $table->integer('discount_value')->default(0)->after('discount_type');
            $table->integer('relink_expires_hours')->default(24)->after('discount_value');
        });
    }

    public function down(): void
    {
        Schema::table('recovery_campaigns', function (Blueprint $table) {
            $table->dropForeign(['system_id']);
            $table->dropColumn([
                'system_id',
                'trigger_event',
                'max_recovery_attempts',
                'channel_email',
                'discount_type',
                'discount_value',
                'relink_expires_hours',
            ]);
        });
    }
};
