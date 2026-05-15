<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\Audit\AuditService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
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

        if (!$user || !Hash::check($data['password'], $user->password)) {
            return response()->json([
                'success' => false,
                'error' => [
                    'code' => 'invalid_credentials',
                    'message' => 'Email ou senha inválidos.',
                    'request_id' => $request->attributes->get('request_id'),
                ]
            ], 401);
        }

        if ($user->status !== 'active') {
            return response()->json([
                'success' => false,
                'error' => [
                    'code' => 'account_inactive',
                    'message' => 'Esta conta está inativa.',
                    'request_id' => $request->attributes->get('request_id'),
                ]
            ], 403);
        }

        $token = $user->createToken('dashboard-v1')->plainTextToken;

        return response()->json([
            'success' => true,
            'data' => [
                'token' => $token,
                'user'  => [
                    'id'    => $user->uuid,
                    'name'  => $user->name,
                    'email' => $user->email,
                    'role'  => $user->role,
                ],
            ]
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        $user = $request->user();
        return response()->json([
            'success' => true,
            'data' => [
                'id'    => $user->uuid,
                'name'  => $user->name,
                'email' => $user->email,
                'role'  => $user->role,
                'company_id' => $user->company_id,
            ]
        ]);
    }
}
