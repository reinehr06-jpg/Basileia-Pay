<?php

declare(strict_types=1);

namespace App\Http\Controllers\Checkout\Card;

use App\Http\Controllers\Checkout\AbstractCheckoutController;
use App\Helpers\PaymentStatusMapper;
use App\Models\Subscription;
use App\Models\Transaction;
use App\Services\CheckoutService;
use App\Services\Payment\CardPaymentService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class CardController extends AbstractCheckoutController
{
    public function __construct(
        \App\Services\AsaasPaymentService $asaasService,
        \App\Services\WebhookNotifierService $webhookNotifier,
        private CardPaymentService $cardService,
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
            'card_name' => 'required|string|min:3',
            'card_number' => 'required|string',
            'card_expiry' => 'required|string',
            'card_cvv' => 'required|string|min:3|max:4',
            'customer_name' => 'required|string|min:3',
            'email' => 'required|email',
            'customer_document' => 'required|string',
        ]);

        try {
            // Adapta os campos da view para o formato esperado pelo service/gateway
            $paymentData = [
                'amountBRL' => (float) $transaction->amount,
                'installments' => (int) $request->input('installments', 1),
                'description' => $transaction->description,
                'cardToken' => $request->input('card_number'),
                'cardHolderName' => $request->input('card_name'),
                'cardExpiry' => $request->input('card_expiry'),
                'cardCvv' => $request->input('card_cvv'),
                'remoteIp' => $request->ip(),
                'holder_email' => $request->input('email'),
                'card_document' => $request->input('customer_document'),
                'card_phone' => $transaction->customer_phone ?? '',
            ];

            $result = $this->cardService->charge(
                $paymentData,
                [
                    'name' => $request->input('customer_name'),
                    'email' => $request->input('email'),
                    'document' => $request->input('customer_document'),
                ]
            );

            $status = PaymentStatusMapper::mapStatus($result['status'] ?? '');
            $paidAt = PaymentStatusMapper::isPaid($result['status'] ?? '') ? now() : null;

            $transaction->update([
                'asaas_payment_id' => $result['gatewayId'],
                'payment_method' => 'credit_card',
                'status' => $status,
                'paid_at' => $paidAt,
                'gateway_response' => $result['raw'] ?? [],
            ]);

            $this->webhookNotifier->notify($transaction);

            return response()->json([
                'ok' => true,
                'status' => 'success',
                'gatewayId' => $result['gatewayId'],
                'redirectUrl' => route('checkout.card.success', ['uuid' => $uuid]),
            ]);
        } catch (\Throwable $e) {
            Log::error('CardController: erro', ['uuid' => $uuid, 'error' => $e->getMessage()]);
            return response()->json(['ok' => false, 'error' => $e->getMessage()], 400);
        }
    }

    protected function getPaymentMethod(): string
    {
        return 'credit_card';
    }
    protected function getPaymentService(): mixed
    {
        return $this->cardService;
    }
    protected function getViewName(): string
    {
        return 'checkout.card.front.pagamento';
    }
    protected function getSuccessViewName(): string
    {
        return 'checkout.card.front.sucesso';
    }
    protected function getSource(): string
    {
        return Transaction::SOURCE_CHECKOUT;
    }
    protected function getDefaultBillingType(): string
    {
        return 'CREDITCARD';
    }
    protected function needsPixData(): bool
    {
        return false;
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
            'plano',
            'ciclo'
        ));
    }
}
