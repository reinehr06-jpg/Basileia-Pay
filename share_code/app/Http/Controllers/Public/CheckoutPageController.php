<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use App\Services\CardValidator;
use App\Services\PaymentService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\RateLimiter;

class CheckoutPageController extends Controller
{
    private const ALLOWED_PAYMENT_METHODS = ['pix', 'boleto', 'credit_card', 'debit_card'];
    private const IDEMPOTENCY_KEY_PREFIX = 'checkout_payment_';

    public function __construct(
        private PaymentService $paymentService,
        private CardValidator $cardValidator
    ) {
    }

    public function show(string $uuid, Request $request)
    {
        $transaction = Transaction::where('uuid', $uuid)
            ->where('status', 'pending')
            ->with(['customer', 'items', 'integration', 'integration.company'])
            ->first();

        if (!$transaction) {
            return $this->errorResponse('Pagamento não encontrado ou já processado.');
        }

        if (!$transaction->integration || $transaction->integration->status !== 'active') {
            Log::warning('Checkout access denied: integration inactive', [
                'transaction_id' => $transaction->id,
                'uuid' => $uuid,
            ]);
            return $this->errorResponse('Pagamento temporariamente indisponível.');
        }

        if ($transaction->expires_at && now()->greaterThan($transaction->expires_at)) {
            Log::warning('Checkout access denied: transaction expired', [
                'transaction_id' => $transaction->id,
                'uuid' => $uuid,
            ]);
            return $this->errorResponse('Link de pagamento expirado.');
        }

        $requestedMethod = $request->get('method');

        if ($requestedMethod && in_array(strtolower($requestedMethod), self::ALLOWED_PAYMENT_METHODS)) {
            $paymentMethod = strtolower($requestedMethod);
        } else {
            $paymentMethod = $transaction->payment_method;
        }

        if (!in_array($paymentMethod, self::ALLOWED_PAYMENT_METHODS)) {
            $paymentMethod = 'pix';
        }

        $installments = $transaction->installments ?? 1;

        return view('checkout.index', compact('transaction', 'paymentMethod', 'installments'));
    }

    public function process(Request $request, string $uuid)
    {
        $transaction = Transaction::where('uuid', $uuid)
            ->where('status', 'pending')
            ->with('integration', 'integration.company')
            ->first();

        if (!$transaction) {
            return back()->withErrors([
                'payment' => 'Transação não encontrada ou já processada.',
            ]);
        }

        if (!$transaction->integration || $transaction->integration->status !== 'active') {
            Log::warning('Payment attempt denied: integration inactive', [
                'transaction_id' => $transaction->id,
                'uuid' => $uuid,
            ]);
            return back()->withErrors([
                'payment' => 'Pagamento temporariamente indisponível.',
            ]);
        }

        $idempotencyKey = self::IDEMPOTENCY_KEY_PREFIX . $transaction->id;
        if (
            RateLimiter::attempt($idempotencyKey, 1, function () use ($transaction) {
                return $transaction->payments()->count() > 0;
            }, 300)
        ) {
            Log::warning('Duplicate payment attempt blocked', [
                'transaction_id' => $transaction->id,
                'uuid' => $uuid,
                'ip' => $request->ip(),
            ]);
            return back()->withErrors([
                'payment' => 'Pagamento já processado. Verifique o status da transação.',
            ]);
        }

        $paymentMethod = $request->input('payment_method');

        if (!in_array($paymentMethod, self::ALLOWED_PAYMENT_METHODS)) {
            return back()->withErrors([
                'payment' => 'Método de pagamento inválido.',
            ]);
        }

        $rules = [
            'payment_method' => 'required|in:' . implode(',', self::ALLOWED_PAYMENT_METHODS),
        ];

        if (in_array($paymentMethod, ['credit_card', 'debit_card'])) {
            $rules = array_merge($rules, [
                'card_number' => 'required|string|min:13|max:19',
                'card_holder_name' => 'required|string|max:255|min:3',
                'card_expiry_month' => 'required|integer|min:1|max:12',
                'card_expiry_year' => 'required|integer|min:' . date('Y'),
                'card_cvv' => 'required|string|min:3|max:4',
                'installments' => 'sometimes|integer|min:1|max:12',
            ]);
        }

        $request->validate($rules);

        if (in_array($paymentMethod, ['credit_card', 'debit_card'])) {
            $sanitizedCardNumber = $this->cardValidator->sanitize($request->input('card_number'));

            $cardValidation = $this->cardValidator->validate(
                $sanitizedCardNumber,
                $request->input('card_cvv')
            );

            if (!$cardValidation['valid']) {
                Log::warning('Card validation failed', [
                    'transaction_id' => $transaction->id,
                    'ip' => $request->ip(),
                    'reason' => $cardValidation['error'],
                ]);
                return back()->withErrors([
                    'payment' => 'Dados do cartão inválidos. Verifique e tente novamente.',
                ]);
            }

            if (
                !$this->cardValidator->validateExpiry(
                    $request->input('card_expiry_month'),
                    $request->input('card_expiry_year')
                )
            ) {
                return back()->withErrors([
                    'payment' => 'Cartão expirado. Utilize um cartão válido.',
                ]);
            }
        }

        try {
            $paymentData = [
                'transaction_uuid' => $transaction->uuid,
                'payment_method' => $paymentMethod,
            ];

            if (in_array($paymentMethod, ['credit_card', 'debit_card'])) {
                $paymentData['card'] = [
                    'number' => $sanitizedCardNumber,
                    'holder_name' => strip_tags($request->input('card_holder_name')),
                    'expiry_month' => $request->input('card_expiry_month'),
                    'expiry_year' => $request->input('card_expiry_year'),
                    'cvv' => $request->input('card_cvv'),
                    'installments' => $request->input('installments', 1),
                ];
            }

            $paymentData['ip'] = $request->ip();
            $paymentData['user_agent'] = $request->userAgent();

            Log::info('Payment initiated', [
                'transaction_id' => $transaction->id,
                'uuid' => $uuid,
                'amount' => $transaction->amount,
                'payment_method' => $paymentMethod,
                'card_brand' => $cardValidation['brand'] ?? null,
            ]);

            $this->paymentService->process($paymentData, $transaction->integration);

            return redirect()->route('checkout.success', ['uuid' => $transaction->uuid]);
        } catch (\Exception $e) {
            Log::error('Payment processing failed', [
                'transaction_id' => $transaction->id,
                'uuid' => $uuid,
                'error' => $e->getMessage(),
                'ip' => $request->ip(),
            ]);

            RateLimiter::clear($idempotencyKey);

            return back()->withErrors([
                'payment' => 'Erro ao processar pagamento. Tente novamente em alguns minutos.',
            ])->withInput();
        }
    }

    public function success(string $uuid)
    {
        $transaction = Transaction::where('uuid', $uuid)
            ->with(['customer', 'payments'])
            ->first();

        if (!$transaction) {
            return $this->errorResponse('Transação não encontrada.');
        }

        return view('checkout.card.front.sucesso', compact('transaction'));
    }

    private function errorResponse(string $message)
    {
        if (request()->expectsJson() || request()->is('api/*')) {
            return response()->json(['error' => $message], 403);
        }

        return view('checkout.error', ['message' => $message]);
    }
}
