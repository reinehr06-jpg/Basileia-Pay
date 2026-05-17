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

        $tokenInstance = $user->createToken('dashboard-v1');
        $token = $tokenInstance->plainTextToken;

        // Registrar Sessão Segura
        \Illuminate\Support\Facades\DB::table('user_sessions')->insert([
            'user_id' => $user->id,
            'token_id' => $tokenInstance->accessToken->id,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

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

    public function forgotPassword(Request $request, \App\Services\Security\PasswordResetService $resetService): JsonResponse
    {
        $request->validate(['email' => 'required|email']);
        
        $user = User::where('email', $request->email)->first();
        
        if ($user) {
            $token = $resetService->createToken($user);
            // In a real scenario, send email here.
            // Log::info("Reset token for {$user->email}: {$token}");
        }

        // Resposta genérica obrigatória para evitar enumeração de usuários
        return response()->json([
            'success' => true,
            'message' => 'Se este e-mail estiver cadastrado, enviaremos instruções para redefinir sua senha.'
        ]);
    }

    public function resetPassword(Request $request, \App\Services\Security\PasswordResetService $resetService): JsonResponse
    {
        $request->validate([
            'email' => 'required|email',
            'token' => 'required|string',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $success = $resetService->reset($request->email, $request->token, $request->password);

        if (!$success) {
            return response()->json([
                'success' => false,
                'error' => [
                    'code' => 'invalid_or_expired_token',
                    'message' => 'Este link de redefinição expirou ou já foi utilizado.'
                ]
            ], 400);
        }

        return response()->json([
            'success' => true,
            'message' => 'Senha redefinida com sucesso.'
        ]);
    }
}
