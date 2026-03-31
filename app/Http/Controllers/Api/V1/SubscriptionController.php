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

    public function store(Request $request)
    {
        $request->validate([
            'customer_id' => 'required|integer|exists:customers,id',
            'plan_id' => 'required|integer|exists:plans,id',
            'payment_method' => 'required|in:credit_card,pix,boleto',
            'card_token' => 'required_if:payment_method,credit_card|string',
            'billing_type' => 'sometimes|in:prepaid,postpaid',
            'metadata' => 'sometimes|array',
        ]);

        $integration = $request->attributes->get('integration');

        $subscription = Subscription::create([
            'integration_id' => $integration->id,
            'customer_id' => $request->input('customer_id'),
            'plan_id' => $request->input('plan_id'),
            'payment_method' => $request->input('payment_method'),
            'billing_type' => $request->input('billing_type', 'prepaid'),
            'metadata' => $request->input('metadata'),
            'status' => 'active',
        ]);

        return response()->json([
            'subscription' => $subscription->load(['customer', 'plan']),
        ], Response::HTTP_CREATED);
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
