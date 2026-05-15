<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class UserSettingsController extends Controller
{
    public function index(): JsonResponse
    {
        $users = User::where('company_id', Auth::user()->company_id)->get();
        return response()->json($users);
    }

    public function invite(Request $request): JsonResponse
    {
        // Logic to send invite email and create user in invited status
        return response()->json(['status' => 'invited'], 201);
    }

    public function updateRole(Request $request, string $id): JsonResponse
    {
        $user = User::where('company_id', Auth::user()->company_id)
            ->where('id', $id)
            ->firstOrFail();

        $user->update(['role' => $request->role]);

        return response()->json($user);
    }

    public function destroy(string $id): JsonResponse
    {
        $user = User::where('company_id', Auth::user()->company_id)
            ->where('id', $id)
            ->firstOrFail();

        if ($user->id === Auth::id()) {
            return response()->json(['error' => 'Não é possível remover a si mesmo.'], 422);
        }

        $user->delete();

        return response()->json(['status' => 'removed']);
    }
}
