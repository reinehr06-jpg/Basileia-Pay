<?php

namespace App\Http\Controllers\Api\V2;

use App\Http\Controllers\Controller;
use App\Models\CheckoutSession;
use App\Models\Order;
use App\Models\Payment;
use App\Models\PaymentAttempt;
use App\Services\Gateway\AsaasGateway;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class CheckoutController extends Controller
{
    /**
     * Carrega os dados do checkout para o frontend.
     */
    public function show(string $uuid): JsonResponse
    {
        $session = CheckoutSession::with(['connectedSystem.experiences', 'gatewayAccount'])
            ->where('uuid', $uuid)
            ->first();

        if (!$session || !in_array($session->status, ['open', 'processing'])) {
            return response()->json(['message' => 'Checkout não encontrado ou expirado'], 404);
        }

        // Recuperar design visual se houver
        $experience = $session->experience()->first() 
            ?? $session->connectedSystem->experiences()->where('active', true)->first();

        $order = $session->order;

        return response()->json([
            'uuid'           => $session->uuid,
            'status'         => $session->status,
            'amount'         => $session->amount,
            'currency'       => $session->currency,
            'description'    => $order?->external_order_id ?? 'Pagamento',
            'customer'       => $session->customer,
            'items'          => $session->items,
            'experience'     => $session->resolved_config_json ?? ($experience ? $experience->config : null),
            'created_at'     => $session->created_at,
        ]);
    }

    /**
     * Processa o pagamento.
     */
    public function process(Request $request, string $uuid): JsonResponse
    {
        $session = CheckoutSession::with(['order', 'connectedSystem.defaultGateway', 'gatewayAccount'])
            ->where('uuid', $uuid)
            ->first();

        if (!$session || !in_array($session->status, ['open', 'processing'])) {
            return response()->json(['message' => 'Checkout não encontrado ou expirado'], 400);
        }

        $data = $request->validate([
            'method'        => 'required|in:pix,creditcard,boleto',
            'name'          => 'required|string',
            'email'         => 'required|email',
            'document'      => 'nullable|string',
            'phone'         => 'nullable|string',
            // Cartão
            'card_number'   => 'required_if:method,creditcard',
            'card_holder'   => 'required_if:method,creditcard',
            'card_expiry'   => 'required_if:method,creditcard',
            'card_cvv'      => 'required_if:method,creditcard',
            'installments'  => 'nullable|integer|min:1|max:12',
        ]);

        $method = $data['method'] === 'creditcard' ? 'credit_card' : $data['method'];
        $gatewayAccount = $session->gatewayAccount ?? $session->connectedSystem->defaultGateway;

        if (!$gatewayAccount) {
            return response()->json(['message' => 'Gateway não configurado para este sistema.'], 500);
        }

        if ($gatewayAccount->gateway_type !== 'asaas') {
            return response()->json(['message' => 'Gateway não suportado.'], 500);
        }

        $order = $session->order;
        if (!$order) {
            return response()->json(['message' => 'Ordem não encontrada.'], 500);
        }

        DB::beginTransaction();
        try {
            // Criar Payment
            $payment = Payment::create([
                'uuid'                   => (string) Str::uuid(),
                'order_id'               => $order->id,
                'checkout_session_id'    => $session->id,
                'gateway_account_id'    => $gatewayAccount->id,
                'method'                 => $method,
                'amount'                 => $order->amount,
                'status'                 => 'pending',
            ]);

            // Criar PaymentAttempt
            $attempt = PaymentAttempt::create([
                'payment_id'             => $payment->id,
                'gateway_account_id'     => $gatewayAccount->id,
                'method'                 => $method,
                'status'                 => 'initiated',
                'request_payload_masked' => json_encode(['method' => $method, 'amount' => $order->amount]),
                'started_at'             => now(),
            ]);

            // Obter credenciais
            $credentials = $gatewayAccount->credentials ?? [];
            if (empty($credentials['api_key'])) {
                throw new \Exception("API key do gateway não configurada.");
            }

            $isSandbox = ($gatewayAccount->environment ?? 'production') === 'sandbox';
            $asaas = new AsaasGateway(
                $credentials['api_key'],
                $isSandbox ? AsaasGateway::URL_SANDBOX : AsaasGateway::URL_PRODUCTION
            );

            // Criar customer
            $customerId = '';
            try {
                $customerId = $asaas->createCustomer([
                    'name'     => $data['name'],
                    'email'    => $data['email'],
                    'document' => $data['document'] ?? '',
                    'phone'    => $data['phone'] ?? '',
                ]);
            } catch (\Exception $e) {
                Log::warning('Falha ao criar customer Asaas', ['error' => $e->getMessage()]);
            }

            // Processar conforme método
            $gatewayResult = null;

            if ($method === 'pix') {
                $gatewayResult = $asaas->chargeViaPix([
                    'amountBRL' => $order->amount / 100,
                    'description' => "Pedido " . ($order->external_order_id ?? $order->uuid),
                ], $customerId);
            } elseif ($method === 'credit_card') {
                $gatewayResult = $asaas->charge([
                    'amountBRL' => $order->amount / 100,
                    'description' => "Pedido " . ($order->external_order_id ?? $order->uuid),
                    'cardToken' => $data['card_number'],
                    'cardHolderName' => $data['card_holder'],
                    'cardExpiry' => $data['card_expiry'],
                    'cardCvv' => $data['card_cvv'],
                    'holder_email' => $data['email'],
                    'card_document' => $data['document'] ?? '',
                    'installments' => $data['installments'] ?? 1,
                ], $customerId);
            } elseif ($method === 'boleto') {
                $gatewayResult = $asaas->chargeViaBoleto([
                    'amountBRL' => $order->amount / 100,
                    'description' => "Pedido " . ($order->external_order_id ?? $order->uuid),
                ], $customerId);
            }

            // Atualizar Payment
            $payment->update([
                'gateway_transaction_id' => $gatewayResult['gatewayId'],
                'status'                 => $this->mapStatus($gatewayResult['status'] ?? 'PENDING'),
                'pix_qrcode'             => $gatewayResult['qrCodeBase64'] ?? null,
                'pix_qrcode_url'         => $gatewayResult['qrCodePayload'] ?? null,
                'boleto_url'             => $gatewayResult['bankSlipUrl'] ?? null,
                'boleto_barcode'         => $gatewayResult['barcode'] ?? null,
                'pix_expires_at'         => isset($gatewayResult['expiresAt']) 
                    ? \Carbon\Carbon::parse($gatewayResult['expiresAt']) 
                    : now()->addMinutes(30),
                'gateway_response'       => $gatewayResult['raw'] ?? $gatewayResult,
            ]);

            // Atualizar Attempt
            $attempt->update([
                'status'                 => 'processing',
                'gateway_reference'      => $gatewayResult['gatewayId'],
                'response_payload_masked' => json_encode($gatewayResult['raw'] ?? $gatewayResult),
            ]);

            // Atualizar sessão
            $session->update(['status' => 'processing']);

            DB::commit();

            // Retornar conforme método
            $response = [
                'uuid'      => $payment->uuid,
                'status'    => $payment->status,
                'method'    => $payment->method,
            ];

            if ($method === 'pix') {
                $response['pix'] = [
                    'qr_code'     => $payment->pix_qrcode,
                    'copy_paste'  => $payment->pix_qrcode_url,
                    'expires_at'  => $payment->pix_expires_at?->toIso8601String(),
                ];
            } elseif ($method === 'boleto') {
                $response['boleto'] = [
                    'url'     => $payment->boleto_url,
                    'barcode' => $payment->boleto_barcode,
                ];
            }

            return response()->json($response);

        } catch (\Exception $e) {
            DB::rollBack();

            if (isset($attempt)) {
                $attempt->update([
                    'status' => 'failed',
                    'error_code' => 'GATEWAY_ERROR',
                    'error_message' => $e->getMessage(),
                ]);
            }

            Log::error('Pagamento falhou', [
                'session_id' => $uuid,
                'error' => $e->getMessage(),
            ]);

            return response()->json(['message' => 'Falha ao processar pagamento: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Verifica o status do pagamento (polling).
     */
    public function status(string $uuid): JsonResponse
    {
        $session = CheckoutSession::with(['order.payments', 'order.payments.attempts'])
            ->where('uuid', $uuid)
            ->first();

        if (!$session) {
            return response()->json(['message' => 'Checkout não encontrado'], 404);
        }

        $payment = $session->order?->payments()->latest()->first();

        if (!$payment) {
            return response()->json([
                'status' => 'no_payment',
                'checkout_status' => $session->status,
            ]);
        }

        $payload = [
            'status' => $payment->status,
            'checkout_status' => $session->status,
            'method' => $payment->method,
        ];

        // Se PIX, retorna dados do QR
        if ($payment->method === 'pix') {
            $payload['pix'] = [
                'qr_code'   => $payment->pix_qrcode,
                'copy_paste' => $payment->pix_qrcode_url,
                'expires_at' => $payment->pix_expires_at?->toIso8601String(),
            ];
        } elseif ($payment->method === 'boleto') {
            $payload['boleto'] = [
                'url' => $payment->boleto_url,
                'barcode' => $payment->boleto_barcode,
            ];
        }

        return response()->json($payload);
    }

    /**
     * Retorna o recibo do pagamento.
     */
    public function receipt(string $uuid): JsonResponse
    {
        $session = CheckoutSession::with(['order', 'order.payments', 'connectedSystem'])
            ->where('uuid', $uuid)
            ->first();

        if (!$session) {
            return response()->json(['message' => 'Checkout não encontrado'], 404);
        }

        $payment = $session->order?->payments()->where('status', 'approved')->latest()->first();

        if (!$payment) {
            return response()->json(['message' => 'Pagamento não encontrado ou não aprovado.'], 422);
        }

        $order = $session->order;

        return response()->json([
            'uuid'           => $session->uuid,
            'status'         => $payment->status,
            'amount'         => $payment->amount,
            'currency'       => $session->currency,
            'payment_method' => $payment->method,
            'paid_at'        => $payment->paid_at?->toIso8601String(),
            'customer'       => [
                'name'     => $session->customer['name'] ?? $order?->customer['name'] ?? '',
                'email'    => $session->customer['email'] ?? $order?->customer['email'] ?? '',
                'document' => $session->customer['document'] ?? $order?->customer['document'] ?? '',
            ],
            'items'          => $session->items ?? $order?->items,
            'system'         => [
                'name' => $session->connectedSystem->name ?? 'Basileia',
            ],
        ]);
    }

    private function mapStatus(string $gatewayStatus): string
    {
        $mapping = [
            'PENDING' => 'pending',
            'CONFIRMED' => 'approved',
            'RECEIVED' => 'approved',
            'PROCESSING' => 'processing',
            'AUTHORIZED' => 'approved',
            'CANCELLED' => 'cancelled',
            'EXPIRED' => 'expired',
            'FAILED' => 'failed',
            'REFUNDED' => 'refunded',
        ];

        return $mapping[$gatewayStatus] ?? 'pending';
    }
}