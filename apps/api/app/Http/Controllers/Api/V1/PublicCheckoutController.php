<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\CheckoutSession;
use App\Models\Order;
use App\Models\Payment;
use App\Models\PaymentAttempt;
use App\Services\Gateways\GatewayFactory;
use App\Services\Security\IdempotencyService;
use App\Services\Security\SensitiveDataMasker;
use App\Services\Memory\MemoryResolverService;
use App\Services\Adaptive\AdaptiveEngine;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class PublicCheckoutController extends Controller
{
    protected $collector;
    protected $masker;
    protected $memory;
    protected $adaptive;

    public function __construct(
        \App\Services\Analytics\EventCollector $collector,
        SensitiveDataMasker $masker,
        MemoryResolverService $memory,
        AdaptiveEngine $adaptive
    ) {
        $this->collector = $collector;
        $this->masker = $masker;
        $this->memory = $memory;
        $this->adaptive = $adaptive;
    }

    /**
     * Carrega a sessão para o front-end público (Next.js).
     */
    public function show($sessionToken)
    {
        // Regra Fase 2: Buscar exclusivamente por session_token
        $session = CheckoutSession::with(['connectedSystem.experiences', 'gatewayAccount', 'order'])
            ->where('session_token', $sessionToken)
            ->first();

        if (!$session) {
            return response()->json([
                'success' => false,
                'error' => [
                    'code' => 'session_not_found',
                    'message' => 'Link de checkout inválido ou expirado.'
                ]
            ], 404);
        }

        if ($session->status === 'expired') {
            return response()->json([
                'success' => false,
                'error' => [
                    'code' => 'session_expired',
                    'message' => 'Este link de checkout já expirou.'
                ]
            ], 410);
        }

        $experience = $session->experience()->first() 
            ?? $session->connectedSystem->experiences()->where('active', true)->first();

        // Analytics: Sessão aberta
        $this->collector->collect('session_opened', [
            'company_id' => $session->company_id,
            'session_id' => $session->id,
            'experience_id' => $session->checkout_experience_id,
        ]);

        return response()->json([
            'success' => true,
            'data' => [
                'session_id' => $session->uuid,
                'session_token' => $session->session_token,
                'customer'   => $session->customer,
                'items'      => $session->items,
                'amount'     => $session->amount,
                'currency'   => $session->currency,
                'status'     => $session->status,
                'experience' => $session->resolved_config_json ?? ($experience ? $experience->config : null),
                'order'      => [
                    'uuid' => $session->order->uuid,
                    'status' => $session->order->status
                ],
                'branding'   => [
                    'system_name' => $session->connectedSystem->name,
                    'system_logo' => $session->connectedSystem->logo_url,
                    'company_name' => $session->connectedSystem->company->name,
                    'company_logo' => $session->connectedSystem->company->logo_url,
                ]
            ]
        ]);
    }

    /**
     * Processa o pagamento de uma sessão com Idempotência.
     */
    public function pay(Request $request, $sessionToken, GatewayFactory $gatewayFactory, IdempotencyService $idempotency)
    {
        $requestId = $request->header('X-Request-Id', (string) Str::uuid());
        $idempotencyKey = $request->header('Idempotency-Key');

        $session = CheckoutSession::with(['order', 'connectedSystem.defaultGateway', 'gatewayAccount'])
            ->where('session_token', $sessionToken)
            ->first();

        if (!$session || !in_array($session->status, ['open', 'processing', 'failed'])) {
            return response()->json(['error' => 'Sessão inválida ou já finalizada'], 400);
        }

        // Check Idempotency
        if ($idempotencyKey) {
            $cached = $idempotency->check($session->company_id, $idempotencyKey, $request->all());
            if ($cached) return $cached;
        }

        $validator = Validator::make($request->all(), [
            'method' => 'required|string|in:pix,card,boleto',
            'customer' => 'required|array',
            'customer.name' => 'required|string',
            'customer.email' => 'required|email',
            'customer.document' => 'required|string',
            'card' => 'required_if:method,card|array',
            'card.number' => 'required_if:method,card|string',
            'card.holder_name' => 'required_if:method,card|string',
            'card.expiration_month' => 'required_if:method,card|string',
            'card.expiration_year' => 'required_if:method,card|string',
            'card.cvv' => 'required_if:method,card|string',
            'card.installments' => 'integer|min:1|max:12',
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
                'company_id'          => $session->company_id,
                'order_id'            => $order->id,
                'checkout_session_id' => $session->id,
                'gateway_account_id'  => $gatewayAccount->id,
                'method'              => $method,
                'amount'              => $order->amount,
                'status'              => 'pending',
            ]);

            // 2. Criar PaymentAttempt
            $attempt = PaymentAttempt::create([
                'payment_id'             => $payment->id,
                'company_id'             => $session->company_id,
                'gateway_account_id'     => $gatewayAccount->id,
                'method'                 => $method,
                'status'                 => 'initiated',
                'request_payload_masked' => $this->masker->maskArray($request->all()),
                'started_at'             => now(),
            ]);

            // 3. Processar via Gateway
            $provider = $gatewayFactory->make($gatewayAccount);
            $gatewayResult = [];

            if ($method === 'pix') {
                $gatewayResult = $provider->generatePix($gatewayAccount, $order, $request->input('customer'));
            } elseif ($method === 'card') {
                $gatewayResult = $provider->processCard($gatewayAccount, $order, $request->input('customer'), $request->input('card'));
            } elseif ($method === 'boleto') {
                $gatewayResult = $provider->generateBoleto($gatewayAccount, $order, $request->input('customer'));
            }

            // 4. Atualizar estados
            $payment->update([
                'gateway_payment_id' => $gatewayResult['transaction_id'] ?? null,
                'status'                 => $gatewayResult['status'] ?? 'failed',
                'pix_qrcode'             => $gatewayResult['pix_qrcode'] ?? null,
                'pix_qrcode_url'         => $gatewayResult['pix_url'] ?? null,
                'pix_expires_at'         => $method === 'pix' ? now()->addMinutes(30) : null,
                'boleto_url'             => $gatewayResult['boleto_url'] ?? null,
                'boleto_barcode'         => $gatewayResult['boleto_barcode'] ?? null,
                'gateway_response'       => $gatewayResult['raw_response'] ?? null
            ]);

            $attempt->update([
                'status'                  => ($gatewayResult['status'] ?? 'failed') === 'failed' ? 'failed' : 'success',
                'gateway_payment_id'      => $gatewayResult['transaction_id'] ?? null,
                'response_payload_masked' => $this->masker->maskArray($gatewayResult['raw_response'] ?? []),
                'finished_at'             => now(),
            ]);

            if ($payment->status === 'approved' || $payment->status === 'paid') {
                $session->update(['status' => 'paid']);
                $order->update(['status' => 'paid']);
            } else {
                $session->update(['status' => 'processing']);
            }

            DB::commit();

            $response = response()->json([
                'success' => true,
                'data' => [
                    'payment_id' => $payment->uuid,
                    'status'     => $payment->status,
                    'method'     => $method,
                    'pix'        => $method === 'pix' ? [
                        'qrcode' => $payment->pix_qrcode,
                        'url'    => $payment->pix_qrcode_url,
                        'expires_at' => $payment->pix_expires_at
                    ] : null,
                    'boleto'     => $method === 'boleto' ? [
                        'url' => $payment->boleto_url,
                        'barcode' => $payment->boleto_barcode
                    ] : null,
                    'card'       => $method === 'card' ? [
                        'brand' => $gatewayResult['brand'] ?? null,
                        'last4' => $gatewayResult['last4'] ?? null
                    ] : null
                ],
                'meta' => ['request_id' => $requestId]
            ]);

            // Salvar resposta para idempotência
            if ($idempotencyKey) {
                $idempotency->save($session->company_id, $idempotencyKey, $response);
            }

            // 5. Memory: Aprender com o comprador
            if ($payment->status === 'approved' || $payment->status === 'paid') {
                $this->memory->learn($session->company_id, $order->customer_email, [
                    'method'     => $method,
                    'card_brand' => $gatewayResult['brand'] ?? null,
                ]);
            }

            // Analytics: Pagamento Processado
            $this->collector->collect($payment->status === 'approved' ? 'payment_processed' : 'payment_failed', [
                'company_id' => $session->company_id,
                'payment_id' => $payment->id,
                'session_id' => $session->id,
                'method'     => $method,
                'status'     => $payment->status,
                'amount'     => $payment->amount,
                'brand'      => $gatewayResult['brand'] ?? null,
                'latency_ms' => now()->diffInMilliseconds($attempt->started_at),
            ]);

            return $response;

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Pagamento falhou [{$requestId}]: " . $e->getMessage());
            
            $errorResponse = response()->json([
                'success' => false,
                'error' => [
                    'code' => 'payment_processing_error',
                    'message' => 'Não conseguimos processar seu pagamento agora. Tente novamente em instantes.',
                    'request_id' => $requestId
                ]
            ], 500);

            if ($idempotencyKey) {
                $idempotency->save($session->company_id, $idempotencyKey, $errorResponse);
            }

            return $errorResponse;
        }
    }

    /**
     * Retorna o status atual da sessão e do pagamento (Polling).
     */
    public function status($sessionToken)
    {
        $session = CheckoutSession::with(['order', 'payments' => function($q) {
                $q->latest()->limit(1);
            }])
            ->where('session_token', $sessionToken)
            ->first();

        if (!$session) {
            return response()->json(['error' => 'Sessão não encontrada'], 404);
        }

        $payment = $session->payments->first();
        $nextAction = 'wait';

        if ($session->status === 'paid') {
            $nextAction = 'show_success';
        } elseif ($session->status === 'failed') {
            $nextAction = 'show_failure';
        } elseif ($session->status === 'expired') {
            $nextAction = 'expired';
        } elseif ($payment && $payment->status === 'failed') {
            $nextAction = 'retry';
        }

        return response()->json([
            'success' => true,
            'data' => [
                'session' => [
                    'status' => $session->status,
                    'uuid' => $session->uuid
                ],
                'order' => [
                    'status' => $session->order->status
                ],
                'payment' => $payment ? [
                    'status' => $payment->status,
                    'method' => $payment->method,
                    'paid_at' => $payment->paid_at
                ] : null,
                'next_action' => $nextAction,
                'receipt_url' => $session->status === 'paid' ? "/receipt/{$session->session_token}" : null,
                'failure_url' => $nextAction === 'retry' ? "/failure/{$session->session_token}" : null,
            ]
        ]);
    }

    public function receipt($sessionToken)
    {
        $session = CheckoutSession::with(['order', 'payments' => function($q) {
                $q->whereIn('status', ['approved', 'paid'])->latest();
            }, 'connectedSystem.company'])
            ->where('session_token', $sessionToken)
            ->first();

        if (!$session || $session->status !== 'paid') {
            return response()->json(['error' => 'Recibo indisponível.'], 404);
        }

        $payment = $session->payments->first();

        return response()->json([
            'success' => true,
            'data' => [
                'order_number' => $session->order->uuid,
                'amount' => $session->amount,
                'currency' => $session->currency,
                'paid_at' => $payment->paid_at ?? $payment->updated_at,
                'method' => $payment->method,
                'customer' => $session->customer,
                'system_name' => $session->connectedSystem->name,
                'system_logo' => $session->connectedSystem->logo_url,
                'company_name' => $session->connectedSystem->company->name,
                'company_logo' => $session->connectedSystem->company->logo_url,
                'items' => $session->items
            ]
        ]);
    }

    public function failure($sessionToken)
    {
        $session = CheckoutSession::with(['payments' => function($q) {
                $q->latest();
            }])
            ->where('session_token', $sessionToken)
            ->first();

        if (!$session) return response()->json(['error' => 'Não encontrado.'], 404);

        $payment = $session->payments->first();

        return response()->json([
            'success' => true,
            'data' => [
                'status' => $session->status,
                'last_error' => 'O pagamento foi recusado pelo emissor do cartão.',
                'retry_allowed' => true
            ]
        ]);
    }

    public function socialProof($sessionToken)
    {
        $session = CheckoutSession::where('session_token', $sessionToken)->firstOrFail();
        
        // Contar pagamentos aprovados nas últimas 24h para esta empresa
        $recentCount = \App\Models\Payment::where('company_id', $session->company_id)
            ->whereIn('status', ['approved', 'paid'])
            ->where('created_at', '>=', now()->subHours(24))
            ->count();

        // Buscar últimos 3 compradores (nomes mascarados)
        $recentPayments = \App\Models\Payment::where('company_id', $session->company_id)
            ->whereIn('status', ['approved', 'paid'])
            ->with('order')
            ->orderBy('created_at', 'desc')
            ->limit(3)
            ->get();

        $recentBuyers = $recentPayments->map(function($payment) {
            $name = $payment->order->customer_name ?? 'Alguém';
            $parts = explode(' ', $name);
            $maskedName = $parts[0] . ' ' . (isset($parts[1]) ? substr($parts[1], 0, 1) . '.' : '');
            
            return [
                'name' => $maskedName,
                'time_ago' => $payment->created_at->diffForHumans()
            ];
        });

        return response()->json([
            'enabled' => true,
            'recentCount' => $recentCount + 7, // Offset para parecer mais vivo no início
            'lookbackHours' => 24,
            'recentBuyers' => $recentBuyers
        ]);
    }

    /**
     * Resolve memória e adaptatividade baseado no e-mail.
     */
    public function resolveMemory(Request $request, string $sessionToken): JsonResponse
    {
        $session = CheckoutSession::where('session_token', $sessionToken)->firstOrFail();
        $email = $request->input('email');

        if (!$email || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return response()->json(['success' => false, 'error' => 'Email inválido'], 422);
        }

        $memory = $this->memory->resolve($session->company_id, $email);
        $adaptive = $this->adaptive->decide($session->load('experience')->toArray(), $memory);

        return response()->json([
            'success' => true,
            'data' => [
                'memory'   => $memory,
                'adaptive' => $adaptive
            ]
        ]);
    }
}