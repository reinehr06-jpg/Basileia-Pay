<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

/**
 * PARTE 1 — Tabelas Core de Segurança e Fundação
 *
 * Esta migration consolida todas as tabelas core necessárias para o
 * backend seguro da Basileia Pay. Ordem de criação respeita foreign keys.
 *
 * Tabelas criadas/atualizadas:
 *  - companies (update)
 *  - users (update)
 *  - user_sessions (create/replace)
 *  - connected_systems (update)
 *  - api_keys table via system_api_keys (update)
 *  - gateway_accounts (update)
 *  - audit_logs (update + immutability trigger)
 *  - master_access_challenges (update)
 *  - master_sessions (update)
 *  - master_access_audit_logs (update)
 */
return new class extends Migration
{
    public function up(): void
    {
        // ─── companies — adicionar colunas faltantes ───
        if (!Schema::hasColumn('companies', 'display_name')) {
            Schema::table('companies', function (Blueprint $table) {
                $table->string('display_name')->nullable()->after('name');
            });
        }
        if (!Schema::hasColumn('companies', 'document')) {
            Schema::table('companies', function (Blueprint $table) {
                $table->string('document')->nullable()->after('display_name');
            });
        }
        if (!Schema::hasColumn('companies', 'logo_url')) {
            Schema::table('companies', function (Blueprint $table) {
                $table->string('logo_url')->nullable()->after('email');
            });
        }
        if (!Schema::hasColumn('companies', 'plan')) {
            Schema::table('companies', function (Blueprint $table) {
                $table->string('plan')->nullable()->after('status');
            });
        }

        // ─── users — garantir todas as colunas de segurança ───
        if (!Schema::hasColumn('users', 'uuid')) {
            Schema::table('users', function (Blueprint $table) {
                $table->uuid('uuid')->unique()->nullable()->after('id');
            });
        }
        if (!Schema::hasColumn('users', 'role')) {
            Schema::table('users', function (Blueprint $table) {
                $table->string('role')->default('support')->after('password');
            });
        }
        if (!Schema::hasColumn('users', 'two_factor_secret')) {
            Schema::table('users', function (Blueprint $table) {
                $table->text('two_factor_secret')->nullable()->after('role');
            });
        }
        if (!Schema::hasColumn('users', 'two_factor_enabled')) {
            Schema::table('users', function (Blueprint $table) {
                $table->boolean('two_factor_enabled')->default(false)->after('two_factor_secret');
            });
        }
        if (!Schema::hasColumn('users', 'two_factor_confirmed_at')) {
            Schema::table('users', function (Blueprint $table) {
                $table->timestamp('two_factor_confirmed_at')->nullable()->after('two_factor_enabled');
            });
        }
        if (!Schema::hasColumn('users', 'failed_attempts')) {
            Schema::table('users', function (Blueprint $table) {
                $table->integer('failed_attempts')->default(0)->after('two_factor_confirmed_at');
            });
        }
        if (!Schema::hasColumn('users', 'locked_at')) {
            Schema::table('users', function (Blueprint $table) {
                $table->timestamp('locked_at')->nullable()->after('failed_attempts');
            });
        }
        if (!Schema::hasColumn('users', 'last_login_at')) {
            Schema::table('users', function (Blueprint $table) {
                $table->timestamp('last_login_at')->nullable()->after('locked_at');
            });
        }
        if (!Schema::hasColumn('users', 'status')) {
            Schema::table('users', function (Blueprint $table) {
                $table->string('status')->default('active')->after('last_login_at');
            });
        }

        // ─── user_sessions ───
        if (!Schema::hasTable('user_sessions')) {
            Schema::create('user_sessions', function (Blueprint $table) {
                $table->id();
                $table->uuid('uuid')->unique();
                $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
                $table->foreignId('company_id')->constrained('companies')->cascadeOnDelete();
                $table->string('session_token_hash');
                $table->string('ip_address')->nullable();
                $table->text('user_agent')->nullable();
                $table->string('device_fingerprint_hash')->nullable();
                $table->timestamp('started_at');
                $table->timestamp('expires_at');
                $table->timestamp('last_seen_at')->nullable();
                $table->timestamp('revoked_at')->nullable();
                $table->string('revoked_reason')->nullable();
                $table->timestamp('created_at')->useCurrent();

                $table->index(['user_id', 'revoked_at']);
                $table->index(['session_token_hash']);
            });
        }

        // ─── connected_systems — garantir colunas de segurança ───
        if (!Schema::hasColumn('connected_systems', 'uuid')) {
            Schema::table('connected_systems', function (Blueprint $table) {
                $table->uuid('uuid')->unique()->nullable()->after('id');
            });
        }
        if (!Schema::hasColumn('connected_systems', 'webhook_secret_hash')) {
            Schema::table('connected_systems', function (Blueprint $table) {
                $table->string('webhook_secret_hash')->nullable()->after('webhook_url');
            });
        }
        if (!Schema::hasColumn('connected_systems', 'environment')) {
            Schema::table('connected_systems', function (Blueprint $table) {
                $table->string('environment')->default('sandbox')->after('status');
            });
        }

        // ─── system_api_keys — garantir colunas de segurança ───
        if (Schema::hasTable('system_api_keys')) {
            if (!Schema::hasColumn('system_api_keys', 'uuid')) {
                Schema::table('system_api_keys', function (Blueprint $table) {
                    $table->uuid('uuid')->unique()->nullable()->after('id');
                });
            }
            if (!Schema::hasColumn('system_api_keys', 'company_id')) {
                Schema::table('system_api_keys', function (Blueprint $table) {
                    $table->unsignedBigInteger('company_id')->nullable()->after('uuid');
                });
            }
            if (!Schema::hasColumn('system_api_keys', 'scopes')) {
                Schema::table('system_api_keys', function (Blueprint $table) {
                    $table->jsonb('scopes')->nullable()->after('key_hash');
                });
            }
            if (!Schema::hasColumn('system_api_keys', 'last_used_at')) {
                Schema::table('system_api_keys', function (Blueprint $table) {
                    $table->timestamp('last_used_at')->nullable();
                });
            }
            if (!Schema::hasColumn('system_api_keys', 'expires_at')) {
                Schema::table('system_api_keys', function (Blueprint $table) {
                    $table->timestamp('expires_at')->nullable();
                });
            }
            if (!Schema::hasColumn('system_api_keys', 'revoked_at')) {
                Schema::table('system_api_keys', function (Blueprint $table) {
                    $table->timestamp('revoked_at')->nullable();
                });
            }
            if (!Schema::hasColumn('system_api_keys', 'revoked_by')) {
                Schema::table('system_api_keys', function (Blueprint $table) {
                    $table->unsignedBigInteger('revoked_by')->nullable();
                });
            }
            if (!Schema::hasColumn('system_api_keys', 'created_by')) {
                Schema::table('system_api_keys', function (Blueprint $table) {
                    $table->unsignedBigInteger('created_by')->nullable();
                });
            }
        }

        // ─── gateway_accounts — garantir colunas de segurança ───
        if (Schema::hasTable('gateway_accounts')) {
            if (!Schema::hasColumn('gateway_accounts', 'uuid')) {
                Schema::table('gateway_accounts', function (Blueprint $table) {
                    $table->uuid('uuid')->unique()->nullable()->after('id');
                });
            }
            if (!Schema::hasColumn('gateway_accounts', 'credentials_encrypted')) {
                Schema::table('gateway_accounts', function (Blueprint $table) {
                    $table->text('credentials_encrypted')->nullable()->after('provider');
                });
            }
            if (!Schema::hasColumn('gateway_accounts', 'last_tested_at')) {
                Schema::table('gateway_accounts', function (Blueprint $table) {
                    $table->timestamp('last_tested_at')->nullable();
                });
            }
            if (!Schema::hasColumn('gateway_accounts', 'last_test_status')) {
                Schema::table('gateway_accounts', function (Blueprint $table) {
                    $table->string('last_test_status')->nullable();
                });
            }
            if (!Schema::hasColumn('gateway_accounts', 'created_by')) {
                Schema::table('gateway_accounts', function (Blueprint $table) {
                    $table->unsignedBigInteger('created_by')->nullable();
                });
            }
        }

        // ─── audit_logs — garantir colunas ───
        if (Schema::hasTable('audit_logs')) {
            if (!Schema::hasColumn('audit_logs', 'uuid')) {
                Schema::table('audit_logs', function (Blueprint $table) {
                    $table->uuid('uuid')->unique()->nullable()->after('id');
                });
            }
            if (!Schema::hasColumn('audit_logs', 'ip_address_hash')) {
                Schema::table('audit_logs', function (Blueprint $table) {
                    $table->string('ip_address_hash')->nullable();
                });
            }
        }

        // ─── master_access_challenges ───
        if (!Schema::hasTable('master_access_challenges')) {
            Schema::create('master_access_challenges', function (Blueprint $table) {
                $table->id();
                $table->uuid('uuid')->unique();
                $table->string('token_prefix');
                $table->string('token_hash');
                $table->string('ephemeral_secret_hash');
                $table->string('generated_by');
                $table->string('generated_from_ip');
                $table->string('generated_from_device_hash')->nullable();
                $table->string('allowed_email');
                $table->string('status')->default('created');
                $table->timestamp('expires_at');
                $table->timestamp('consumed_at')->nullable();
                $table->integer('failed_attempts')->default(0);
                $table->timestamps();

                $table->index(['token_hash', 'status']);
                $table->index(['expires_at']);
            });
        }

        // ─── master_sessions ───
        if (!Schema::hasTable('master_sessions')) {
            Schema::create('master_sessions', function (Blueprint $table) {
                $table->id();
                $table->uuid('uuid')->unique();
                $table->unsignedBigInteger('user_id')->nullable();
                $table->unsignedBigInteger('company_id')->nullable();
                $table->string('session_token_hash');
                $table->string('ip_address');
                $table->string('device_fingerprint_hash')->nullable();
                $table->text('user_agent')->nullable();
                $table->timestamp('started_at');
                $table->timestamp('expires_at');
                $table->timestamp('last_seen_at')->nullable();
                $table->timestamp('revoked_at')->nullable();
                $table->string('revoked_reason')->nullable();
                $table->timestamp('created_at')->useCurrent();

                $table->index(['revoked_at', 'expires_at']);
            });
        }

        // ─── master_access_audit_logs ───
        if (!Schema::hasTable('master_access_audit_logs')) {
            Schema::create('master_access_audit_logs', function (Blueprint $table) {
                $table->id();
                $table->string('event');
                $table->unsignedBigInteger('user_id')->nullable();
                $table->string('email')->nullable();
                $table->string('ip_address');
                $table->string('device_fingerprint_hash')->nullable();
                $table->text('user_agent')->nullable();
                $table->unsignedBigInteger('challenge_id')->nullable();
                $table->unsignedBigInteger('session_id')->nullable();
                $table->jsonb('metadata_masked')->nullable();
                $table->timestamp('created_at')->useCurrent();
            });
        }

        // ─── Trigger de imutabilidade para audit_logs (PostgreSQL) ───
        if (config('database.default') === 'pgsql') {
            DB::statement("
                CREATE OR REPLACE FUNCTION prevent_audit_log_modification()
                RETURNS TRIGGER AS \$\$
                BEGIN
                    RAISE EXCEPTION 'audit_logs são imutáveis — operação % negada.', TG_OP;
                    RETURN NULL;
                END;
                \$\$ LANGUAGE plpgsql;
            ");

            // Drop trigger if exists to avoid error on re-run
            DB::statement("
                DROP TRIGGER IF EXISTS audit_logs_immutable ON audit_logs;
            ");

            DB::statement("
                CREATE TRIGGER audit_logs_immutable
                    BEFORE UPDATE OR DELETE ON audit_logs
                    FOR EACH ROW EXECUTE FUNCTION prevent_audit_log_modification();
            ");
        }
    }

    public function down(): void
    {
        // Trigger
        if (config('database.default') === 'pgsql') {
            DB::statement("DROP TRIGGER IF EXISTS audit_logs_immutable ON audit_logs;");
            DB::statement("DROP FUNCTION IF EXISTS prevent_audit_log_modification();");
        }

        Schema::dropIfExists('master_access_audit_logs');
        Schema::dropIfExists('master_sessions');
        Schema::dropIfExists('master_access_challenges');
        Schema::dropIfExists('user_sessions');
    }
};
