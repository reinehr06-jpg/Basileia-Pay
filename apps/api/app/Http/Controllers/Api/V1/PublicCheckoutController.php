<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\CheckoutSession;
use App\Models\Order;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class PublicCheckoutController extends Controller
{
    /**
     * Carrega a sessão para o front-end público (Next.js).
     */
    public function show($sessionToken)
    {
        $session = CheckoutSession::with(['connectedSystem.experiences'])
            ->where('uuid', $sessionToken)
            ->first();

        if (!$session || $session->status !== 'open') {
            return response()->json(['error' => 'Sessão inválida ou expirada'], 404);
        }

        // Recuperar design visual se houver
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
     * Processa o pagamento de uma sessão.
     */
    public function pay(Request $request, $sessionToken)
    {
        $requestId = $request->header('X-Request-Id', (string) Str::uuid());

        $session = CheckoutSession::with('order', 'connectedSystem.defaultGateway')
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
            return response()->json(['error' => 'Gateway não configurado para este sistema.'], 500);
        }

        DB::beginTransaction();
        try {
            // A Ordem já deve existir (P0.5 corrigido)
            $order = $session->order;

            if (!$order) {
                throw new \Exception("Ordem não encontrada para esta sessão.");
            }

            // 2. Chamar o Gateway (Mock/Simulação para a V1 P0)
            $gatewayResponse = [
                'transaction_id' => 'tx_' . Str::random(10),
                'status'         => 'pending',
                'pix_qrcode'     => '00020126580014br.gov.bcb.pix0136' . Str::uuid(),
                'pix_url'        => 'https://gateway.com/pix/' . Str::random(10)
            ];

            // 3. Criar o Payment
            $payment = Payment::create([
                'uuid'                   => (string) Str::uuid(),
                'order_id'               => $order->id,
                'checkout_session_id'    => $session->id,
                'gateway_account_id'     => $gatewayAccount->id,
                'gateway_transaction_id' => $gatewayResponse['transaction_id'],
                'method'                 => $method,
                'amount'                 => $order->amount,
                'status'                 => $gatewayResponse['status'],
                'pix_qrcode'             => $gatewayResponse['pix_qrcode'] ?? null,
                'pix_qrcode_url'         => $gatewayResponse['pix_url'] ?? null,
                'pix_expires_at'         => now()->addMinutes(30),
                'gateway_response'       => $gatewayResponse
            ]);

            // 4. Ajustar Status da Sessão (Fixes P0.6)
            // A sessão NÃO vira 'completed' se for PIX ou Boleto pendente.
            // Ela vira 'processing' aguardando o webhook.
            $session->update(['status' => 'processing']);

            DB::commit();

            return response()->json([
                'data' => [
                    'payment_id' => $payment->uuid,
                    'order_id'   => $order->uuid,
                    'status'     => $payment->status,
                    'method'     => $payment->method,
                    'pix'        => [
                        'qrcode'     => $payment->pix_qrcode,
                        'url'        => $payment->pix_qrcode_url,
                        'expires_at' => $payment->pix_expires_at->toIso8601String(),
                    ]
                ],
                'meta' => ['request_id' => $requestId],
                'error' => null
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'Falha ao processar pagamento: ' . $e->getMessage()], 500);
        }
    }
}
