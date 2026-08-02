<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $tables = [
            'transactions', 'payments', 'orders', 'checkout_sessions',
            'webhook_deliveries', 'webhook_endpoints', 'gateway_webhook_events',
            'audit_logs', 'alerts', 'refunds', 'financial_audit_logs',
            'pix_subscriptions', 'subscriptions', 'integrations',
            'user_sessions', 'auth_sessions', 'routing_rules', 'routing_decisions',
            'trust_decisions', 'trust_scores', 'checkout_scores',
            'customer_memories', 'recovery_campaigns', 'notification_logs',
            'gateway_health_snapshots', 'webhook_health_snapshots',
        ];

        foreach ($tables as $tableName) {
            if (Schema::hasTable($tableName) && Schema::hasColumn($tableName, 'company_id')) {
                Schema::table($tableName, function (Blueprint $table) use ($tableName) {
                    // Laravel 11/12 hasIndex
                    $indexName = $tableName . '_company_id_index';
                    $hasIndex = collect(Schema::getIndexes($tableName))->contains('name', $indexName);
                    
                    if (!$hasIndex) {
                        $table->index('company_id');
                    }
                });
            }
        }

        // Índices compostos importantes
        $compositeStatus = ['payments', 'orders', 'checkout_sessions'];
        foreach ($compositeStatus as $tableName) {
            if (Schema::hasTable($tableName)) {
                Schema::table($tableName, function (Blueprint $table) use ($tableName) {
                    $indexName = $tableName . '_company_id_status_index';
                    $hasIndex = collect(Schema::getIndexes($tableName))->contains('name', $indexName);
                    
                    if (!$hasIndex) {
                        $table->index(['company_id', 'status']);
                    }
                });
            }
        }

        $compositeCreated = ['transactions', 'payments'];
        foreach ($compositeCreated as $tableName) {
            if (Schema::hasTable($tableName)) {
                Schema::table($tableName, function (Blueprint $table) use ($tableName) {
                    $indexName = $tableName . '_company_id_created_at_index';
                    $hasIndex = collect(Schema::getIndexes($tableName))->contains('name', $indexName);
                    
                    if (!$hasIndex) {
                        $table->index(['company_id', 'created_at']);
                    }
                });
            }
        }

        if (Schema::hasTable('orders')) {
            Schema::table('orders', function (Blueprint $table) {
                $indexName = 'orders_status_updated_at_index';
                $hasIndex = collect(Schema::getIndexes('orders'))->contains('name', $indexName);
                
                if (!$hasIndex) {
                    $table->index(['status', 'updated_at']);
                }
            });
        }

        if (Schema::hasTable('payments')) {
            Schema::table('payments', function (Blueprint $table) {
                if (!collect(Schema::getIndexes('payments'))->contains('name', 'payments_gateway_payment_id_index')) {
                    $table->index('gateway_payment_id');
                }
            });
        }

        if (Schema::hasTable('checkout_sessions')) {
            Schema::table('checkout_sessions', function (Blueprint $table) {
                if (!collect(Schema::getIndexes('checkout_sessions'))->contains('name', 'checkout_sessions_session_token_index')) {
                    $table->index('session_token');
                }
                if (!collect(Schema::getIndexes('checkout_sessions'))->contains('name', 'checkout_sessions_expires_at_index')) {
                    $table->index('expires_at');
                }
            });
        }

        if (Schema::hasTable('webhook_deliveries')) {
            Schema::table('webhook_deliveries', function (Blueprint $table) {
                if (!collect(Schema::getIndexes('webhook_deliveries'))->contains('name', 'webhook_deliveries_webhook_endpoint_id_status_index')) {
                    $table->index(['webhook_endpoint_id', 'status']);
                }
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $tables = [
            'transactions', 'payments', 'orders', 'checkout_sessions',
            'webhook_deliveries', 'webhook_endpoints', 'gateway_webhook_events',
            'audit_logs', 'alerts', 'refunds', 'financial_audit_logs',
            'pix_subscriptions', 'subscriptions', 'integrations',
            'user_sessions', 'auth_sessions', 'routing_rules', 'routing_decisions',
            'trust_decisions', 'trust_scores', 'checkout_scores',
            'customer_memories', 'recovery_campaigns', 'notification_logs',
            'gateway_health_snapshots', 'webhook_health_snapshots',
        ];

        foreach ($tables as $tableName) {
            if (Schema::hasTable($tableName) && Schema::hasColumn($tableName, 'company_id')) {
                Schema::table($tableName, function (Blueprint $table) use ($tableName) {
                    $indexName = $tableName . '_company_id_index';
                    $hasIndex = collect(Schema::getIndexes($tableName))->contains('name', $indexName);
                    if ($hasIndex) {
                        $table->dropIndex($indexName);
                    }
                });
            }
        }

        // Composite indexes drop
        $compositeStatus = ['payments', 'orders', 'checkout_sessions'];
        foreach ($compositeStatus as $tableName) {
            if (Schema::hasTable($tableName)) {
                Schema::table($tableName, function (Blueprint $table) use ($tableName) {
                    $indexName = $tableName . '_company_id_status_index';
                    $hasIndex = collect(Schema::getIndexes($tableName))->contains('name', $indexName);
                    if ($hasIndex) {
                        $table->dropIndex($indexName);
                    }
                });
            }
        }

        $compositeCreated = ['transactions', 'payments'];
        foreach ($compositeCreated as $tableName) {
            if (Schema::hasTable($tableName)) {
                Schema::table($tableName, function (Blueprint $table) use ($tableName) {
                    $indexName = $tableName . '_company_id_created_at_index';
                    $hasIndex = collect(Schema::getIndexes($tableName))->contains('name', $indexName);
                    if ($hasIndex) {
                        $table->dropIndex($indexName);
                    }
                });
            }
        }

        if (Schema::hasTable('orders')) {
            Schema::table('orders', function (Blueprint $table) {
                $indexName = 'orders_status_updated_at_index';
                $hasIndex = collect(Schema::getIndexes('orders'))->contains('name', $indexName);
                if ($hasIndex) {
                    $table->dropIndex($indexName);
                }
            });
        }

        if (Schema::hasTable('payments')) {
            Schema::table('payments', function (Blueprint $table) {
                if (collect(Schema::getIndexes('payments'))->contains('name', 'payments_gateway_payment_id_index')) {
                    $table->dropIndex('payments_gateway_payment_id_index');
                }
            });
        }

        if (Schema::hasTable('checkout_sessions')) {
            Schema::table('checkout_sessions', function (Blueprint $table) {
                if (collect(Schema::getIndexes('checkout_sessions'))->contains('name', 'checkout_sessions_session_token_index')) {
                    $table->dropIndex('checkout_sessions_session_token_index');
                }
                if (collect(Schema::getIndexes('checkout_sessions'))->contains('name', 'checkout_sessions_expires_at_index')) {
                    $table->dropIndex('checkout_sessions_expires_at_index');
                }
            });
        }

        if (Schema::hasTable('webhook_deliveries')) {
            Schema::table('webhook_deliveries', function (Blueprint $table) {
                if (collect(Schema::getIndexes('webhook_deliveries'))->contains('name', 'webhook_deliveries_webhook_endpoint_id_status_index')) {
                    $table->dropIndex('webhook_deliveries_webhook_endpoint_id_status_index');
                }
            });
        }
    }
};
