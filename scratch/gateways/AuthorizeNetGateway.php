<?php

namespace App\Services\Gateway;

use Illuminate\Http\Request;

class AuthorizeNetGateway implements GatewayInterface
{
    public function createCustomer(array $data): array { return ['id' => 'GEN_' . uniqid()]; }
    public function createPayment(array $data): array { return ['id' => 'PAY_' . uniqid(), 'status' => 'PENDING']; }
    public function createSubscription(array $data): array { return ['id' => 'SUB_' . uniqid()]; }
    public function getPayment(string $paymentId): array { return ['id' => $paymentId, 'status' => 'COMPLETED']; }
    public function cancelPayment(string $paymentId): array { return ['id' => $paymentId, 'status' => 'VOIDED']; }
    public function refundPayment(string $paymentId, ?float $amount = null): array { return ['id' => 'REF_' . uniqid()]; }
    public function generatePix(array $data): array { return $this->createPayment($data); }
    public function generateBoleto(array $data): array { return $this->createPayment($data); }
    public function processWebhook(Request $request): array { return $request->all(); }
    public function createSplit(array $data): array { return []; }
}
