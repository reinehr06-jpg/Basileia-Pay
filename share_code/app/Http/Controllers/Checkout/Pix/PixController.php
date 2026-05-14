<?php

declare(strict_types=1);

namespace App\Http\Controllers\Checkout\Pix;

use App\Http\Controllers\Checkout\AbstractCheckoutController;
use App\Models\Subscription;
use App\Models\Transaction;
use App\Services\CheckoutService;
use App\Services\Payment\PixPaymentService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class PixController extends AbstractCheckoutController
{
    public function __construct(
        \App\Services\AsaasPaymentService $asaasService,
        \App\Services\WebhookNotifierService $webhookNotifier,
        private PixPaymentService $pixService,
    ) {
        parent::__construct($asaasService, $webhookNotifier);
    }

    public function process(string $uuid, Request $request): mixed
    {
        $resource = CheckoutService::findResource($uuid);
        $transaction = $resource instanceof Transaction ? $resource : null;

        if (!$transaction) {
            return response()->json(['error' => 'Transação não encontrada'], 404);
        }

        // [BUG-15] bloqueia empresa A acessando transação de empresa B
        if ($guard = $this->assertOwnership($transaction, $request)) {
            return $guard;
        }

        $request->validate([
            'customerData.name' => 'required|string|min:3',
            'customerData.email' => 'required|email',
            'customerData.document' => 'required|string',
        ]);

        try {
            $result = $this->pixService->charge(
                [
                    'amountBRL' => $request->input('amountBRL', $transaction->amount),
                    'description' => $request->input('description', $transaction->description),
                    'remoteIp' => $request->ip(),
                ],
                [
                    'name' => $request->input('customerData.name'),
                    'email' => $request->input('customerData.email'),
                    'document' => $request->input('customerData.document'),
                ]
            );

            $transaction->update([
                'asaas_payment_id' => $result['gatewayId'],
                'payment_method' => 'pix',
                'status' => 'pending',
            ]);

            return response()->json([
                'ok' => true,
                'status' => 'success',
                'paymentMethod' => 'pix',
                'qrCodeBase64' => $result['qrCodeBase64'],
                'qrCodePayload' => $result['qrCodePayload'],
                'expiresAt' => $result['expiresAt'],
                'gatewayId' => $result['gatewayId'],
            ]);
        } catch (\Throwable $e) {
            Log::error('PixController: erro', ['uuid' => $uuid, 'error' => $e->getMessage()]);
            return response()->json(['ok' => false, 'error' => $e->getMessage()], 400);
        }
    }

    protected function getPaymentMethod(): string
    {
        return 'pix';
    }
    protected function getPaymentService(): mixed
    {
        return $this->pixService;
    }
    protected function getViewName(): string
    {
        return 'checkout.pix.front.pagamento';
    }
    protected function getSuccessViewName(): string
    {
        return 'checkout.pix.front.sucesso';
    }
    protected function getSource(): string
    {
        return Transaction::SOURCE_CHECKOUT;
    }
    protected function getDefaultBillingType(): string
    {
        return 'PIX';
    }
    protected function needsPixData(): bool
    {
        return true;
    }

    protected function getFallbackView(
        Transaction|Subscription $transaction,
        array $asaasPayment,
        array $customerData,
        ?array $pixData,
        string $plano,
        string $ciclo,
        array $i18n,
        Request $request
    ): mixed {
        return view($this->getViewName(), compact(
            'transaction',
            'asaasPayment',
            'customerData',
            'pixData',
            'plano',
            'ciclo'
        ));
    }
}
