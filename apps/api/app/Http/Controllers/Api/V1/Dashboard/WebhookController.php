<?php

namespace App\Http\Controllers\Api\V1\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\WebhookEndpoint;
use App\Models\WebhookDelivery;
use App\Services\TenantContext;
use Illuminate\Http\Request;

class WebhookController extends Controller
{
    public function endpoints()
    {
        $endpoints = WebhookEndpoint::where('company_id', TenantContext::companyId())
            ->with(['connectedSystem'])
            ->get();

        return response()->json([
            'success' => true,
            'data' => $endpoints
        ]);
    }

    public function deliveries(Request $request)
    {
        $deliveries = WebhookDelivery::where('company_id', TenantContext::companyId())
            ->latest()
            ->paginate($request->per_page ?? 20);

        return response()->json([
            'success' => true,
            'data' => $deliveries->getCollection(),
            'meta' => [
                'current_page' => $deliveries->currentPage(),
                'last_page' => $deliveries->lastPage(),
                'total' => $deliveries->total(),
            ]
        ]);
    }

    public function storeEndpoint(Request $request)
    {
        $validated = $request->validate([
            'url' => 'required|url',
            'connected_system_id' => 'nullable|exists:connected_systems,id',
            'events' => 'required|array',
            'events.*' => 'string',
        ]);

        $endpoint = WebhookEndpoint::create([
            'company_id' => TenantContext::companyId(),
            'connected_system_id' => $validated['connected_system_id'],
            'url' => $validated['url'],
            'events' => $validated['events'],
            'secret' => \Illuminate\Support\Str::random(32),
            'status' => 'active',
        ]);

        return response()->json([
            'success' => true,
            'data' => $endpoint
        ], 201);
    }
}
