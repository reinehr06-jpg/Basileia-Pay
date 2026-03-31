<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\TransactionService;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class TransactionController extends Controller
{
    public function __construct(private TransactionService $transactionService)
    {
    }

    public function index(Request $request)
    {
        $request->validate([
            'status' => 'sometimes|in:pending,approved,refused,cancelled,refunded',
            'date_from' => 'sometimes|date',
            'date_to' => 'sometimes|date|after_or_equal:date_from',
            'integration_id' => 'sometimes|integer|exists:integrations,id',
            'per_page' => 'sometimes|integer|min:1|max:100',
        ]);

        $integration = $request->attributes->get('integration');

        $filters = $request->only(['status', 'date_from', 'date_to', 'integration_id']);
        $filters['integration_id'] = $filters['integration_id'] ?? $integration->id;

        $transactions = $this->transactionService->listPaginated(
            $filters,
            $request->input('per_page', 15)
        );

        return response()->json($transactions);
    }

    public function store(Request $request)
    {
        $request->validate([
            'amount' => 'required|numeric|min:1',
            'customer' => 'required|array',
            'customer.name' => 'required|string|max:255',
            'customer.email' => 'required|email',
            'customer.document' => 'required|string|max:20',
            'customer.phone' => 'sometimes|string|max:20',
            'payment_method' => 'sometimes|in:pix,boleto,credit_card,debit_card',
            'installments' => 'sometimes|integer|min:1|max:12',
            'items' => 'sometimes|array',
            'items.*.description' => 'required_with:items|string|max:255',
            'items.*.quantity' => 'required_with:items|integer|min:1',
            'items.*.unit_price' => 'required_with:items|numeric|min:0',
            'metadata' => 'sometimes|array',
            'callback_url' => 'sometimes|url',
            'expires_in' => 'sometimes|integer|min:1|max:720',
        ]);

        $integration = $request->attributes->get('integration');

        $validated = $request->validated();

        $transaction = $this->transactionService->create(
            $validated,
            $integration
        );

        return response()->json([
            'transaction' => $transaction->load(['items', 'customer']),
        ], Response::HTTP_CREATED);
    }

    public function show(Request $request, string $uuid)
    {
        $integration = $request->attributes->get('integration');

        $transaction = $this->transactionService->findByUuid($uuid, $integration);

        if (!$transaction) {
            return response()->json(['message' => 'Transação não encontrada.'], Response::HTTP_NOT_FOUND);
        }

        return response()->json([
            'transaction' => $transaction->load(['payments', 'items', 'customer', 'fraudAnalysis']),
        ]);
    }

    public function cancel(Request $request, string $uuid)
    {
        $integration = $request->attributes->get('integration');

        $transaction = $this->transactionService->cancel($uuid, $integration);

        if (!$transaction) {
            return response()->json(['message' => 'Transação não encontrada.'], Response::HTTP_NOT_FOUND);
        }

        return response()->json([
            'transaction' => $transaction,
            'message' => 'Transação cancelada com sucesso.',
        ]);
    }

    public function refund(Request $request, string $uuid)
    {
        $request->validate([
            'amount' => 'sometimes|numeric|min:1',
        ]);

        $integration = $request->attributes->get('integration');

        $transaction = $this->transactionService->refund(
            $uuid,
            $integration,
            $request->input('amount')
        );

        if (!$transaction) {
            return response()->json(['message' => 'Transação não encontrada.'], Response::HTTP_NOT_FOUND);
        }

        return response()->json([
            'transaction' => $transaction,
            'message' => 'Estorno realizado com sucesso.',
        ]);
    }
}
