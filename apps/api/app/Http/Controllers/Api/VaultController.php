<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\Vault\CardCrypto;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class VaultController extends Controller
{
    /**
     * Endpoint interno para tokenizar cartão.
     * Recebe dados limpos (PAN, EXP), gera criptografia e retorna um token opaco.
     * CVV NUNCA deve ser enviado para este endpoint.
     */
    public function tokenize(Request $request)
    {
        $companyId = $request->input('company_id');
        $number    = preg_replace('/\D/', '', $request->input('number', ''));
        $expiry    = trim($request->input('expiry', ''));

        if (strlen($number) < 12) {
            return response()->json(['error' => 'Cartão inválido'], 422);
        }

        $last4 = substr($number, -4);
        $brand = self::detectBrand($number);

        // NUNCA enviamos CVV para o CardCrypto
        $encrypted = CardCrypto::encrypt($companyId, [
            'number' => $number,
            'expiry' => $expiry,
        ]);

        $cardToken = (string) Str::uuid();

        DB::table('card_vault')->insert([
            'company_id' => $companyId,
            'card_token' => $cardToken,
            'brand'      => $brand,
            'last4'      => $last4,
            'ciphertext' => $encrypted['ciphertext'],
            'iv'         => $encrypted['iv'],
            'tag'        => $encrypted['tag'],
            'created_at' => now(),
        ]);

        return response()->json([
            'card_token' => $cardToken,
            'brand'      => $brand,
            'last4'      => $last4,
        ]);
    }

    /**
     * Endpoint interno para resolver um token.
     * Retorna PAN e EXP. NUNCA retorna CVV.
     */
    public function resolve(Request $request)
    {
        $companyId = (int) $request->input('company_id');
        $cardToken = $request->input('card_token');

        $record = DB::table('card_vault')
            ->where('company_id', $companyId)
            ->where('card_token', $cardToken)
            ->first();

        if (!$record) {
            return response()->json(['error' => 'Token inválido'], 404);
        }

        $data = CardCrypto::decrypt(
            $companyId,
            $record->ciphertext,
            $record->iv,
            $record->tag
        );

        DB::table('card_vault')
            ->where('id', $record->id)
            ->update(['last_used_at' => now()]);

        return response()->json([
            'number' => $data['pan'],
            'expiry' => $data['exp'],
            // CVV removido por segurança PCI-DSS
        ]);
    }

    /**
     * Detecta bandeira básica
     */
    protected static function detectBrand(string $pan): ?string
    {
        if (preg_match('/^4[0-9]{12}(?:[0-9]{3})?$/', $pan)) return 'visa';
        if (preg_match('/^5[1-5][0-9]{14}$/', $pan)) return 'mastercard';
        if (preg_match('/^3[47][0-9]{13}$/', $pan)) return 'amex';
        if (preg_match('/^6(?:011|5[0-9]{2})[0-9]{12}$/', $pan)) return 'discover';
        return 'unknown';
    }
}
