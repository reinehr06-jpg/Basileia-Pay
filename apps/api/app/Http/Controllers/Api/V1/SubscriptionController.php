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
        // 1. Diagnostic Log: Understand exactly what the Vendor is sending
        \Illuminate\Support\Facades\Log::info("Checkout: Subscription Request Ingested", [
            'payload_keys' => array_keys($request->all()),
            'integration_id' => $integration->id ?? null,
        ]);

        // 2. Smart Request Mapping: Support synonyms from Vendor
        $data = $request->all();

        // Map Amount/Value
        if (!isset($data['amount']) && isset($data['value']))
            $data['amount'] = $data['value'];
        if (!isset($data['amount']) && isset($data['valor']))
            $data['amount'] = $data['valor'];

        // Map Plan Name
        if (!isset($data['plan_name']) && isset($data['description']))
            $data['plan_name'] = $data['description'];
        if (!isset($data['plan_name']) && isset($data['plano']))
            $data['plan_name'] = $data['plano'];
        if (!isset($data['plan_name']))
            $data['plan_name'] = 'Assinatura Basileia'; // Default

        // Map Customer (Documento / CPF / CNPJ)
        if (isset($data['customer']) && is_array($data['customer'])) {
            if (!isset($data['customer']['document']) && isset($data['customer']['documento']))
                $data['customer']['document'] = $data['customer']['documento'];
            if (!isset($data['customer']['document']) && isset($data['customer']['cpf_cnpj']))
                $data['customer']['document'] = $data['customer']['cpf_cnpj'];
            if (!isset($data['customer']['document']) && isset($data['customer']['cpf']))
                $data['customer']['document'] = $data['customer']['cpf'];
        }

        // Map Billing Cycle (Frequencia / Ciclo)
        if (!isset($data['billing_cycle']) && isset($data['frequencia']))
            $data['billing_cycle'] = $data['frequencia'];
        if (!isset($data['billing_cycle']) && isset($data['ciclo']))
            $data['billing_cycle'] = $data['ciclo'];
        if (!isset($data['billing_cycle']))
            $data['billing_cycle'] = 'monthly'; // Default

        // 3. Robust Validation
        $validator = \Illuminate\Support\Facades\Validator::make($data, [
            'customer' => 'required|array',
            'customer.name' => 'required|string',
            'customer.email' => 'required|email',
            'customer.document' => 'required|string',
            'customer.phone' => 'sometimes|string',
            'customer.address' => 'sometimes|array',
            'plan_name' => 'required|string',
            'amount' => 'required|numeric',
            'billing_cycle' => 'sometimes|string',
            'payment_method' => 'sometimes|in:credit_card,pix,boleto',
            'callback_url' => 'sometimes|url',
            'metadata' => 'sometimes|array',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => 'Validation Failed',
                'details' => $validator->errors(),
                'received' => $request->all()
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $integration = $request->attributes->get('integration');

        try {
            // 4. Create/Find local Customer
            $customerData = [
                'name' => $data['customer']['name'],
                'document' => preg_replace('/\D/', '', $data['customer']['document']),
                'phone' => $data['customer']['phone'] ?? null,
                'address' => $data['customer']['address'] ?? null,
            ];

            $customer = \App\Models\Customer::updateOrCreate(
                ['email' => $data['customer']['email'], 'company_id' => $integration->company_id],
                $customerData
            );

            // 5. Create/Find Customer in Asaas (With full profile for Invoicing)
            $address = $data['customer']['address'] ?? [];
            $asaasCustomer = $asaas->createCustomer([
                'name' => $data['customer']['name'],
                'email' => $data['customer']['email'],
                'document' => $data['customer']['document'],
                'phone' => $data['customer']['phone'] ?? null,
                'address' => $address['street'] ?? null,
                'address_number' => $address['number'] ?? null,
                'neighborhood' => $address['neighborhood'] ?? null,
                'city' => $address['city'] ?? null,
                'state' => $address['state'] ?? null,
                'zip_code' => $address['postalCode'] ?? null,
                'external_reference' => 'customer_' . $customer->id,
            ]);

            // 6. Map Asaas Cycle (yearly -> ANNUAL)
            $cycle = strtoupper($data['billing_cycle']);
            if ($cycle === 'YEARLY' || $cycle === 'ANUAL')
                $cycle = 'ANNUAL';
            if ($cycle === 'MONTHLY' || $cycle === 'MENSAL')
                $cycle = 'MONTHLY';

            // 7. Create Subscription in Asaas
            $asaasSubscription = $asaas->createSubscription([
                'customer' => $asaasCustomer['id'],
                'billing_type' => strtoupper($data['payment_method'] ?? 'credit_card'),
                'value' => $data['amount'],
                'next_due_date' => now()->addDays(3)->format('Y-m-d'),
                'cycle' => $cycle,
                'description' => $data['plan_name'],
                'externalReference' => 'sub_' . time(),
            ]);

            // 8. Save local subscription
            $subscription = Subscription::create([
                'uuid' => \Illuminate\Support\Str::uuid(),
                'integration_id' => $integration->id,
                'company_id' => $integration->company_id,
                'customer_id' => $customer->id,
                'plan_name' => $data['plan_name'],
                'amount' => $data['amount'],
                'billing_cycle' => strtolower($data['billing_cycle']),
                'gateway_subscription_id' => $asaasSubscription['id'],
                'callback_url' => $data['callback_url'] ?? null,
                'metadata' => $data['metadata'] ?? [],
                'status' => 'active',
            ]);

            $result = [
                'uuid' => $subscription->uuid,
                'payment_url' => $subscription->payment_url,
            ];

            return response()->json([
                'subscription' => $result,
                'transaction' => $result, // Alias for Vendor compatibility
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
