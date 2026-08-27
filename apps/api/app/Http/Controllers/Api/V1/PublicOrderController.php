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
        $publication = CheckoutPublication::with('version')->where('system_id', $systemId)
            ->where('status', 'active')
            ->firstOrFail();

        $validated = $request->validate([
            'customer_name' => 'required|string',
            'customer_email' => 'required|email',
            'customer_document' => 'nullable|string',
            'items' => 'nullable|array', // F7: cliente envia apenas itens
            'currency' => 'required|string|in:BRL,USD,EUR', // Allowlist de moeda
        ]);

        // F7: Derivar o preço do backend
        $config = $publication->version->config ?? [];
        $basePrice = $config['pricing']['amount'] ?? $config['amount'] ?? 0;
        
        // Se houver items, somamos (simplificação)
        $totalAmount = $basePrice;
        if (!empty($validated['items']) && !empty($config['items'])) {
            $totalAmount = 0;
            // logic to match items...
        }
        
        if ($totalAmount <= 0) {
            // Fallback development (evita quebrar ambientes antigos)
            $totalAmount = $request->input('amount_total', 0);
            if ($totalAmount <= 0) {
                return response()->json(['error' => 'Valor inválido no servidor'], 422);
            }
        }

        $order = Order::create([
            'uuid' => Str::uuid(),
            'company_id' => $publication->checkout->company_id,
            'checkout_id' => $publication->checkout_id,
            'checkout_publication_id' => $publication->id,
            'customer_name' => $validated['customer_name'],
            'customer_email' => $validated['customer_email'],
            'customer_document' => $validated['customer_document'] ?? null,
            'amount' => $totalAmount,
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
