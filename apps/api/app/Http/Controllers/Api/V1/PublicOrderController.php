<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\CheckoutPublication;
use App\Models\Order;
use App\Services\Financial\PaymentService;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class PublicOrderController extends Controller
{
    public function __construct(private PaymentService $paymentService) {}

    public function storeOrder(Request $request, string $systemId)
    {
        $publication = CheckoutPublication::where('system_id', $systemId)
            ->where('is_active', true)
            ->firstOrFail();

        $validated = $request->validate([
            'customer_name' => 'required|string',
            'customer_email' => 'required|email',
            'customer_document' => 'nullable|string',
            'amount_total' => 'required|integer',
            'currency' => 'required|string|size:3',
        ]);

        $order = Order::create([
            'uuid' => Str::uuid(),
            'company_id' => $publication->checkout->company_id,
            'checkout_id' => $publication->checkout_id,
            'checkout_publication_id' => $publication->id,
            'customer_name' => $validated['customer_name'],
            'customer_email' => $validated['customer_email'],
            'customer_document' => $validated['customer_document'] ?? null,
            'amount' => $validated['amount_total'],
            'currency' => $validated['currency'],
            'status' => 'created',
            'metadata' => $request->input('metadata', []),
        ]);

        return response()->json([
            'success' => true,
            'data' => $order
        ], 201);
    }

    public function storePayment(Request $request, int $orderId)
    {
        $order = Order::findOrFail($orderId);

        $idempotencyKey = $request->header('Idempotency-Key');
        if (!$idempotencyKey) {
            return response()->json([
                'success' => false,
                'error' => 'Idempotency-Key header is required'
            ], 400);
        }

        $validated = $request->validate([
            'method' => 'required|string|in:pix,credit_card,boleto',
        ]);

        try {
            $payment = $this->paymentService->createPayment($order, $validated['method'], $idempotencyKey);
            return response()->json([
                'success' => true,
                'data' => $payment
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => app()->environment('production') ? 'Erro interno do servidor.' : $e->getMessage()
            ], 422);
        }
    }
}
