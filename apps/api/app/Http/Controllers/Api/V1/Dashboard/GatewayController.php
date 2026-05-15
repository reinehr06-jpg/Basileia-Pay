<?php

namespace App\Http\Controllers\Api\V1\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\GatewayAccount;
use App\Services\TenantContext;
use Illuminate\Http\Request;

class GatewayController extends Controller
{
    public function index()
    {
        $gateways = GatewayAccount::where('company_id', TenantContext::companyId())
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'data' => $gateways->map(fn($g) => [
                'id' => $g->id,
                'uuid' => $g->uuid,
                'name' => $g->name,
                'provider' => $g->provider,
                'environment' => $g->environment,
                'status' => $g->status,
                'last_tested_at' => $g->last_tested_at ? $g->last_tested_at->format('d/m/Y H:i') : null,
                'last_test_status' => $g->last_test_status,
            ])
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'provider' => 'required|string',
            'environment' => 'required|in:sandbox,production',
            'credentials' => 'required|array',
        ]);

        $gateway = GatewayAccount::create([
            'company_id' => TenantContext::companyId(),
            'name' => $validated['name'],
            'provider' => $validated['provider'],
            'environment' => $validated['environment'],
            'credentials_encrypted' => encrypt($validated['credentials']),
            'status' => 'active',
        ]);

        return response()->json([
            'success' => true,
            'data' => $gateway
        ], 201);
    }
}
