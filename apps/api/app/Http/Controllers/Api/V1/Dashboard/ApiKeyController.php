<?php

namespace App\Http\Controllers\Api\V1\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\ApiKey;
use App\Services\TenantContext;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ApiKeyController extends Controller
{
    public function index()
    {
        $keys = ApiKey::where('company_id', TenantContext::companyId())
            ->with(['connectedSystem'])
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'data' => $keys->map(fn($k) => [
                'id' => $k->id,
                'uuid' => $k->uuid,
                'name' => $k->name,
                'key_preview' => $k->key_prefix . '...',
                'environment' => $k->environment,
                'system_name' => $k->connectedSystem?->name ?? 'Global',
                'last_used_at' => $k->last_used_at ? $k->last_used_at->format('d/m/Y H:i') : 'Nunca',
                'created_at' => $k->created_at->format('d/m/Y'),
            ])
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'environment' => 'required|in:sandbox,production',
            'connected_system_id' => 'nullable|exists:connected_systems,id',
        ]);

        $rawKey = Str::random(40);
        $keyString = 'bp_' . ($validated['environment'] === 'production' ? 'live' : 'test') . '_' . $rawKey;
        $prefix = substr($keyString, 0, 12);
        
        $apiKey = ApiKey::create([
            'company_id' => TenantContext::companyId(),
            'connected_system_id' => $validated['connected_system_id'],
            'name' => $validated['name'],
            'key_prefix' => $prefix,
            'key_hash' => hash('sha256', $keyString),
            'environment' => $validated['environment'],
        ]);

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $apiKey->id,
                'key' => $keyString, // Só mostramos a chave inteira na criação
                'name' => $apiKey->name,
            ]
        ], 201);
    }
}
