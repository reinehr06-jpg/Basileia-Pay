<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Integration;
use App\Models\Transaction;
use App\Services\Gateway\GatewayResolver;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class PaymentApiController extends Controller
{
    public function receive(Request $request)
    {
        $apiKey = $request->header('Authorization');
        if (!$apiKey) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $apiKey = str_replace('Bearer ', '', $apiKey);
        $integration = Integration::where('api_key_hash', hash('sha256', $apiKey))->first();

        if (!$integration) {
            return response()->json(['error' => 'Invalid API Key'], 403);
        }

        $request->validate([
            'asaas_id' => 'required|string',
            'callback_url' => 'sometimes|url',
            'metadata' => 'sometimes|array',
        ]);

        try {
            $asaas = GatewayResolver::resolveGateway('asaas');

            // Fetch payment details from Asaas to sync local data
            $asaasData = $asaas->getPayment($request->input('asaas_id'));

            if (isset($asaasData['error']) && $asaasData['error'] === 'Gateway not configured') {
                return response()->json(['error' => 'Gateway not configured. Please configure ASAAS_API_KEY.'], 503);
            }

            $transaction = Transaction::create([
                'uuid' => (string) Str::uuid(),
                'company_id' => $integration->company_id,
                'integration_id' => $integration->id,
                'asaas_payment_id' => $request->input('asaas_id'),
                'asaas_customer_id' => $asaasData['customer'] ?? null,
                'amount' => $asaasData['value'],
                'currency' => 'BRL',
                'status' => 'pending',
                'callback_url' => $request->input('callback_url') ?? $integration->webhook_url,
                'metadata' => $request->input('metadata') ?? [],
                'customer_name' => $asaasData['customer_name'] ?? null, // Will fetch full customer details if needed
                'customer_email' => $asaasData['customer_email'] ?? null,
            ]);

            return response()->json([
                'status' => 'success',
                'checkout_url' => config('app.url') . '/pay/' . $transaction->uuid,
                'transaction_uuid' => $transaction->uuid,
            ]);

        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 400);
        }
    }
}
