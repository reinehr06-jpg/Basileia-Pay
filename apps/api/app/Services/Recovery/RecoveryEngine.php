<?php

namespace App\Services\Recovery;

use App\Models\CheckoutSession;
use App\Models\RecoveryCampaign;
use App\Services\Notifications\NotificationDispatcher;
use Illuminate\Support\Facades\Log;

class RecoveryEngine
{
    protected $dispatcher;

    public function __construct(NotificationDispatcher $dispatcher)
    {
        $this->dispatcher = $dispatcher;
    }

    /**
     * Executa o processo de recuperação para sessões abandonadas.
     */
    public function run(): void
    {
        // Buscar sessões que estão 'opened' ou 'processing' e sem pagamento aprovado
        // e que foram criadas há mais de 15 minutos.
        $abandonedSessions = CheckoutSession::whereIn('status', ['opened', 'processing'])
            ->where('created_at', '<=', now()->subMinutes(15))
            ->whereDoesntHave('payments', function($query) {
                $query->whereIn('status', ['approved', 'paid']);
            })
            ->get();

        foreach ($abandonedSessions as $session) {
            $this->processSession($session);
        }
    }

    protected function processSession(CheckoutSession $session): void
    {
        $order = $session->order;
        if (!$order || !$order->customer_email) return;

        // Determinar qual régua aplicar baseado no tempo de abandono
        $minutesAbandoned = now()->diffInMinutes($session->created_at);

        $campaign = $this->resolveCampaign($session->company_id, $minutesAbandoned);

        if ($campaign) {
            $this->dispatcher->dispatch(
                $session->company_id,
                $session->id,
                $campaign->channel,
                'recovery',
                $campaign->channel === 'email' ? $order->customer_email : ($order->customer_phone ?? $order->customer_email),
                [
                    'customer_name' => $order->customer_name,
                    'amount'        => $order->amount,
                    'checkout_url'  => config('app.frontend_url') . '/pay/' . $session->session_token,
                    'campaign_name' => $campaign->name,
                ]
            );
        }
    }

    protected function resolveCampaign(int $companyId, int $minutes): ?RecoveryCampaign
    {
        // Busca a campanha ativa mais próxima do tempo de abandono
        return RecoveryCampaign::where('company_id', $companyId)
            ->where('status', 'active')
            ->where('delay_minutes', '<=', $minutes)
            ->orderBy('delay_minutes', 'desc')
            ->first();
    }
}
