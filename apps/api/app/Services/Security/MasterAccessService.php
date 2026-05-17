<?php

namespace App\Services\Security;

use App\Models\User;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class MasterAccessService
{
    /**
     * Gera um token de entrada master de uso único.
     */
    public function generateEntryToken(): string
    {
        $token = 'master_' . Str::random(64);
        
        // Cache de 15 minutos para a entrada inicial
        Cache::put("master_entry_{$token}", true, now()->addMinutes(15));

        return $token;
    }

    /**
     * Valida o token de entrada e remove após uso.
     */
    public function validateAndConsumeToken(string $token): bool
    {
        if (Cache::has("master_entry_{$token}")) {
            Cache::forget("master_entry_{$token}");
            return true;
        }
        return false;
    }

    /**
     * Cria uma sessão master segura (1 hora).
     */
    public function createMasterSession(User $user, string $ip, string $userAgent): string
    {
        $sessionToken = Str::random(128);
        
        $data = [
            'user_id' => $user->id,
            'ip' => $ip,
            'ua' => $userAgent,
            'created_at' => now(),
            'expires_at' => now()->addHour(),
        ];

        Cache::put("master_session_{$sessionToken}", $data, now()->addHour());

        return $sessionToken;
    }

    /**
     * Valida se a sessão master ainda é válida e se o contexto não mudou.
     */
    public function validateMasterSession(string $token, string $ip, string $userAgent): bool
    {
        $data = Cache::get("master_session_{$token}");

        if (!$data) return false;

        if (now()->isAfter($data['expires_at'])) {
            Cache::forget("master_session_{$token}");
            return false;
        }

        // Validação de IP e UA rigorosa para Master
        if ($data['ip'] !== $ip || $data['ua'] !== $userAgent) {
            Cache::forget("master_session_{$token}");
            return false;
        }

        return true;
    }
}
