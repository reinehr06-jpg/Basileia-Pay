<?php

namespace App\Services\Security;

use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;

class PasswordResetService
{
    /**
     * Cria um token de reset para o usuário.
     */
    public function createToken(User $user): string
    {
        $token = Str::random(64);
        
        // Laravel default password_resets table usage (standard way)
        DB::table('password_reset_tokens')->updateOrInsert(
            ['email' => $user->email],
            [
                'token' => Hash::make($token),
                'created_at' => now()
            ]
        );

        return $token;
    }

    /**
     * Valida um token de reset.
     */
    public function validateToken(string $email, string $token): bool
    {
        $record = DB::table('password_reset_tokens')->where('email', $email)->first();

        if (!$record) return false;

        // Verifica expiração (60 minutos)
        if (now()->parse($record->created_at)->addMinutes(60)->isPast()) {
            return false;
        }

        return Hash::check($token, $record->token);
    }

    /**
     * Reseta a senha do usuário.
     */
    public function reset(string $email, string $token, string $password): bool
    {
        if (!$this->validateToken($email, $token)) {
            return false;
        }

        $user = User::where('email', $email)->first();
        if (!$user) return false;

        $user->update([
            'password' => Hash::make($password)
        ]);

        // Invalidar token após uso
        DB::table('password_reset_tokens')->where('email', $email)->delete();

        // Invalidar sessões (opcional, dependendo da política)
        $user->tokens()->delete();

        return true;
    }
}
