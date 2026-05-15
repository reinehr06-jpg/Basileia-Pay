<?php

namespace App\Domain\FX\Services;

use App\Models\FxRate;
use App\Models\Payment;
use App\Models\CheckoutFxConfig;
use App\Models\PaymentFxRecord;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

class FxRateService
{
    public function getRate(string $from, string $to): FxRate
    {
        $cacheKey = "fx_rate_{$from}_{$to}";

        return Cache::remember($cacheKey, 3600, function () use ($from, $to) {
            $rate = 1.0;
            try {
                if ($from === 'BRL') {
                    $pair = "{$to}-{$from}";
                    $response = Http::timeout(5)->get("https://economia.awesomeapi.com.br/json/last/{$pair}");
                    $data = $response->json();
                    $key = strtoupper(str_replace('-', '', $pair));
                    $rate = 1 / floatval($data[$key]['bid'] ?? 1);
                }
            } catch (\Exception $e) {}

            return FxRate::create([
                'from_currency' => $from,
                'to_currency'   => $to,
                'rate'          => $rate,
                'source'        => 'awesomeapi',
                'fetched_at'    => now(),
                'valid_until'   => now()->addHour(),
            ]);
        });
    }

    public function lockRateForPayment(Payment $payment, CheckoutFxConfig $fxConfig, string $displayCurrency): PaymentFxRecord
    {
        $rate = $this->getRate($fxConfig->base_currency, $displayCurrency);
        $markup = 1 + ($fxConfig->rate_markup_percent / 100);
        $effectiveRate = $rate->rate * $markup;
        $displayAmount = intval($payment->amount / $effectiveRate);

        return PaymentFxRecord::create([
            'payment_id'       => $payment->id,
            'display_currency' => $displayCurrency,
            'display_amount'   => $displayAmount,
            'base_currency'    => $fxConfig->base_currency,
            'base_amount'      => $payment->amount,
            'fx_rate'          => $effectiveRate,
            'rate_source'      => $rate->source,
            'rate_markup'      => $fxConfig->rate_markup_percent,
            'locked_at'        => now(),
        ]);
    }
}
