<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\CheckoutSession;
use App\Models\Order;
use App\Models\Payment;
use App\Models\PaymentAttempt;
use App\Services\Gateways\GatewayFactory;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class PublicCheckoutController extends Controller
{
    /**
     * Carrega a sessão para o front-end público (Next.js).
     */
    public function show($sessionToken)
    {
        $session = CheckoutSession::with(['connectedSystem.experiences', 'gatewayAccount'])
            ->where('uuid', $sessionToken)
            ->first();

        if (!$session || $session->status !== 'open') {
            return response()->json(['error' => 'Sessão inválida ou expirada'], 404);
        }

        $experience = $session->experience()->first() 
            ?? $session->connectedSystem->experiences()->where('active', true)->first();

        return response()->json([
            'data' => [
                'session_id' => $session->uuid,
                'customer'   => $session->customer,
                'items'      => $session->items,
                'amount'     => $session->amount,
                'currency'   => $session->currency,
                'status'     => $session->status,
                'experience' => $session->resolved_config_json ?? ($experience ? $experience->config : null)
            ]
        ]);
    }

    /**
     * Processa o pagamento de uma sessão usando o GatewayFactory real.
     */
    public function pay(Request $request, $sessionToken, GatewayFactory $gatewayFactory)
    {
        $requestId = $request->header('X-Request-Id', (string) Str::uuid());

        $session = CheckoutSession::with(['order', 'connectedSystem.defaultGateway', 'gatewayAccount'])
            ->where('uuid', $sessionToken)
            ->first();

        if (!$session || !in_array($session->status, ['open', 'processing'])) {
            return response()->json(['error' => 'Sessão inválida ou já processada'], 400);
        }

        $validator = Validator::make($request->all(), [
            'method' => 'required|string|in:pix,credit_card,boleto',
            'card_token' => 'required_if:method,credit_card|string',
            'installments' => 'integer|min:1|max:12',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $method = $request->input('method');
        $gatewayAccount = $session->gatewayAccount ?? $session->connectedSystem->defaultGateway;

        if (!$gatewayAccount) {
            return response()->json(['error' => 'Gateway não configurado.'], 500);
        }

        $order = $session->order;
        
        DB::beginTransaction();
        try {
            // 1. Criar Payment
            $payment = Payment::create([
                'uuid'                => (string) Str::uuid(),
                'order_id'            => $order->id,
                'checkout_session_id' => $session->id,
                'gateway_account_id'  => $gatewayAccount->id,
                'method'              => $method,
                'amount'              => $order->amount,
                'status'              => 'pending',
            ]);

            // 2. Criar PaymentAttempt (Audit Trail)
            $attempt = PaymentAttempt::create([
                'payment_id'             => $payment->id,
                'gateway_account_id'     => $gatewayAccount->id,
                'method'                 => $method,
                'status'                 => 'initiated',
                'request_payload_masked' => ['method' => $method],
                'started_at'             => now(),
            ]);

            // 3. Resolver Provider e Processar
            $provider = $gatewayFactory->make($gatewayAccount);
            $gatewayResult = [];

            if ($method === 'pix') {
                $gatewayResult = $provider->generatePix($gatewayAccount, $order, $session->customer);
            } else {
                throw new \Exception("Método {$method} ainda não suportado no provedor real.");
            }

            // 4. Atualizar Payment e Attempt
            $payment->update([
                'gateway_transaction_id' => $gatewayResult['transaction_id'],
                'status'                 => $gatewayResult['status'],
                'pix_qrcode'             => $gatewayResult['pix_qrcode'] ?? null,
                'pix_qrcode_url'         => $gatewayResult['pix_url'] ?? null,
                'pix_expires_at'         => now()->addMinutes(30),
                'gateway_response'       => $gatewayResult['raw_response']
            ]);

            $attempt->update([
                'status'                  => 'success',
                'gateway_reference'       => $gatewayResult['transaction_id'],
                'response_payload_masked' => $gatewayResult['raw_response'],
                'finished_at'             => now(),
            ]);

            $session->update(['status' => 'processing']);

            DB::commit();

            return response()->json([
                'data' => [
                    'payment_id' => $payment->uuid,
                    'status'     => $payment->status,
                    'pix'        => [
                        'qrcode' => $payment->pix_qrcode,
                        'url'    => $payment->pix_qrcode_url,
                    ]
                ],
                'meta' => ['request_id' => $requestId]
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Pagamento falhou: " . $e->getMessage());
            return response()->json(['error' => 'Falha no processamento: ' . $e->getMessage()], 500);
        }
    }
}