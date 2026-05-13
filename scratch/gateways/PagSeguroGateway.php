<?php

namespace App\Services\Gateway;

use Illuminate\Http\Request;

class PagSeguroGateway implements GatewayInterface
{
    private string $apiToken;

    public function __construct()
    {
        $this->apiToken = config('services.pagseguro.token');
    }

    public function createCustomer(array $data): array
    {
        return ['id' => 'pag_' . uniqid()];
    }

    public function createPayment(array $data): array
    {
        return ['id' => 'order_' . uniqid(), 'status' => 'PAID'];
    }

    public function createSubscription(array $data): array
    {
        return ['id' => 'pre_' . uniqid()];
    }

    public function getPayment(string $paymentId): array
    {
        return ['id' => $paymentId, 'status' => 'PAID'];
    }

    public function cancelPayment(string $paymentId): array
    {
        return ['id' => $paymentId, 'status' => 'CANCELLED'];
    }

    public function refundPayment(string $paymentId, ?float $amount = null): array
    {
        return ['id' => 'ref_' . uniqid(), 'status' => 'REFUNDED'];
    }

    public function generatePix(array $data): array
    {
        return $this->createPayment($data);
    }

    public function generateBoleto(array $data): array
    {
        return $this->createPayment($data);
    }

    public function processWebhook(Request $request): array
    {
        return ['event' => $request->input('event'), 'raw' => $request->all()];
    }

    public function createSplit(array $data): array
    {
        return [];
    }
}
