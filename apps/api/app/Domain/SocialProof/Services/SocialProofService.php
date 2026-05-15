<?php

namespace App\Domain\SocialProof\Services;

use App\Models\Payment;
use App\Models\SocialProofConfig;

class SocialProofService
{
    public function resolve(int $checkoutExperienceId): array
    {
        $config = SocialProofConfig::where('checkout_experience_id', $checkoutExperienceId)
            ->where('enabled', true)
            ->first();

        if (!$config) return ['enabled' => false];

        $recentPurchases = Payment::whereHas('checkoutSession', fn($q) =>
            $q->where('checkout_experience_id', $checkoutExperienceId)
        )
        ->where('status', 'approved')
        ->where('approved_at', '>=', now()->subHours($config->lookback_hours))
        ->count();

        if ($recentPurchases < $config->min_data_threshold) return ['enabled' => false];

        return [
            'enabled' => true,
            'recentCount' => $recentPurchases,
            'lookbackHours' => $config->lookback_hours,
            'recentBuyers' => $this->getRecentBuyers($checkoutExperienceId, $config),
        ];
    }

    private function getRecentBuyers(int $checkoutId, SocialProofConfig $config): array
    {
        return Payment::whereHas('checkoutSession', fn($q) =>
            $q->where('checkout_experience_id', $checkoutId)
        )
        ->where('status', 'approved')
        ->orderByDesc('approved_at')
        ->limit(3)
        ->get()
        ->map(fn($p) => [
            'name' => $this->maskName($p->customer_name),
            'time_ago' => $p->approved_at->diffForHumans(),
        ])
        ->toArray();
    }

    private function maskName(?string $name): string
    {
        if (!$name) return 'Alguém';
        $parts = explode(' ', $name);
        return $parts[0] . (isset($parts[1]) ? ' ' . substr($parts[1], 0, 1) . '.' : '');
    }
}
