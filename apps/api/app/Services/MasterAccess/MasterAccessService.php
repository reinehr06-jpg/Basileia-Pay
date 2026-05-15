<?php

namespace App\Services\MasterAccess;

use App\Models\MasterAccessChallenge;
use App\Models\MasterSession;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Session;
use Carbon\Carbon;

class MasterAccessService
{
    /**
     * Generate a one-time challenge for master access.
     *
     * @return array{secure_url: string, ephemeral_secret: string, expires_in: int}
     */
    public function generateChallenge(string $allowedEmail, string $generatedBy): array
    {
        $rawToken = random_bytes(32);
        $tokenValue = rtrim(base64_encode($rawToken), '=');
        $tokenHash = hash('sha256', $tokenValue);

        $secret = $this->generateEphemeralSecret();
        $secretHash = password_hash($secret, PASSWORD_ARGON2ID);

        MasterAccessChallenge::create([
            'uuid'                      => Str::uuid(),
            'token_prefix'              => substr($tokenValue, 0, 8),
            'token_hash'                => $tokenHash,
            'ephemeral_secret_hash'     => $secretHash,
            'generated_by'              => $generatedBy,
            'generated_from_ip'         => request()->ip(),
            'generated_from_device_hash'=> $this->fingerprint(),
            'allowed_email'             => $allowedEmail,
            'status'                    => 'created',
            'expires_at'                => now()->addSeconds(30),
        ]);

        $secureUrl = "https://secure.basileia.global/{$tokenValue}";

        return [
            'secure_url'       => $secureUrl,
            'ephemeral_secret' => $secret,
            'expires_in'       => 30,
        ];
    }

    /**
     * Validate the one-time token and the ephemeral secret, then create a master session.
     *
     * @return array{session: \App\Models\MasterSession, token: string}
     */
    public function redeemToken(string $token, string $ephemeralSecret, string $email): ?array
    {
        $tokenHash = hash('sha256', $token);
        $challenge = MasterAccessChallenge::where('token_hash', $tokenHash)
            ->where('status', 'created')
            ->where('expires_at', '>', now())
            ->first();

        if (!$challenge) {
            return null;
        }

        // Verify secret
        if (!password_verify($ephemeralSecret, $challenge->ephemeral_secret_hash)) {
            $challenge->increment('failed_attempts');
            if ($challenge->failed_attempts >= 5) {
                $challenge->update(['status' => 'blocked']);
            }
            return null;
        }

        // Verify email allowed
        if (strtolower($email) !== strtolower($challenge->allowed_email)) {
            return null;
        }

        // Mark challenge consumed
        $challenge->update([
            'status'       => 'consumed',
            'consumed_at'  => now(),
        ]);

        // Create master session (1 hour exactly)
        $sessionToken = bin2hex(random_bytes(32));
        $sessionTokenHash = Hash::make($sessionToken);

        $session = MasterSession::create([
            'uuid'                      => Str::uuid(),
            'user_id'                   => null,
            'company_id'                => null,
            'session_token_hash'        => $sessionTokenHash,
            'ip_address'                => request()->ip(),
            'device_fingerprint_hash'   => $this->fingerprint(),
            'user_agent'                => request()->userAgent(),
            'started_at'                => now(),
            'expires_at'                => now()->addHour(),
            'last_seen_at'              => now(),
        ]);

        return [
            'session' => $session,
            'token' => $sessionToken,
        ];
    }

    /**
     * Validate master session token.
     */
    public function validateSession(string $sessionToken): ?MasterSession
    {
        $session = MasterSession::where('revoked_at', null)
            ->where('expires_at', '>', now())
            ->first();

        if (!$session) {
            return null;
        }

        // We could iterate over all sessions and verify hash, but for simplicity we'll look up by id? Actually we need to find by token hash; we'd have to check all. For demo, you could store tokens in cache, but spec says token_hash. We'll likely check by comparing hash with Hash::check for any active session. We'll find by iterating all active sessions. Not optimal but okay for low volume.
        $activeSessions = MasterSession::where('revoked_at', null)
            ->where('expires_at', '>', now())
            ->get();

        foreach ($activeSessions as $s) {
            if (Hash::check($sessionToken, $s->session_token_hash)) {
                // Update last_seen_at
                $s->update(['last_seen_at' => now()]);
                return $s;
            }
        }

        return null;
    }

    /**
     * Revoke a master session.
     */
    public function revokeSession(string $sessionToken): bool
    {
        $session = $this->validateSession($sessionToken);
        if ($session) {
            $session->update(['revoked_at' => now(), 'revoked_reason' => 'manual logout']);
            return true;
        }
        return false;
    }

    private function generateEphemeralSecret(): string
    {
        $chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        $groups = [];
        for ($i = 0; $i < 3; $i++) {
            $group = '';
            for ($j = 0; $j < 4; $j++) {
                $group .= $chars[random_int(0, strlen($chars) - 1)];
            }
            $groups[] = $group;
        }
        return implode('-', $groups);
    }

    private function fingerprint(): ?string
    {
        $data = request()->userAgent() . request()->ip();
        return hash('sha256', $data);
    }
}
