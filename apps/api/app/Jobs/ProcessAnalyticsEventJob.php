<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;
use App\Models\CheckoutSessionAnalytics;
use App\Models\PaymentAnalytics;
use App\Models\AbandonmentEvent;
use App\Models\CheckoutScore;
use App\Models\GeographicRiskSignal;

class ProcessAnalyticsEventJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected array $payload;

    public function __construct(array $payload)
    {
        $this->payload = $payload;
    }

    public function handle(): void
    {
        $type = $this->payload['event_type'];

        DB::beginTransaction();
        try {
            match ($type) {
                'session_opened', 'method_selected' => $this->handleSessionEvent(),
                'payment_processed', 'payment_failed' => $this->handlePaymentEvent(),
                'abandonment' => $this->handleAbandonmentEvent(),
                default => null,
            };

            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    protected function handleSessionEvent(): void
    {
        CheckoutSessionAnalytics::create([
            'company_id'          => $this->payload['company_id'],
            'checkout_session_id' => $this->payload['session_id'],
            'event_type'          => $this->payload['event_type'],
            'device_type'         => $this->getDeviceType($this->payload['user_agent'] ?? ''),
            'browser'             => $this->payload['browser'] ?? null,
            'ip_address'          => $this->payload['ip_address'] ?? null,
            'metadata'            => $this->payload['metadata'] ?? [],
            'occurred_at'         => $this->payload['occurred_at'],
        ]);

        // Atualizar CheckoutScore (Contagem de sessões)
        if ($this->payload['event_type'] === 'session_opened') {
            $this->updateCheckoutScore($this->payload['company_id'], $this->payload['experience_id'] ?? 1);
        }
    }

    protected function handlePaymentEvent(): void
    {
        PaymentAnalytics::create([
            'company_id'  => $this->payload['company_id'],
            'payment_id'  => $this->payload['payment_id'],
            'method'      => $this->payload['method'],
            'status'      => $this->payload['status'],
            'amount'      => $this->payload['amount'],
            'latency_ms'  => $this->payload['latency_ms'] ?? null,
            'brand'       => $this->payload['brand'] ?? null,
            'occurred_at' => $this->payload['occurred_at'],
        ]);

        // Atualizar Risco Geográfico se houver falha
        if ($this->payload['status'] === 'failed') {
            $this->updateGeoRisk($this->payload['company_id'], $this->payload['geo'] ?? []);
        }
    }

    protected function handleAbandonmentEvent(): void
    {
        AbandonmentEvent::create([
            'company_id'          => $this->payload['company_id'],
            'checkout_session_id' => $this->payload['session_id'],
            'last_action'         => $this->payload['last_action'] ?? null,
            'time_spent_seconds'  => $this->payload['time_spent'] ?? 0,
            'abandoned_at'        => $this->payload['occurred_at'],
        ]);
    }

    protected function updateCheckoutScore(int $companyId, int $experienceId): void
    {
        $score = CheckoutScore::firstOrCreate([
            'company_id' => $companyId,
            'checkout_experience_id' => $experienceId,
            'version_number' => 1, // Padronizado para v1 por enquanto
        ]);

        $score->increment('total_sessions');
    }

    protected function updateGeoRisk(int $companyId, array $geo): void
    {
        if (empty($geo['country'])) return;

        $risk = GeographicRiskSignal::firstOrCreate([
            'company_id' => $companyId,
            'country'    => $geo['country'],
            'region'     => $geo['region'] ?? 'N/A',
            'city'       => $geo['city'] ?? 'N/A',
        ]);

        $risk->increment('total_failed');
        $risk->increment('total_attempts');
        
        // Recalcular índice de risco simples
        $risk->risk_index = ($risk->total_failed / max(1, $risk->total_attempts)) * 100;
        $risk->save();
    }

    protected function getDeviceType(string $userAgent): string
    {
        if (preg_match('/(tablet|ipad|playbook)|(android(?!.*(mobi|opera mini)))/i', $userAgent)) return 'tablet';
        if (preg_match('/(up.browser|up.link|mmp|symbian|smartphone|midp|wap|phone|android|iemobile)/i', $userAgent)) return 'mobile';
        return 'desktop';
    }
}
