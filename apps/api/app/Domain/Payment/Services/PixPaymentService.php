<?php

namespace App\Domain\Payment\Services;

use App\Models\CheckoutSession;
use App\Models\Customer;
use App\Models\Payment;
use App\Models\PaymentAttempt;
use App\Models\PixCharge;
use App\Domain\Gateway\Services\GatewayResolver;
use App\Domain\Payment\StateMachine\PaymentStateMachine;
use App\Integrations\Asaas\AsaasClient;
use App\Security\Encryption\EncryptionService;
use Illuminate\Support\Str;

class PixPaymentService
{
    public function __construct(
        private GatewayResolver $gatewayResolver,
        private PaymentStateMachine $stateMachine,
        private EncryptionService $encryption,
    ) {}

    public function process(CheckoutSession $session, Customer $customer): Payment
    {
        $company = $session->company;
        $gateway = $this->gatewayResolver->resolve($company, 'pix');

        $payment = Payment::create([
            'uuid'               => Str::uuid(),
            'company_id'         => $session->company_id,
            'order_id'           => $session->order_id,
            'gateway_account_id' => $gateway->id,
            'method'             => 'pix',
            'status'             => 'pending',
            'amount'             => $session->amount,
            'currency'           => $session->currency,
            'idempotency_key'    => $session->uuid . ':pix',
            'customer_id'        => $customer->id,
        ]);

        $attempt = PaymentAttempt::create([
            'uuid'               => Str::uuid(),
            'payment_id'         => $payment->id,
            'gateway_account_id' => $gateway->id,
            'method'             => 'pix',
            'status'             => 'processing',
        ]);

        $this->stateMachine->transition($payment, 'processing');

        $credentialsJson = $this->encryption->decrypt($gateway->credentials_encrypted);
        $credentials = json_decode($credentialsJson, true);

        // API key or access token
        $apiKey = $credentials['api_key'] ?? $credentials['access_token'] ?? null;
        if (!$apiKey) {
            throw new \RuntimeException('Gateway API key not found in credentials.');
        }
        $baseUrl = $gateway->environment === 'production' ? 'https://api.asaas.com/v3' : 'https://sandbox.asaas.com/api/v3';

        $client = new AsaasClient($apiKey, $baseUrl, $gateway->environment);

        $customerAsaasId = $this->ensureAsaasCustomer($customer, $client);

        $asaasPayment = $client->createPixCharge([
            'customer_asaas_id' => $customerAsaasId,
            'amount'            => $session->amount,
            'payment_uuid'      => $payment->uuid,
        ]);

        $qrCode = $client->getQrCode($asaasPayment['id']);

        PixCharge::create([
            'uuid'               => Str::uuid(),
            'payment_attempt_id' => $attempt->id,
            'gateway_pix_id'     => $asaasPayment['id'],
            'qr_code_base64'     => $qrCode['encodedImage'],
            'copy_paste_code'    => $qrCode['payload'],
            'expires_at'         => now()->addHour(),
            'status'             => 'pending',
        ]);

        $attempt->update([
            'gateway_attempt_id' => $asaasPayment['id'],
            'status'             => 'success',
            'response_masked'    => $this->maskResponse($asaasPayment),
        ]);

        return $payment;
    }

    private function ensureAsaasCustomer(Customer $customer, AsaasClient $client): string
    {
        // Simple implementation: assume metadata holds the external ID
        $metadata = $customer->metadata ?? [];
        if (isset($metadata['asaas_id'])) {
            return $metadata['asaas_id'];
        }

        $asaasCustomer = $client->createCustomer([
            'name'          => $customer->name,
            'document'      => $customer->document,
            'email'         => $customer->email,
            'phone'         => $customer->phone,
            'customer_uuid' => $customer->uuid,
        ]);

        $metadata['asaas_id'] = $asaasCustomer['id'];
        $customer->update(['metadata' => $metadata]);

        return $asaasCustomer['id'];
    }

    private function maskResponse(array $response): array
    {
        $mask = ['access_token', 'apiKey', 'token'];
        foreach ($mask as $field) {
            if (isset($response[$field])) $response[$field] = '[MASKED]';
        }
        return $response;
    }
}
