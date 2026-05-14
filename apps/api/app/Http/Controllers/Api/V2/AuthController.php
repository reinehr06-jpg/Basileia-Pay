<?php

namespace App\Http\Controllers\Api\V2;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function login(Request $request): JsonResponse
    {
        $data = $request->validate([
            'email'    => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $data['email'])->first();

        if (! $user || ! Hash::check($data['password'], $user->password)) {
            return response()->json(['message' => 'Credenciais inválidas.'], 401);
        }

        if ($user->status !== 'active') {
            return response()->json(['message' => 'Conta inativa.'], 403);
        }

        if ($user->locked_until && now()->lessThan($user->locked_until)) {
            return response()->json(['message' => 'Conta temporariamente bloqueada.'], 423);
        }

        $user->update(['failed_login_attempts' => 0, 'locked_until' => null]);

        $token = $user->createToken('next-dashboard')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user'  => [
                'id'              => $user->id,
                'name'            => $user->name,
                'email'           => $user->email,
                'role'            => $user->role,
                'two_factor_enabled' => $user->two_factor_enabled,
                'company_id'      => $user->company_id,
            ],
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Deslogado com sucesso.']);
    }

    public function me(Request $request): JsonResponse
    {
        $user = $request->user()->load('company');
        return response()->json([
            'id'         => $user->id,
            'name'       => $user->name,
            'email'      => $user->email,
            'role'       => $user->role,
            'company_id' => $user->company_id,
            'company'    => $user->company?->only('id', 'name', 'logo_url'),
            'two_factor_enabled' => $user->two_factor_enabled,
        ]);
    }
}
