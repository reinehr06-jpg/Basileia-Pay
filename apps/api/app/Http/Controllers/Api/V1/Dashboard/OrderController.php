<?php

namespace App\Http\Controllers\Api\V1\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Services\TenantContext;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        $orders = Order::where('company_id', TenantContext::companyId())
            ->with(['connectedSystem'])
            ->latest()
            ->paginate($request->per_page ?? 20);

        return response()->json([
            'success' => true,
            'data' => $orders->getCollection()->map(fn($o) => [
                'id' => $o->id,
                'uuid' => $o->uuid,
                'external_order_id' => $o->external_order_id,
                'amount' => $o->amount,
                'currency' => $o->currency,
                'status' => $o->status,
                'status_label' => ucfirst($o->status),
                'system_name' => $o->connectedSystem?->name ?? 'N/A',
                'created_at' => $o->created_at->format('d/m/Y H:i'),
            ]),
            'meta' => [
                'current_page' => $orders->currentPage(),
                'last_page' => $orders->lastPage(),
                'total' => $orders->total(),
            ]
        ]);
    }

    public function show($id)
    {
        $order = Order::where('company_id', TenantContext::companyId())
            ->with(['connectedSystem', 'payments', 'session'])
            ->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $order
        ]);
    }
}
