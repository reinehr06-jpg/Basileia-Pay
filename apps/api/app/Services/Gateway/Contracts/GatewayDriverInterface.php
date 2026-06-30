<?php

namespace App\Services\Gateway\Contracts;

use App\Services\Gateway\DTO\ChargeRequest;
use App\Services\Gateway\DTO\ChargeResponse;
use App\Services\Gateway\DTO\NormalizedEvent;

interface GatewayDriverInterface
{
    public function createCharge(ChargeRequest $request): ChargeResponse;
    public function parseWebhookEvent(array $payload): NormalizedEvent;
    public function verifySignature(string $rawBody, string $signature, string $secret): bool;
}
