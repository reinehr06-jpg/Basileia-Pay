<?php

namespace App\Services\Studio;

use App\Models\CheckoutExperience;

class CheckoutPreviewService
{
    public function generatePreview(CheckoutExperience $experience, string $device = 'desktop'): array
    {
        $config = $experience->config ?? [];
        $viewport = match ($device) {
            'mobile' => ['width' => 375, 'height' => 812],
            'tablet' => ['width' => 768, 'height' => 1024],
            default  => ['width' => 1440, 'height' => 900],
        };

        return [
            'experience_id' => $experience->id,
            'uuid'          => $experience->uuid,
            'name'          => $experience->name,
            'status'        => $experience->status,
            'device'        => $device,
            'viewport'      => $viewport,
            'config'        => $config,
            'is_draft'      => $experience->status !== 'published',
            'preview_token' => md5($experience->uuid . $device . now()->format('YmdH')),
            'generated_at'  => now()->toISOString(),
        ];
    }

    public function getPreviewUrl(CheckoutExperience $experience, string $device = 'desktop'): string
    {
        $baseUrl = config('app.checkout_url', 'http://localhost:3000');
        $token = md5($experience->uuid . 'preview' . now()->format('Ymd'));
        return "{$baseUrl}/preview/{$experience->uuid}?device={$device}&token={$token}";
    }
}
