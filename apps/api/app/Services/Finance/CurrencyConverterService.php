<?php

namespace App\Services\Finance;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

class CurrencyConverterService
{
    protected $baseCurrency = 'BRL';

    /**
     * Converte um valor entre moedas.
     */
    public function convert(int $amountInCents, string $from, string $to): int
    {
        if ($from === $to) return $amountInCents;

        $rate = $this->getRate($from, $to);
        
        return (int) round($amountInCents * $rate);
    }

    /**
     * Obtém a taxa de câmbio (com cache de 1 hora).
     */
    public function getRate(string $from, string $to): float
    {
        $cacheKey = "fx_rate_{$from}_{$to}";

        return Cache::remember($cacheKey, now()->addHour(), function() use ($from, $to) {
            // Em um cenário real, usaríamos a API da ExchangeRate-API ou similar
            // Por enquanto, usamos taxas fixas simuladas
            $rates = [
                'USD_BRL' => 5.20,
                'BRL_USD' => 0.19,
                'EUR_BRL' => 5.60,
                'BRL_EUR' => 0.18,
            ];

            return $rates["{$from}_{$to}"] ?? 1.0;
        });
    }

    /**
     * Detecta a moeda sugerida baseada no IP (GeoIP).
     */
    public function suggestCurrencyByIp(string $ip): string
    {
        // Mock de detecção por IP
        if (str_starts_with($ip, '104.')) return 'USD';
        if (str_starts_with($ip, '45.')) return 'EUR';
        
        return 'BRL';
    }
}
