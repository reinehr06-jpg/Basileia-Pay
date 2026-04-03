<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class CardTokenizationController extends Controller
{
    protected static array $binCache = [];

    public function tokenize(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'card_number' => 'required|string|min:13|max:19',
            'card_holder_name' => 'required|string|max:255',
            'card_expiry' => 'required|string|size:5',
            'card_cvv' => 'required|string|min:3|max:4',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $number = preg_replace('/\D/', '', $request->card_number);
        $expiry = $request->card_expiry;
        $cvv = $request->card_cvv;
        $holder = strtoupper($request->card_holder_name);

        $detection = $this->detectCard($number);

        if ($detection['brand'] === 'unknown') {
            return response()->json([
                'success' => false,
                'error' => 'Bandeira não identificada',
                'reason' => 'brand_not_found',
            ], 400);
        }

        if (!$detection['length_valid']) {
            return response()->json([
                'success' => false,
                'error' => 'Número do cartão com tamanho inválido',
                'reason' => 'invalid_length',
                'brand' => $detection['brand'],
            ], 400);
        }

        if (!$detection['luhn_valid']) {
            return response()->json([
                'success' => false,
                'error' => 'Número do cartão inválido',
                'reason' => 'luhn_failed',
                'brand' => $detection['brand'],
            ], 400);
        }

        [$expMonth, $expYear] = explode('/', $expiry);
        $expMonth = (int) $expMonth;
        $expYear = (int) ('20' . $expYear);

        if ($expMonth < 1 || $expMonth > 12) {
            return response()->json([
                'success' => false,
                'error' => 'Mês de expiração inválido',
            ], 400);
        }

        if ($expYear < date('Y') || ($expYear === date('Y') && $expMonth < date('n'))) {
            return response()->json([
                'success' => false,
                'error' => 'Cartão expirado',
            ], 400);
        }

        $token = 'tok_' . Str::random(24);
        $last4 = substr($number, -4);
        $fingerprint = hash('sha256', $number . config('app.key'));

        $tokenData = [
            'id' => $token,
            'brand' => $detection['brand'],
            'last4' => $last4,
            'exp_month' => $expMonth,
            'exp_year' => $expYear,
            'holder_name' => $holder,
            'fingerprint' => $fingerprint,
            'created_at' => now()->toISOString(),
        ];

        cache()->put('card_token_' . $token, [
            'number_hash' => $fingerprint,
            'brand' => $detection['brand'],
            'last4' => $last4,
            'exp_month' => $expMonth,
            'exp_year' => $expYear,
            'holder_name' => $holder,
        ], now()->addMinutes(30));

        return response()->json([
            'success' => true,
            'token' => $tokenData,
        ]);
    }

    public function detectCard(string $number): array
    {
        $brands = $this->getCardBrands();
        $detectedBrand = null;

        foreach ($brands as $brand) {
            foreach ($brand['bins'] as $pattern) {
                if (preg_match($pattern, $number)) {
                    $detectedBrand = $brand;
                    break 2;
                }
            }
        }

        if (!$detectedBrand) {
            return [
                'brand' => 'unknown',
                'length_valid' => false,
                'luhn_valid' => false,
                'cvv_length' => 3,
            ];
        }

        $lengthValid = in_array(strlen($number), $detectedBrand['lengths']);
        $luhnValid = $detectedBrand['luhn'] ? $this->luhnCheck($number) : true;

        return [
            'brand' => $detectedBrand['brand'],
            'length_valid' => $lengthValid,
            'luhn_valid' => $luhnValid,
            'cvv_length' => $detectedBrand['cvv_length'],
        ];
    }

    protected function luhnCheck(string $number): bool
    {
        $sum = 0;
        $shouldDouble = false;
        for ($i = strlen($number) - 1; $i >= 0; $i--) {
            $digit = (int) $number[$i];
            if ($shouldDouble) {
                $digit *= 2;
                if ($digit > 9) $digit -= 9;
            }
            $sum += $digit;
            $shouldDouble = !$shouldDouble;
        }
        return $sum % 10 === 0;
    }

    protected function getCardBrands(): array
    {
        return [
            [
                'brand' => 'amex',
                'bins' => ['/^(34|37)/', '/^3[47]/'],
                'lengths' => [15],
                'cvv_length' => 4,
                'luhn' => true,
            ],
            [
                'brand' => 'diners',
                'bins' => ['/^(30[0-5]|36|38)/'],
                'lengths' => [14],
                'cvv_length' => 3,
                'luhn' => true,
            ],
            [
                'brand' => 'jcb',
                'bins' => ['/^(352[89]|35[3-8][0-9])/'],
                'lengths' => [16],
                'cvv_length' => 3,
                'luhn' => true,
            ],
            [
                'brand' => 'elo',
                'bins' => [
                    '/^(4011|4312|4389|4514|4576)/',
                    '/^(5041|5067|5090)/',
                    '/^(6277|6362|6363)/',
                    '/^(6504|6505|6509|6516|6550)/',
                ],
                'lengths' => [16],
                'cvv_length' => 3,
                'luhn' => true,
            ],
            [
                'brand' => 'hipercard',
                'bins' => ['/^(6062|3841)/'],
                'lengths' => [16],
                'cvv_length' => 3,
                'luhn' => true,
            ],
            [
                'brand' => 'cabal',
                'bins' => ['/^(6042)/'],
                'lengths' => [16],
                'cvv_length' => 3,
                'luhn' => true,
            ],
            [
                'brand' => 'banescard',
                'bins' => ['/^(6361)/'],
                'lengths' => [16],
                'cvv_length' => 3,
                'luhn' => true,
            ],
            [
                'brand' => 'discover',
                'bins' => [
                    '/^(6011|65|64[4-9])/',
                    '/^(622(12[6-9]|1[3-9]|[2-8][0-9]|9[0-1]|92[0-5]))/',
                ],
                'lengths' => [16],
                'cvv_length' => 3,
                'luhn' => true,
            ],
            [
                'brand' => 'mastercard',
                'bins' => [
                    '/^(5[1-5])/',
                    '/^(2(2[2-9][1-9]|[3-6][0-9]{2}|7([01][0-9]|20)))/',
                ],
                'lengths' => [16],
                'cvv_length' => 3,
                'luhn' => true,
            ],
            [
                'brand' => 'visa',
                'bins' => ['/^(4)/'],
                'lengths' => [13, 16, 19],
                'cvv_length' => 3,
                'luhn' => true,
            ],
        ];
    }
}
