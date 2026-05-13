<?php

declare(strict_types=1);

namespace App\Services;

use App\Services\Gateway\AsaasGateway;

class AsaasPaymentService
{
    private AsaasGateway $gateway;

    public function __construct()
    {
        // Gateway será resolvido por transação ou via forRequest() quando necessário.
    }

    public function gateway($resource = null): AsaasGateway
    {
        if ($resource) {
            return $this->forTransaction($resource);
        }

        try {
            return AsaasGateway::fromRequest();
        } catch (\Throwable $e) {
            // Se falhar o fromRequest (ex: checkout público), tentamos resolver pelo contexto da request
            $company = request()->attributes->get('company');
            if ($company) {
                $gateway = $company->defaultGateway();
                if ($gateway) {
                    return AsaasGateway::fromGatewayModel($gateway);
                }
            }

            throw new \RuntimeException('AsaasPaymentService: Não foi possível resolver o gateway. Contexto ausente.');
        }
    }

    public function forTransaction($transaction): AsaasGateway
    {
        if ($transaction->gateway) {
            return AsaasGateway::fromGatewayModel($transaction->gateway);
        }

        $gateway = $transaction->company?->defaultGateway();

        if (!$gateway) {
            throw new \RuntimeException('Gateway não configurado para esta empresa.');
        }

        return AsaasGateway::fromGatewayModel($gateway);
    }

    public function getPayment(string $paymentId, $transaction = null): ?array
    {
        return $this->gateway($transaction)->getPayment($paymentId);
    }

    public function getSubscription(string $subscriptionId, $transaction = null): ?array
    {
        return $this->gateway($transaction)->getSubscription($subscriptionId);
    }

    public function getPixQrCode(string $paymentId, $transaction = null): ?array
    {
        return $this->gateway($transaction)->getPixQrCode($paymentId);
    }

    public function cancelPayment(string $paymentId, $transaction = null): array
    {
        return $this->gateway($transaction)->cancelPayment($paymentId);
    }

    public function refundPayment(string $paymentId, ?float $amount = null, $transaction = null): array
    {
        return $this->gateway($transaction)->refundPayment($paymentId, $amount);
    }

    public function processCardPayment(string $id, array $cardData, ?string $remoteIp = null, $transaction = null): array
    {
        return $this->gateway($transaction)->payWithCard($id, $cardData, $remoteIp ?? request()->ip());
    }

    public function processCardTokenPayment(string $id, string $cardToken, $transaction = null): array
    {
        return $this->gateway($transaction)->processCardTokenPayment($id, $cardToken);
    }
}
