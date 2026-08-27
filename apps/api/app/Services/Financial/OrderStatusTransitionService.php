<?php

namespace App\Services\Financial;

use App\Models\Order;
use App\Models\FinancialAuditLog;
use Illuminate\Support\Facades\DB;
use Exception;

class OrderStatusTransitionService
{
    private const ALLOWED_TRANSITIONS = [
        'created' => ['pending', 'processing', 'cancelled'],
        'pending' => ['processing', 'paid', 'review', 'failed', 'expired', 'cancelled'],
        'processing' => ['paid', 'review', 'failed', 'expired', 'cancelled'],
        'paid' => ['refunded'],
        'review' => ['paid', 'refunded'], // Requires manual review (e.g. underpaid)
        'failed' => [],
        'expired' => [],
        'refunded' => [],
        'cancelled' => [],
    ];

    public function transition(Order $order, string $newStatus, ?int $actorId = null): Order
    {
        return DB::transaction(function () use ($order, $newStatus, $actorId) {
            // Lock order for update to prevent race conditions
            $lockedOrder = Order::lockForUpdate()->find($order->id);

            $oldStatus = $lockedOrder->status;

            if ($oldStatus === $newStatus) {
                return $lockedOrder;
            }

            if (!in_array($newStatus, self::ALLOWED_TRANSITIONS[$oldStatus] ?? [])) {
                throw new Exception("Invalid order status transition from {$oldStatus} to {$newStatus}");
            }

            $beforeState = $lockedOrder->toArray();
            $lockedOrder->status = $newStatus;
            $lockedOrder->save();

            FinancialAuditLog::create([
                'entity_type' => 'order',
                'entity_id' => $lockedOrder->id,
                'action' => "status_transition:{$oldStatus}->{$newStatus}",
                'actor_id' => $actorId,
                'before_state' => $beforeState,
                'after_state' => $lockedOrder->toArray(),
            ]);

            return $lockedOrder;
        });
    }
}
