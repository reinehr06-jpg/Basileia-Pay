<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;

class CardValidator
{
    private const CARD_BIN_PATTERNS = [
        'visa' => '/^4/',
        'mastercard' => '/^5[1-5]/',
        'amex' => '/^3[47]/',
        'discover' => '/^6(?:011|5)/',
        'elo' => '/^(?:401178|401179|431274|438935|451416|457393|457631|457632|504175|627780|636297|636368|650051|650052|650053|650405|651652|655000|655001)/',
        'hipercard' => '/^(?:606282|637095|637568)/',
    ];

    public function validate(string $cardNumber, ?string $cvv = null): array
    {
        $cleanedCard = $this->sanitize($cardNumber);

        if (empty($cleanedCard)) {
            return $this->error('Número do cartão inválido.');
        }

        if (!preg_match('/^\d{13,19}$/', $cleanedCard)) {
            return $this->error('Número do cartão deve ter entre 13 e 19 dígitos.');
        }

        if (!$this->luhnCheck($cleanedCard)) {
            return $this->error('Número do cartão inválido.');
        }

        $cardBrand = $this->detectBrand($cleanedCard);
        
        if ($cvv !== null) {
            $cvvLength = strlen($cvv);
            $expectedCvvLength = ($cardBrand === 'amex') ? 4 : 3;
            
            if ($cvvLength !== $expectedCvvLength) {
                return $this->error('Código de segurança inválido para o cartão.');
            }
        }

        return [
            'valid' => true,
            'brand' => $cardBrand,
            'sanitized_number' => $this->maskCard($cleanedCard),
        ];
    }

    public function sanitize(?string $cardNumber): ?string
    {
        if (empty($cardNumber)) {
            return null;
        }
        return preg_replace('/\D/', '', $cardNumber);
    }

    private function luhnCheck(string $cardNumber): bool
    {
        $digits = str_split($cardNumber);
        $sum = 0;
        $isSecond = false;

        for ($i = count($digits) - 1; $i >= 0; $i--) {
            $digit = (int) $digits[$i];

            if ($isSecond) {
                $digit *= 2;
                if ($digit > 9) {
                    $digit -= 9;
                }
            }

            $sum += $digit;
            $isSecond = !$isSecond;
        }

        return ($sum % 10) === 0;
    }

    private function detectBrand(string $cardNumber): string
    {
        foreach (self::CARD_BIN_PATTERNS as $brand => $pattern) {
            if (preg_match($pattern, $cardNumber)) {
                return $brand;
            }
        }
        return 'unknown';
    }

    private function maskCard(string $cardNumber): string
    {
        $length = strlen($cardNumber);
        $first6 = substr($cardNumber, 0, 6);
        $last4 = substr($cardNumber, -4);
        $maskedMiddle = str_repeat('*', $length - 10);
        
        return $first6 . $maskedMiddle . $last4;
    }

    private function error(string $message): array
    {
        Log::warning('Card validation failed', [
            'reason' => $message,
            'ip' => request()->ip() ?? 'unknown',
        ]);
        
        return [
            'valid' => false,
            'error' => $message,
        ];
    }

    public function validateExpiry(?string $month, ?string $year): bool
    {
        if ($month === null || $year === null) {
            return false;
        }

        $month = (int) $month;
        $year = (int) $year;

        if ($month < 1 || $month > 12) {
            return false;
        }

        if ($year < 2000) {
            $year += 2000;
        }

        $now = now();
        $expiry = now()->setDate($year, $month, 1)->endOfMonth();

        return $expiry->greaterThanOrEqualTo($now);
    }
}
