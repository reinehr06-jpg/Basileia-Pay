<?php

namespace App\Http\Controllers\Api\V1\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class UserManagementController extends Controller
{
    /**
     * Listar usuários da empresa.
     */
    public function index(Request $request): JsonResponse
    {
        $users = User::where('company_id', $request->user()->company_id)
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
            'role'  => 'required|in:owner,admin,finance,support,developer,viewer',
        ]);

        $user = User::create([
            'uuid'       => (string) Str::uuid(),
            'company_id' => $request->user()->company_id,
            'name'       => $data['name'],
            'email'      => $data['email'],
            'role'       => $data['role'],
            'status'     => 'active', // Em um cenário real, começaria como 'pending'
            'password'   => bcrypt(Str::random(16)),
        ]);

        return response()->json([
            'success' => true,
            'data'    => $user
        ], 201);
    }

    /**
     * Atualizar papel ou status do usuário.
     */
    public function update(string $uuid, Request $request): JsonResponse
    {
        $user = User::where('company_id', $request->user()->company_id)
            ->where('uuid', $uuid)
            ->firstOrFail();

        $data = $request->validate([
            'role'   => 'sometimes|in:owner,admin,finance,support,developer,viewer',
            'status' => 'sometimes|in:active,inactive',
        ]);

        $user->update($data);

        return response()->json([
            'success' => true,
            'data'    => $user
        ]);
    }

    /**
     * Remover um usuário.
     */
    public function destroy(string $uuid, Request $request): JsonResponse
    {
        $user = User::where('company_id', $request->user()->company_id)
            ->where('uuid', $uuid)
            ->firstOrFail();

        if ($user->id === $request->user()->id) {
            return response()->json(['error' => 'Você não pode remover a si mesmo.'], 403);
        }

        $user->delete();

        return response()->json(['success' => true]);
    }
}
