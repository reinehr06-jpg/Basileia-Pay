<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\ConnectedSystem as System;
use App\Services\Audit\AuditService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class SystemController extends Controller
{
    public function __construct(
        private AuditService $audit,
    ) {}

    /**
     * List all systems for the current company.
     */
    public function index(Request $request): JsonResponse
    {
        $this->authorize('permission', ['systems.manage']);

        $systems = System::where('company_id', $request->user()->company_id)
            ->orderBy('created_at', 'desc')
            ->get(['id', 'uuid', 'name', 'slug', 'description', 'status', 'environment', 'webhook_url', 'created_at']);

        return response()->json($systems);
    }

    /**
     * Create a new system.
     */
    public function store(Request $request): JsonResponse
    {
        $this->authorize('permission', ['systems.manage']);

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'webhook_url' => 'nullable|url',
            'webhook_secret' => 'nullable|string',
            'environment' => 'required|in:sandbox,production',
            'status' => 'required|in:active,inactive',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $slug = Str::slug($request->name);

        // Ensure slug is unique within the company
        $existingSlug = System::where('company_id', $request->user()->company_id)
            ->where('slug', $slug)
            ->exists();

        if ($existingSlug) {
            $slug .= '-' . Str::random(4);
        }

        $system = System::create([
            'company_id' => $request->user()->company_id,
            'name' => $request->name,
            'slug' => $slug,
            'description' => $request->description,
            'webhook_url' => $request->webhook_url,
            'webhook_secret_hash' => $request->webhook_secret
                ? hash('sha256', $request->webhook_secret)
                : null,
            'environment' => $request->environment,
            'status' => $request->status,
            'settings' => [],
        ]);

        $this->audit->log('system.created', $system);

        return response()->json($system, 201);
    }

    /**
     * Show a system.
     */
    public function show(System $system): JsonResponse
    {
        $this->authorize('permission', ['systems.manage']);
        return response()->json($system);
    }

    /**
     * Update a system.
     */
    public function update(Request $request, System $system): JsonResponse
    {
        $this->authorize('permission', ['systems.manage']);

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'webhook_url' => 'nullable|url',
            'webhook_secret' => 'nullable|string',
            'environment' => 'in:sandbox,production',
            'status' => 'in:active,inactive',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $request->only(['name', 'description', 'webhook_url', 'environment', 'status']);

        if ($request->has('webhook_secret')) {
            $data['webhook_secret_hash'] = hash('sha256', $request->webhook_secret);
        }

        if ($request->has('name')) {
            $data['slug'] = Str::slug($request->name);
        }

        $system->update($data);

        $this->audit->log('system.updated', $system);

        return response()->json($system);
    }

    /**
     * Delete a system.
     */
    public function destroy(System $system): JsonResponse
    {
        $this->authorize('permission', ['systems.manage']);

        $system->delete();

        $this->audit->log('system.deleted', $system);

        return response()->json(null, 204);
    }
}
