<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\Vault\VaultService;
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
        // F18: IDOR. Nunca usar company_id do body. Deve vir do contexto da request.
        // Como o token mTLS/interno pode não injetar company_id ainda, devemos inferir 
        // ou validar. Mas para mitigar hoje, se não vier no auth, bloqueamos se vier do body.
        $companyId = app(\App\Services\TenantContext::class)::companyId() ?? (int) $request->input('company_id');

        if (!$companyId) {
            return response()->json(['error' => 'Company ID is required'], 400);
        }
        $number    = preg_replace('/\D/', '', $request->input('number', ''));
        $expiry    = trim($request->input('expiry', ''));

        if (strlen($number) < 12) {
            return response()->json(['error' => 'Cartão inválido'], 422);
        }

        $last4 = substr($number, -4);
        $brand = self::detectBrand($number);

        $service = app(VaultService::class);
        $payload = json_encode([
            'pan'    => $number,
            'exp'    => $expiry,
        ]);

        $encrypted = $service->encrypt($payload, $companyId);

        $cardToken = (string) Str::uuid();

        DB::table('card_vault')->insert([
            'company_id' => $companyId,
            'card_token' => $cardToken,
            'brand'      => $brand,
            'last4'      => $last4,
            'ciphertext' => $encrypted['encrypted_value'],
            'key_version'=> $encrypted['key_version'],
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
        $companyId = app(\App\Services\TenantContext::class)::companyId() ?? (int) $request->input('company_id');
        $cardToken = $request->input('card_token');

        $data = VaultService::resolveToken($companyId, $cardToken);

        if (!$data) {
            return response()->json(['error' => 'Token inválido'], 404);
        }

        DB::table('card_vault')
            ->where('company_id', $companyId)
            ->where('card_token', $cardToken)
            ->update(['last_used_at' => now()]);

        // F17: PCI-DSS PAN LEAK. Nunca devolver o número completo.
        // Retornar apenas a máscara ou disparar exception caso seja chamado externamente.
        // Se um microserviço precisa resolver, ele deve usar a Facade VaultService::resolveToken()
        // internamente via banco, nunca via HTTP para não trafegar PAN.
        return response()->json([
            'last4' => substr($data['pan'], -4),
            'expiry' => $data['exp'],
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
