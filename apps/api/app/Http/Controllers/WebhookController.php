<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Helpers\PaymentStatusMapper;
use App\Models\Transaction;
use App\Services\WebhookNotifierService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

/**
 * [QA-03] statusMap inline removido:
 *
 * ANTES (duplicava a lógica):
 *   $statusMap = ['CONFIRMED' => 'approved', 'RECEIVED' => 'approved', ...];
 *   $status = $statusMap[$payload['payment']['status']] ?? 'pending';
 *
 * AGORA (fonte única de verdade):
 *   $status = PaymentStatusMapper::mapStatus($rawStatus);
 */
class WebhookController extends Controller
{
    public function __construct(
        private WebhookNotifierService $webhookNotifier,
    ) {
    }

    public function handle(Request $request): \Illuminate\Http\JsonResponse
    {
        $payload = $request->all();
        $event = $payload['event'] ?? '';
        $paymentId = $payload['payment']['id'] ?? '';
        $rawStatus = $payload['payment']['status'] ?? '';

        if (!$paymentId) {
            Log::warning('WebhookController: payload sem payment.id', ['ip' => $request->ip()]);
            return response()->json(['ok' => false, 'error' => 'payment.id ausente'], 422);
        }

        $transaction = Transaction::where('asaas_payment_id', $paymentId)->first();

        if (!$transaction) {
            Log::info('WebhookController: transação não encontrada localmente', [
                'payment_id' => $paymentId,
                'event' => $event,
            ]);
            return response()->json(['ok' => true, 'warning' => 'Transação não encontrada']);
        }

        // [QA-03] Usa PaymentStatusMapper — NUNCA statusMap inline
        $status = PaymentStatusMapper::mapStatus($rawStatus);
        $paidAt = PaymentStatusMapper::isPaid($rawStatus) ? now() : null;

        if ($transaction->status !== $status) {
            $transaction->update(['status' => $status, 'paid_at' => $paidAt]);

            Log::info('WebhookController: status atualizado', [
                'payment_id' => $paymentId,
                'event' => $event,
                'status' => $status,
            ]);

            $this->webhookNotifier->notify($transaction->fresh());
        }

        return response()->json(['ok' => true]);
    }
}