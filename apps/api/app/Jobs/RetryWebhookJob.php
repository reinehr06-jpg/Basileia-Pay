<?php

namespace App\Jobs;

use App\Models\WebhookDelivery;
use App\Services\WebhookService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class RetryWebhookJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 1;
    public int $timeout = 30;

    public function __construct(
        public int $deliveryId,
        public int $attempt = 1
    ) {
        $this->onQueue('webhooks');
    }

    public function backoff(): array
    {
        return [60, 300, 900, 3600, 14400];
    }

    public function handle(WebhookService $webhookService): void
    {
        $delivery = WebhookDelivery::find($this->deliveryId);

        if (!$delivery) {
            return;
        }

        if ($delivery->status === 'delivered') {
            return;
        }

        if ($this->attempt > ($delivery->max_attempts ?? 5)) {
            $delivery->update(['status' => 'failed']);

            return;
        }

        $delivery->update([
            'status' => 'retrying',
            'attempts' => $this->attempt,
        ]);

        $webhookService->deliver($delivery);

        if ($delivery->fresh()->status !== 'delivered') {
            $delay = $this->backoff()[$this->attempt - 1] ?? 14400;

            self::dispatch($this->deliveryId, $this->attempt + 1)
                ->delay(now()->addSeconds($delay));
        }
    }
}
