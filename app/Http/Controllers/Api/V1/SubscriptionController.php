<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Subscription;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class SubscriptionController extends Controller
{
    public function index(Request $request)
    {
        $request->validate([
            'status' => 'sometimes|in:active,paused,cancelled',
            'per_page' => 'sometimes|integer|min:1|max:100',
        ]);

        $integration = $request->attributes->get('integration');

        $query = Subscription::where('integration_id', $integration->id)
            ->with(['customer', 'plan']);

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        $subscriptions = $query->orderBy('created_at', 'desc')
            ->paginate($request->input('per_page', 15));

        return response()->json($subscriptions);
    }

    public function store(Request $request, \App\Services\Gateway\AsaasGateway $asaas)
    {
        $request->validate([
            'customer' => 'required|array',
            'customer.name' => 'required|string',
            'customer.email' => 'required|email',
            'customer.document' => 'required|string',
            'plan_name' => 'required|string',
            'amount' => 'required|numeric',
            'billing_cycle' => 'sometimes|string', // MONTHLY, QUARTERLY, etc.
            'payment_method' => 'sometimes|in:credit_card,pix,boleto',
            'metadata' => 'sometimes|array',
        ]);

        $integration = $request->attributes->get('integration');

        try {
            // 1. Create/Find local Customer
            $customer = \App\Models\Customer::updateOrCreate(
                ['email' => $request->input('customer.email'), 'company_id' => $integration->company_id],
                [
                    'name' => $request->input('customer.name'),
                    'document' => preg_replace('/\D/', '', $request->input('customer.document')),
                ]
            );

            // 2. Create/Find Customer in Asaas
            $asaasCustomer = $asaas->createCustomer([
                'name' => $request->input('customer.name'),
                'email' => $request->input('customer.email'),
                'document' => $request->input('customer.document'),
                'external_reference' => 'customer_' . $customer->id,
            ]);

            // 3. Create Subscription in Asaas
            $asaasSubscription = $asaas->createSubscription([
                'customer' => $asaasCustomer['id'],
                'billing_type' => strtoupper($request->input('payment_method', 'credit_card')),
                'value' => $request->input('amount'),
                'next_due_date' => now()->addDays(3)->format('Y-m-d'),
                'cycle' => strtoupper($request->input('billing_cycle', 'MONTHLY')),
                'description' => $request->input('plan_name'),
                'externalReference' => 'sub_' . time(),
            ]);

            // 4. Save local subscription
            $subscription = Subscription::create([
                'uuid' => \Illuminate\Support\Str::uuid(),
                'integration_id' => $integration->id,
                'company_id' => $integration->company_id,
                'customer_id' => $customer->id,
                'plan_name' => $request->input('plan_name'),
                'amount' => $request->input('amount'),
                'billing_cycle' => strtolower($request->input('billing_cycle', 'monthly')),
                'gateway_subscription_id' => $asaasSubscription['id'],
                'metadata' => $request->input('metadata'),
                'status' => 'active',
            ]);

            return response()->json([
                'subscription' => [
                    'uuid' => $subscription->uuid,
                    'payment_url' => $subscription->payment_url,
                ],
                'message' => 'Subscription created successfully. Link generated.'
            ], Response::HTTP_CREATED);

        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error("Subscription store error: " . $e->getMessage());
            return response()->json([
                'error' => 'Gateway error: ' . $e->getMessage(),
                'status' => 'failed'
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }
    }

    public function show(Request $request, int $id)
    {
        $integration = $request->attributes->get('integration');

        $subscription = Subscription::where('integration_id', $integration->id)
            ->with(['customer', 'plan', 'transactions'])
            ->find($id);

        if (!$subscription) {
            return response()->json(['message' => 'Assinatura não encontrada.'], Response::HTTP_NOT_FOUND);
        }

        return response()->json(['subscription' => $subscription]);
    }

    public function pause(Request $request, int $id)
    {
        $integration = $request->attributes->get('integration');

        $subscription = Subscription::where('integration_id', $integration->id)->find($id);

        if (!$subscription) {
            return response()->json(['message' => 'Assinatura não encontrada.'], Response::HTTP_NOT_FOUND);
        }

        $subscription->update(['status' => 'paused']);

        return response()->json([
            'subscription' => $subscription,
            'message' => 'Assinatura pausada com sucesso.',
        ]);
    }

    public function resume(Request $request, int $id)
    {
        $integration = $request->attributes->get('integration');

        $subscription = Subscription::where('integration_id', $integration->id)->find($id);

        if (!$subscription) {
            return response()->json(['message' => 'Assinatura não encontrada.'], Response::HTTP_NOT_FOUND);
        }

        $subscription->update(['status' => 'active']);

        return response()->json([
            'subscription' => $subscription,
            'message' => 'Assinatura reativada com sucesso.',
        ]);
    }

    public function destroy(Request $request, int $id)
    {
        $integration = $request->attributes->get('integration');

        $subscription = Subscription::where('integration_id', $integration->id)->find($id);

        if (!$subscription) {
            return response()->json(['message' => 'Assinatura não encontrada.'], Response::HTTP_NOT_FOUND);
        }

        $subscription->update(['status' => 'cancelled']);

        return response()->json([
            'subscription' => $subscription,
            'message' => 'Assinatura cancelada com sucesso.',
        ]);
    }
}
