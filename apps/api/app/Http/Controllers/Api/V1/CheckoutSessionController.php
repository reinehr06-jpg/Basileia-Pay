<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\CheckoutSession;
use App\Models\ConnectedSystem;
use App\Services\Routing\ResolutionEngine;
use App\Services\Audit\AuditService;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Validator;

class CheckoutSessionController extends Controller
{
    /**
     * Cria uma nova sessão de checkout para um sistema conectado.
     */
    public function store(Request $request, ResolutionEngine $engine, AuditService $audit)
    {
        $requestId = $request->header('X-Request-Id', (string) Str::uuid());

        // 1. Validar a API Key do Sistema Conectado
        $apiKey = $request->header('X-Basileia-System-Key') ?? $request->input('system_key');
        
        $system = ConnectedSystem::where('api_key', $apiKey)
            ->where('active', true)
            ->first();

        if (!$system) {
            return response()->json([
                'data' => null,
                'meta' => ['request_id' => $requestId],
                'error' => [
                    'code' => 'UNAUTHORIZED',
                    'message' => 'Sistema não autorizado ou chave inválida.',
                    'fields' => (object)[]
                ]
            ], 401);
        }

        // 2. Validar o Payload da Venda
        $validator = Validator::make($request->all(), [
            'external_order_id' => 'nullable|string|max:100',
            'idempotency_key'   => 'nullable|string|max:100',
            'customer'          => 'required|array',
            'customer.name'     => 'required|string|max:255',
            'customer.email'    => 'required|email|max:255',
            'items'             => 'required|array|min:1',
            'amount'            => 'required|integer|min:1', // em centavos
            'currency'          => 'string|size:3',
            'success_url'       => 'nullable|url',
            'cancel_url'        => 'nullable|url',
            'metadata'          => 'nullable|array',
            'experience_id'     => 'nullable|exists:checkout_experiences,id'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'data' => null,
                'meta' => ['request_id' => $requestId],
                'error' => [
                    'code' => 'VALIDATION_ERROR',
                    'message' => 'Verifique os campos informados.',
                    'fields' => $validator->errors()
                ]
            ], 422);
        }

        $data = $validator->validated();
        $idempotencyKey = $request->header('Idempotency-Key') ?? ($data['idempotency_key'] ?? null);

        // 3. Checar Idempotência
        if ($idempotencyKey) {
            $existingSession = CheckoutSession::where('connected_system_id', $system->id)
                ->where('idempotency_key', $idempotencyKey)
                ->first();

            if ($existingSession) {
                return $this->successResponse($existingSession, $requestId, 200);
            }
        }

        // 4. Resolver Configurações (Gateway, Experience, Version)
        $resolution = $engine->resolve($system, $data);

        // 5. Criar a Sessão
        $session = CheckoutSession::create([
            'uuid'                           => (string) Str::uuid(),
            'connected_system_id'            => $system->id,
            'gateway_account_id'             => $resolution['gateway_account_id'],
            'checkout_experience_id'         => $resolution['checkout_experience_id'],
            'checkout_experience_version_id' => $resolution['checkout_experience_version_id'],
            'external_order_id'              => $data['external_order_id'] ?? null,
            'idempotency_key'                => $idempotencyKey,
            'customer'                       => $data['customer'],
            'items'                          => $data['items'],
            'amount'                         => $data['amount'],
            'currency'                       => $data['currency'] ?? 'BRL',
            'success_url'                    => $data['success_url'] ?? null,
            'cancel_url'                     => $data['cancel_url'] ?? null,
            'metadata'                       => $data['metadata'] ?? null,
            'resolved_config_json'           => $resolution['resolved_config'],
            'status'                         => 'open',
            'expires_at'                     => now()->addHours(24),
        ]);

        $audit->log('checkout_session.created', $session, [
            'amount' => $session->amount,
            'external_order_id' => $session->external_order_id
        ]);

        return $this->successResponse($session, $requestId, 201);
    }

    /**
     * Consulta o status de uma sessão.
     */
    public function show(Request $request, $id)
    {
        $requestId = $request->header('X-Request-Id', (string) Str::uuid());
        
        $session = CheckoutSession::where('uuid', $id)->first();
        
        if (!$session) {
            return response()->json([
                'data' => null,
                'meta' => ['request_id' => $requestId],
                'error' => [
                    'code' => 'NOT_FOUND',
                    'message' => 'Sessão não encontrada.',
                    'fields' => (object)[]
                ]
            ], 404);
        }

        return $this->successResponse($session, $requestId, 200);
    }

    private function successResponse(CheckoutSession $session, string $requestId, int $status)
    {
        $checkoutBaseUrl = config('basileia.checkout_url', 'http://localhost:3001');

        return response()->json([
            'data' => [
                'checkout_session_id' => $session->uuid,
                'checkout_url'        => "{$checkoutBaseUrl}/pay/{$session->uuid}",
                'expires_at'          => $session->expires_at->toIso8601String(),
                'status'              => $session->status,
                'amount'              => $session->amount,
            ],
            'meta' => [
                'request_id' => $requestId
            ],
            'error' => null
        ], $status);
    }
}
