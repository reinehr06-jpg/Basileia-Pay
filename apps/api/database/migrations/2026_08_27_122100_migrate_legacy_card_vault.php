<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use App\Services\Vault\VaultKeyService;
use App\Services\Vault\VaultService;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (!Schema::hasTable('card_vault')) { return; }

        // 1. Ensure key_version exists in card_vault
        if (!Schema::hasColumn('card_vault', 'key_version')) {
            Schema::table('card_vault', function (Blueprint $table) {
                $table->string('key_version')->nullable()->after('ciphertext');
            });
        }

        // 2. Migrate existing records
        $service = app(VaultService::class);
        $records = DB::table('card_vault')->whereNull('key_version')->get();

        foreach ($records as $record) {
            try {
                // Read old raw key
                $oldKey = VaultKeyService::forCompany($record->company_id);

                // Decrypt using old structure
                $plaintext = openssl_decrypt(
                    $record->ciphertext,
                    'aes-256-gcm',
                    $oldKey,
                    OPENSSL_RAW_DATA,
                    $record->iv,
                    $record->tag
                );

                if ($plaintext !== false) {
                    // Encrypt with the new system (HKDF from KEK)
                    $encrypted = $service->encrypt($plaintext, $record->company_id);

                    // Update DB with new format
                    DB::table('card_vault')
                        ->where('id', $record->id)
                        ->update([
                            'ciphertext' => $encrypted['encrypted_value'],
                            'key_version' => $encrypted['key_version'],
                            'iv' => null,  // New system encapsulates IV inside Laravel Encrypter payload
                            'tag' => null, // New system encapsulates Tag inside Laravel Encrypter payload
                        ]);
                }
            } catch (\Exception $e) {
                \Illuminate\Support\Facades\Log::error("Falha ao migrar card_vault ID {$record->id}: " . $e->getMessage());
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (!Schema::hasTable('card_vault')) { return; }

        // Down migration can't safely restore to raw keys without risking data loss
        // Only dropping the column if it was added
        Schema::table('card_vault', function (Blueprint $table) {
            if (Schema::hasColumn('card_vault', 'key_version')) {
                $table->dropColumn('key_version');
            }
        });
    }
};
