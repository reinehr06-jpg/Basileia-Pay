<?php

namespace App\Http\Controllers\Api\V1\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Models\Permission;
use App\Services\TenantContext;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class RoleController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $companyId = TenantContext::companyId();
        
        $roles = Role::where('company_id', $companyId)
            ->orWhereNull('company_id') // system default roles
            ->with('permissions')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $roles
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $companyId = TenantContext::companyId();

        $data = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'permissions' => 'nullable|array',
            'permissions.*' => 'exists:permissions,slug',
        ]);

        $role = Role::create([
            'company_id' => $companyId,
            'name' => $data['name'],
            'slug' => Str::slug($data['name']) . '-' . uniqid(),
            'description' => $data['description'] ?? null,
        ]);

        if (!empty($data['permissions'])) {
            $permissions = Permission::whereIn('slug', $data['permissions'])->get();
            $role->permissions()->attach($permissions->pluck('id'));
        }

        return response()->json([
            'success' => true,
            'data' => $role->load('permissions')
        ], 201);
    }

    public function update(string $id, Request $request): JsonResponse
    {
        $companyId = TenantContext::companyId();
        
        $role = Role::where('company_id', $companyId)
            ->where('id', $id)
            ->firstOrFail();

        $data = $request->validate([
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'permissions' => 'nullable|array',
            'permissions.*' => 'exists:permissions,slug',
        ]);

        $updateData = [];
        if (isset($data['name'])) {
            $updateData['name'] = $data['name'];
        }
        if (array_key_exists('description', $data)) {
            $updateData['description'] = $data['description'];
        }

        if (!empty($updateData)) {
            $role->update($updateData);
        }

        if (isset($data['permissions'])) {
            $permissions = Permission::whereIn('slug', $data['permissions'])->get();
            $role->permissions()->sync($permissions->pluck('id'));
        }

        return response()->json([
            'success' => true,
            'data' => $role->load('permissions')
        ]);
    }

    public function destroy(string $id, Request $request): JsonResponse
    {
        $companyId = TenantContext::companyId();
        
        $role = Role::where('company_id', $companyId)
            ->where('id', $id)
            ->firstOrFail();

        $role->delete();

        return response()->json(['success' => true]);
    }

    public function permissions(): JsonResponse
    {
        $permissions = Permission::all()->groupBy('group');

        return response()->json([
            'success' => true,
            'data' => $permissions
        ]);
    }
}
