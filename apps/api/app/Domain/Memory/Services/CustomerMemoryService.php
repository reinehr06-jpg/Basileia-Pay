<?php

namespace App\Domain\Memory\Services;

use App\Models\CustomerPaymentProfile;
use App\Models\Payment;
use Illuminate\Support\Str;

class CustomerMemoryService
{
    public function resolve(string $email, int $companyId, string $deviceFingerprint): array
    {
        $profile = CustomerPaymentProfile::firstOrCreate(
            ['company_id' => $companyId, 'customer_email' => $email],
            ['uuid' => Str::uuid()]
        );

        $isTrustedDevice = $this->isTrustedDevice($profile, $deviceFingerprint);
        $preferredMethod = $this->resolvePreferredMethod($profile);

        return [
            'profile'         => $profile,
            'isReturning'     => $profile->total_purchases > 0,
            'isTrustedDevice' => $isTrustedDevice,
            'preferredMethod' => $preferredMethod,
            'riskLevel'       => $profile->risk_level,
            'canPrefill'      => $profile->consent_memory && $isTrustedDevice,
            'prefillData'     => $profile->consent_memory ? ['name' => $profile->customer_name, 'email' => $profile->customer_email] : null,
        ];
    }

    public function recordPurchase(Payment $payment, string $deviceFingerprint): void
    {
        $profile = CustomerPaymentProfile::firstOrCreate([
            'company_id'     => $payment->company_id,
            'customer_email' => $payment->customer_email,
        ], ['uuid' => Str::uuid()]);

        $rates = $profile->method_success_rates ?? [];
        $method = $payment->method;

        $rates[$method] ??= ['attempts' => 0, 'success' => 0];
        $rates[$method]['attempts']++;

        if ($payment->status === 'approved') {
            $rates[$method]['success']++;
        }

        $devices = $profile->trusted_devices ?? [];
        if ($payment->status === 'approved') {
            $devices = $this->addTrustedDevice($devices, $deviceFingerprint);
        }

        $profile->update([
            'last_method_used'        => $method,
            'preferred_method'        => $this->recalculatePreferred($rates),
            'method_success_rates'    => $rates,
            'total_purchases'         => $profile->total_purchases + ($payment->status === 'approved' ? 1 : 0),
            'total_spent'             => $profile->total_spent + ($payment->status === 'approved' ? $payment->amount : 0),
            'last_purchase_at'        => $payment->status === 'approved' ? now() : $profile->last_purchase_at,
            'trusted_devices'         => $devices,
        ]);
    }

    private function resolvePreferredMethod(CustomerPaymentProfile $profile): string
    {
        if (!$profile->method_success_rates) return 'pix';

        $rates = collect($profile->method_success_rates)
            ->map(fn($data) => $data['attempts'] > 0 ? $data['success'] / $data['attempts'] : 0)
            ->sortDesc();

        return $rates->keys()->first() ?? 'pix';
    }

    private function recalculatePreferred(array $rates): string
    {
        return collect($rates)
            ->map(fn($data) => $data['attempts'] > 0 ? $data['success'] / $data['attempts'] : 0)
            ->sortDesc()
            ->keys()
            ->first() ?? 'pix';
    }

    private function isTrustedDevice(CustomerPaymentProfile $profile, string $fingerprint): bool
    {
        if (!$profile->trusted_devices) return false;
        return collect($profile->trusted_devices)->contains('fingerprint', $fingerprint);
    }

    private function addTrustedDevice(array $devices, string $fingerprint): array
    {
        $devices = collect($devices)->reject(fn($d) => $d['fingerprint'] === $fingerprint)->values()->toArray();
        array_unshift($devices, ['fingerprint' => $fingerprint, 'last_seen' => now()->toDateString(), 'type' => 'verified']);
        return array_slice($devices, 0, 5);
    }
}
