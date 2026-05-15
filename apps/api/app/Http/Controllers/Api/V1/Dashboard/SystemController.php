<?php

namespace App\Http\Controllers\Api\V1\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\ConnectedSystem;
use App\Services\TenantContext;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class SystemController extends Controller
{
    public function index()
    {
        $systems = ConnectedSystem::where('company_id', TenantContext::companyId())
            ->with(['apiKeys'])
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'data' => $systems->map(fn($s) => [
                'id' => $s->id,
                'uuid' => $s->uuid,
                'name' => $s->name,
                'slug' => $s->slug,
                'status' => $s->status,
                'environment' => $s->environment,
                'api_key_preview' => $s->apiKeys->first()?->key ?? 'N/A',
                'created_at' => $s->created_at->format('d/m/Y H:i'),
            ])
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'environment' => 'required|in:sandbox,production',
        ]);

        $system = ConnectedSystem::create([
            'company_id' => TenantContext::companyId(),
            'name' => $validated['name'],
            'slug' => Str::slug($validated['name']),
            'environment' => $validated['environment'],
            'status' => 'active',
        ]);

        return response()->json([
            'success' => true,
            'data' => $system
        ], 201);
    }

    public function show($id)
    {
        $system = ConnectedSystem::where('company_id', TenantContext::companyId())
            ->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $system
        ]);
    }
}
