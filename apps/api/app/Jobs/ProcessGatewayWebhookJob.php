<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use App\Models\GatewayWebhookEvent;
use App\Services\Webhooks\GatewayWebhookHandler;

class ProcessGatewayWebhookJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(public GatewayWebhookEvent $event)
    {
    }

    public function handle(GatewayWebhookHandler $handler): void
    {
        // Don't process if it's already marked as processed
        if ($this->event->status === 'processed') {
            return;
        }

        $handler->handle($this->event);
    }
}