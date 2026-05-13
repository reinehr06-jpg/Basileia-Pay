<?php

namespace App\Http\Controllers\Api\V2;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use App\Services\Payment\CardPaymentService;
use App\Services\Payment\PixPaymentService;
use App\Services\Payment\BoletoPaymentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CheckoutController extends Controller
{
    public function show(string $uuid): JsonResponse
    {
        $tx = Transaction::where('uuid', $uuid)
            ->with(['customer', 'integration', 'items'])
            ->firstOrFail();

        return response()->json([
            'uuid'           => $tx->uuid,
            'status'         => $tx->status,
            'payment_method' => $tx->payment_method,
            'amount'         => $tx->amount,
            'currency'       => $tx->currency,
            'description'    => $tx->description,
            'installments'   => $tx->installments,
            'customer'       => [
                'name'     => $tx->customer_name ?? $tx->customer?->name,
                'email'    => $tx->customer_email ?? $tx->customer?->email,
                'document' => $tx->customer_document ?? $tx->customer?->document,
                'phone'    => $tx->customer_phone ?? $tx->customer?->phone,
            ],
            'items'          => $tx->items,
            'created_at'     => $tx->created_at,
        ]);
    }

    public function process(Request $request, string $uuid): JsonResponse
    {
        $tx = Transaction::where('uuid', $uuid)->firstOrFail();

        $data = $request->validate([
            'method'        => 'required|in:pix,creditcard,boleto',
            'name'          => 'required|string',
            'email'         => 'required|email',
            'document'      => 'required|string',
            'phone'         => 'nullable|string',
            // Cartão
            'card_number'   => 'required_if:method,creditcard',
            'card_holder'   => 'required_if:method,creditcard',
            'card_expiry'   => 'required_if:method,creditcard',
            'card_cvv'      => 'required_if:method,creditcard',
            'installments'  => 'nullable|integer|min:1|max:12',
            // Endereço (cartão)
            'address'       => 'nullable|array',
        ]);

        // Atualiza dados do cliente na transação
        $tx->update([
            'customer_name'     => $data['name'],
            'customer_email'    => $data['email'],
            'customer_document' => $data['document'],
            'customer_phone'    => $data['phone'] ?? $tx->customer_phone,
        ]);

        try {
            $result = match($data['method']) {
                'pix'        => app(PixPaymentService::class)->process($tx, $data),
                'creditcard' => app(CardPaymentService::class)->process($tx, $data),
                'boleto'     => app(BoletoPaymentService::class)->process($tx, $data),
            };

            return response()->json($result);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    public function status(string $uuid): JsonResponse
    {
        $tx = Transaction::where('uuid', $uuid)->firstOrFail();

        $payload = ['status' => $tx->status, 'paid_at' => $tx->paid_at];

        // Se PIX, retorna dados do QR
        if ($tx->payment_method === 'pix' && $tx->metadata) {
            $meta = is_array($tx->metadata) ? $tx->metadata : json_decode($tx->metadata, true);
            $payload['pix'] = [
                'qr_code'   => $meta['pix_qr_code'] ?? null,
                'copy_paste' => $meta['pix_copy_paste'] ?? null,
                'expires_at' => $meta['pix_expires_at'] ?? null,
            ];
        }

        return response()->json($payload);
    }

    public function receipt(string $uuid): JsonResponse
    {
        $tx = Transaction::where('uuid', $uuid)
            ->with(['customer', 'payments'])
            ->firstOrFail();

        if ($tx->status !== 'approved') {
            return response()->json(['message' => 'Transação não aprovada.'], 422);
        }

        return response()->json([
            'uuid'           => $tx->uuid,
            'status'         => $tx->status,
            'amount'         => $tx->amount,
            'currency'       => $tx->currency,
            'payment_method' => $tx->payment_method,
            'installments'   => $tx->installments,
            'description'    => $tx->description,
            'paid_at'        => $tx->paid_at,
            'customer'       => [
                'name'     => $tx->customer_name ?? $tx->customer?->name,
                'email'    => $tx->customer_email ?? $tx->customer?->email,
                'document' => $tx->customer_document ?? $tx->customer?->document,
            ],
        ]);
    }
}
