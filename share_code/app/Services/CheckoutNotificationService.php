<?php

namespace App\Services;

use App\Models\CheckoutApproval;
use App\Models\CheckoutConfig;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class CheckoutNotificationService
{
    public function onPublished(CheckoutConfig $config): void
    {
        $notif = $config->config['notifications'] ?? [];

        if (!empty($notif['webhook_enabled']) && !empty($notif['webhook_url'])) {
            $payload = [
                'event'        => 'checkout.published',
                'config_id'    => $config->id,
                'config_name'  => $config->name,
                'company_id'   => $config->company_id,
                'published_at' => now()->toISOString(),
            ];
            $signature = hash_hmac('sha256', json_encode($payload), $notif['webhook_secret'] ?? '');

            try {
                Http::timeout(5)->withHeaders(['X-Basileia-Signature' => $signature])
                    ->post($notif['webhook_url'], $payload);
            } catch (\Throwable $e) {
                Log::warning('Webhook checkout.published failed', ['url' => $notif['webhook_url'], 'error' => $e->getMessage()]);
            }
        }

        if (!empty($notif['email_enabled']) && !empty($notif['email_recipients'])) {
            $emails = array_filter(array_map('trim', explode("\n", $notif['email_recipients'])));
            foreach ($emails as $email) {
                try {
                    Mail::raw(
                        "O checkout \"{$config->name}\" foi publicado em " . now()->format('d/m/Y H:i') . ".",
                        fn($m) => $m->to($email)->subject("Checkout publicado: {$config->name}")
                    );
                } catch (\Throwable $e) {
                    Log::warning('Email checkout.published failed', ['email' => $email, 'error' => $e->getMessage()]);
                }
            }
        }
    }

    public function onApprovalRequested(CheckoutApproval $approval): void
    {
        Log::info('CheckoutApproval.requested', ['approval_id' => $approval->id]);
    }

    public function onApprovalReviewed(CheckoutApproval $approval): void
    {
        Log::info('CheckoutApproval.reviewed', [
            'approval_id' => $approval->id,
            'status'      => $approval->status,
        ]);
    }
}
