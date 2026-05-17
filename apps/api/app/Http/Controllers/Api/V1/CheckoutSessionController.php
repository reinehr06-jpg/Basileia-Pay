<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Checkout\CreateCheckoutSessionRequest;
use App\Models\CheckoutExperience;
use App\Models\CheckoutSession;
use App\Models\Order;
use App\Domain\Customer\Services\CustomerService;
use App\Domain\Gateway\Services\GatewayResolver;
use App\Domain\Payment\Idempotency\IdempotencyGuard;
use App\Domain\Checkout\StateMachine\CheckoutSessionStateMachine;
use App\Services\Audit\AuditService;
use Illuminate\Http\JsonResponse;

class CheckoutSessionController extends Controller
{
    public function __construct(
        private CustomerService $customerService,
        private GatewayResolver $gatewayResolver,
        private IdempotencyGuard $idempotency,
        private CheckoutSessionStateMachine $sessionStateMachine,
        private AuditService $audit
    ) {}

    public function store(CreateCheckoutSessionRequest $request): JsonResponse
    {
        $idempotencyKey = $request->header('Idempotency-Key');
        if (!$idempotencyKey) {
            return response()->json(['error' => 'Idempotency-Key header obrigatório.'], 422);
        }

        $cached = $this->idempotency->check($idempotencyKey, 'checkout_session');
        if ($cached) {
            return response()->json($cached)->header('X-Idempotent-Replayed', 'true');
        }

        // Resolvido pelo ResolveApiKey middleware
        $company = \App\Services\TenantContext::company();
        $system = \App\Services\TenantContext::connectedSystem();

        $checkout = CheckoutExperience::where('id', $request->checkout_id)
            ->where('company_id', $company->id)
            ->firstOrFail();

        // Validar gateway disponível (throws RuntimeException if not found)
        $this->gatewayResolver->resolveOrFail($company, $request->method ?? 'pix');

        $customer = null;
        if ($request->has('customer')) {
            $customer = $this->customerService->firstOrCreate($company, $request->customer);
        }

        $order = Order::create([
            'uuid'               => \Illuminate\Support\Str::uuid(),
            'company_id'         => $company->id,
            'connected_system_id' => $system?->id,
            'customer_id'        => $customer?->id,
            'external_order_id'  => $request->external_order_id,
            'amount'             => $request->amount,
            'currency'           => $request->currency ?? 'BRL',
            'items'              => $request->items ?? [],
            'status'             => 'created',
        ]);

        $sessionToken = bin2hex(random_bytes(32));
        $session = CheckoutSession::create([
            'uuid'                  => \Illuminate\Support\Str::uuid(),
            'company_id'            => $company->id,
            'connected_system_id'   => $system?->id,
            'checkout_experience_id' => $checkout->id,
            'session_token'         => $sessionToken,
            'amount'                => $request->amount,
            'currency'              => $request->currency ?? 'BRL',
            'status'                => 'created',
            'environment'           => \App\Services\TenantContext::environment(),
            'expires_at'            => now()->addHours(24),
            'metadata'              => $request->metadata ?? [],
        ]);

        $order->update(['checkout_session_id' => $session->id]);

        $this->sessionStateMachine->transition($session, 'open');

        $result = [
            'session_id'   => $session->uuid,
            'checkout_url' => config('app.checkout_url') . '/pay/' . $sessionToken,
            'expires_at'   => $session->expires_at->toIso8601String(),
            'amount'       => $session->amount,
            'currency'     => $session->currency,
            'status'       => $session->status,
        ];

        $this->idempotency->store($idempotencyKey, 'checkout_session', $result);

        $this->audit->log('checkout_session.created', $session);

        return response()->json($result, 201);
    }
}
