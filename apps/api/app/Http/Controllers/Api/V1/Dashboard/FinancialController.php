<?php

namespace App\Http\Controllers\Api\V1\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\FinancialAuditLog;
use App\Services\Financial\RefundService;
use App\Jobs\ReconcileOrdersJob;
use Illuminate\Http\Request;

class FinancialController extends Controller
{
    public function __construct(private RefundService $refundService) {}

    public function indexOrders(Request $request)
    {
        $companyId = request()->attributes->get('company_id');
        $orders = Order::where('company_id', $companyId)
            ->with(['payments'])
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json(['success' => true, 'data' => $orders]);
    }

    public function showOrder(int $id)
    {
        $companyId = request()->attributes->get('company_id');
        $order = Order::where('company_id', $companyId)->with(['payments', 'checkout'])->findOrFail($id);
        return response()->json(['success' => true, 'data' => $order]);
    }

    public function orderPayments(int $id)
    {
        $companyId = request()->attributes->get('company_id');
        $order = Order::where('company_id', $companyId)->findOrFail($id);
        return response()->json(['success' => true, 'data' => $order->payments]);
    }

    public function storeRefund(Request $request, int $id)
    {
        $companyId = request()->attributes->get('company_id');
        $order = Order::where('company_id', $companyId)->findOrFail($id);
        
        $validated = $request->validate([
            'payment_id' => 'required|integer|exists:payments,id',
            'amount' => 'required|integer|min:1',
            'reason' => 'required|string',
        ]);

        $payment = $order->payments()->where('id', $validated['payment_id'])->firstOrFail();

        try {
            $refund = $this->refundService->requestRefund(
                $payment,
                $validated['amount'],
                $validated['reason'],
                $request->user()->id
            );

            return response()->json([
                'success' => true,
                'data' => $refund
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => app()->environment('production') ? 'Erro interno do servidor.' : $e->getMessage()
            ], 422);
        }
    }

    public function getDiscrepancies(Request $request)
    {
        $companyId = request()->attributes->get('company_id');
        $stuckOrders = Order::where('company_id', $companyId)
            ->where('status', 'processing')
            ->where('updated_at', '<', now()->subMinutes(15))
            ->get();

        return response()->json(['success' => true, 'data' => $stuckOrders]);
    }

    public function resyncOrder(int $id)
    {
        // Just for demo, you would dispatch a targeted job
        // dispatch(new ReconcileOrdersJob());
        return response()->json(['success' => true, 'message' => 'Resync scheduled']);
    }

    public function getAuditLogs(Request $request)
    {
        $companyId = $request->attributes->get('company_id') ?? $request->attributes->get('company')?->id;
        $logs = FinancialAuditLog::where('company_id', $companyId)
            ->orderBy('created_at', 'desc')->paginate(50);
        return response()->json(['success' => true, 'data' => $logs]);
    }
}
