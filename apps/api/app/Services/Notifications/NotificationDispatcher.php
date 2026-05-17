<?php

namespace App\Services\Notifications;

use App\Models\NotificationLog;
use Illuminate\Support\Facades\Log;

class NotificationDispatcher
{
    /**
     * Envia uma notificação multicanal.
     */
    public function dispatch(int $companyId, int $sessionId, string $channel, string $type, string $recipient, array $data): void
    {
        try {
            // Em um cenário real, aqui integraríamos com:
            // Email: Mail::send() ou SendGrid/Postmark
            // WhatsApp: Z-API ou Evolution API
            // SMS: Twilio ou TotalVoice
            
            Log::info("Dispatched [{$type}] via [{$channel}] to [{$recipient}]", $data);

            // Registrar log
            NotificationLog::create([
                'company_id' => $companyId,
                'checkout_session_id' => $sessionId,
                'channel' => $channel,
                'type' => $type,
                'recipient' => $recipient,
                'status' => 'sent',
                'sent_at' => now(),
            ]);

        } catch (\Exception $e) {
            Log::error("Failed to dispatch notification: " . $e->getMessage());
        }
    }
}
