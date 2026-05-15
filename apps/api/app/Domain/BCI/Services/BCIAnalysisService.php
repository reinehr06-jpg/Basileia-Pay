<?php

namespace App\Domain\BCI\Services;

use App\Models\BciAnalysis;
use App\Models\BciRecommendation;
use App\Models\CheckoutExperienceVersion;
use App\Models\User;
use Illuminate\Support\Str;

class BCIAnalysisService
{
    public function request(CheckoutExperienceVersion $version, array $options = []): BciAnalysis
    {
        return BciAnalysis::create([
            'uuid'                     => Str::uuid(),
            'company_id'               => $version->company_id,
            'checkout_experience_id'   => $version->checkout_experience_id,
            'version_id'               => $version->id,
            'niche'                    => $options['niche'] ?? null,
            'ticket_range'             => $options['ticket_range'] ?? null,
            'status'                   => 'pending',
        ]);
    }

    public function applyRecommendation(BciRecommendation $rec, User $user): void
    {
        if (!$rec->auto_applicable) {
            throw new \Exception('Esta recomendação requer aplicação manual no Studio.');
        }

        $rec->update([
            'applied'    => true,
            'applied_at' => now(),
            'applied_by' => $user->id,
        ]);
    }
}
