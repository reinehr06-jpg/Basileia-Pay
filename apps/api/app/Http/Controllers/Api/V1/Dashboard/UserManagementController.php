<?php

namespace App\Http\Controllers\Api\V1\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Role;
use App\Services\TenantContext;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Hash;

class UserManagementController extends Controller
{
    /**
     * Listar usuários da empresa.
     */
    public function index(Request $request): JsonResponse
    {
        $companyId = TenantContext::companyId();
        
        $users = User::whereHas('companies', function($q) use ($companyId) {
                $q->where('company_id', $companyId);
            })
            ->with(['roles' => function($q) use ($companyId) {
                $q->where('user_role_assignments.company_id', $companyId);
            }])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data'    => $users
        ]);
    }

    /**
     * Convidar um novo usuário.
     */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name'  => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'roles' => 'required|array',
            'roles.*' => 'exists:roles,slug',
        ]);

        $companyId = TenantContext::companyId();

        $user = User::create([
            'uuid'       => (string) Str::uuid(),
            'company_id' => $companyId, // default context
            'name'       => $data['name'],
            'email'      => $data['email'],
            'status'     => 'active',
            'password'   => Hash::make(Str::random(16)),
            'must_change_password' => true,
        ]);

        // Attach to company
        $user->companies()->attach($companyId, ['status' => 'active']);

        // Attach roles
        $roles = Role::whereIn('slug', $data['roles'])->get();
        foreach ($roles as $role) {
            $user->roles()->attach($role->id, ['company_id' => $companyId]);
        }

        return response()->json([
            'success' => true,
            'data'    => $user->load('roles')
        ], 201);
    }

    /**
     * Atualizar papel ou status do usuário.
     */
    public function update(string $uuid, Request $request): JsonResponse
    {
        $companyId = TenantContext::companyId();
        
        $user = User::whereHas('companies', function($q) use ($companyId) {
                $q->where('company_id', $companyId);
            })
            ->where('uuid', $uuid)
            ->firstOrFail();

        $data = $request->validate([
            'roles'  => 'sometimes|array',
            'roles.*' => 'exists:roles,slug',
            'status' => 'sometimes|in:active,inactive',
        ]);

        if (isset($data['status'])) {
            $user->update(['status' => $data['status']]);
            $user->companies()->updateExistingPivot($companyId, ['status' => $data['status']]);
        }

        if (isset($data['roles'])) {
            $roles = Role::whereIn('slug', $data['roles'])->get();
            
            // Detach existing roles for this company
            $user->roles()->wherePivot('company_id', $companyId)->detach();
            
            // Attach new ones
            foreach ($roles as $role) {
                $user->roles()->attach($role->id, ['company_id' => $companyId]);
            }
        }

        return response()->json([
            'success' => true,
            'data'    => $user->load('roles')
        ]);
    }

    /**
     * Remover um usuário.
     */
    public function destroy(string $uuid, Request $request): JsonResponse
    {
        $companyId = TenantContext::companyId();

        $user = User::whereHas('companies', function($q) use ($companyId) {
                $q->where('company_id', $companyId);
            })
            ->where('uuid', $uuid)
            ->firstOrFail();

        if ($user->id === $request->user()->id) {
            return response()->json(['error' => 'Você não pode remover a si mesmo.'], 403);
        }

        // Remove from company
        $user->companies()->detach($companyId);
        $user->roles()->wherePivot('company_id', $companyId)->detach();

        return response()->json(['success' => true]);
    }
    
    /**
     * Reset 2FA para o usuário.
     */
    public function reset2fa(string $uuid, Request $request): JsonResponse
    {
        $companyId = TenantContext::companyId();
        
        $user = User::whereHas('companies', function($q) use ($companyId) {
                $q->where('company_id', $companyId);
            })
            ->where('uuid', $uuid)
            ->firstOrFail();
            
        $user->update(['two_factor_enabled' => false]);
        $user->twoFactorSecretRel()->delete();
        
        return response()->json(['success' => true, 'message' => '2FA desabilitado.']);
    }
}
