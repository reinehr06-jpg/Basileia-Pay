<?php

namespace App\Jobs;

use App\Models\CheckoutSession;
use App\Models\CheckoutRecovery;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Mail;
// use App\Mail\CheckoutRecoveryMail; // Implement mail later if needed

class SendRecoveryEmailJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $queue = 'notifications';

    public function __construct(public int $sessionId)
    {}

    public function handle(): void
    {
        $session = CheckoutSession::findOrFail($this->sessionId);

        if (in_array($session->status, ['paid', 'expired'])) return;
        if ($session->recovery_email_sent_at) return;

        $rawToken = bin2hex(random_bytes(32));

        CheckoutRecovery::create([
            'uuid'                => Str::uuid(),
            'checkout_session_id' => $session->id,
            'company_id'          => $session->company_id,
            'recovery_token'      => $rawToken,
            'abandoned_at'        => $session->abandoned_at,
            'expires_at'          => now()->addHours(48),
        ]);

        $session->update([
            'recovery_token'         => $rawToken,
            'recovery_email_sent_at' => now(),
        ]);

        $recoveryUrl = config('app.checkout_url') . '/pay/' . $session->session_token . '?recover=' . $rawToken;

        // Mock mail sending for now, or just log
        \Illuminate\Support\Facades\Log::info("E-mail de recuperação simulado para {$session->customer->email}: {$recoveryUrl}");
        
        // Mail::to($session->customer->email)
        //     ->send(new CheckoutRecoveryMail($session, $recoveryUrl));
    }
}
