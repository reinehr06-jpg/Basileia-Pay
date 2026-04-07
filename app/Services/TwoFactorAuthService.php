<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;

class TwoFactorAuthService
{
    private const PERIOD = 30;
    private const CODE_LENGTH = 6;
    private const BACKUP_CODES_COUNT = 8;

    public function generateSecret(): string
    {
        return $this->generateBase32Secret(32);
    }

    public function generateQRCodeUrl(User $user): string
    {
        $secret = $user->two_factor_secret;
        $email = $user->email;
        $name = config('app.name', 'Checkout');

        return 'otpauth://totp/' . rawurlencode($name) . ':' . rawurlencode($email) . '?secret=' . $secret . '&issuer=' . rawurlencode($name) . '&algorithm=SHA1&digits=6&period=30';
    }

    public function verifyCode(User $user, string $code): bool
    {
        if (!$user->two_factor_secret) {
            return false;
        }

        $secret = $user->two_factor_secret;
        $currentTime = time();

        for ($i = -1; $i <= 1; $i++) {
            $time = $currentTime + ($i * self::PERIOD);
            $expectedCode = $this->generateTOTP($secret, $time);

            if (hash_equals($expectedCode, $code)) {
                $user->update(['last_auth_at' => now()]);
                return true;
            }
        }

        return false;
    }

    public function verifyBackupCode(User $user, string $code): bool
    {
        if (!$user->two_factor_codes) {
            return false;
        }

        $codes = json_decode(Crypt::decryptString($user->two_factor_codes), true);
        $code = trim($code);

        foreach ($codes as $index => $storedCode) {
            if (hash_equals($storedCode, $code)) {
                unset($codes[$index]);
                $user->update([
                    'two_factor_codes' => Crypt::encryptString(json_encode(array_values($codes)))
                ]);
                return true;
            }
        }

        return false;
    }

    public function enable(User $user, string $code): bool
    {
        if ($this->verifyCode($user, $code)) {
            $user->update([
                'two_factor_enabled' => true,
                'two_factor_codes' => Crypt::encryptString(json_encode($this->generateBackupCodes()))
            ]);
            Log::info('2FA enabled', ['user_id' => $user->id]);
            return true;
        }
        return false;
    }

    public function disable(User $user, string $password): bool
    {
        if (!Hash::check($password, $user->password)) {
            return false;
        }

        $user->update([
            'two_factor_enabled' => false,
            'two_factor_secret' => null,
            'two_factor_codes' => null
        ]);
        Log::info('2FA disabled', ['user_id' => $user->id]);
        return true;
    }

    public function needsReauth(User $user): bool
    {
        if (!$user->last_auth_at) {
            return true;
        }

        return $user->last_auth_at->diffInDays(now()) >= 30;
    }

    private function generateBase32Secret(int $length): string
    {
        $chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
        $secret = '';
        $bytes = random_bytes($length);

        foreach (str_split($bytes) as $byte) {
            $secret .= $chars[ord($byte) % 32];
        }

        return $secret;
    }

    private function generateTOTP(string $secret, ?int $time = null): string
    {
        $time = $time ?? time();
        $time = str_pad(pack('N', $time), 8, "\0", STR_PAD_LEFT);

        $secretKey = $this->base32Decode($secret);
        $hash = hash_hmac('sha1', $time, $secretKey, true);

        $offset = ord(substr($hash, -1)) & 0x0F;
        $truncated = unpack('N', substr($hash, $offset, 4))[1];
        $truncated = $truncated & 0x7FFFFFFF;

        return str_pad($truncated % 1000000, 6, '0', STR_PAD_LEFT);
    }

    private function base32Decode(string $input): string
    {
        $chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
        $input = strtoupper($input);
        $output = '';

        $chars = str_split($chars);
        $chars = array_flip($chars);

        $input = str_split($input);
        $buffer = 0;
        $bitsLeft = 0;

        foreach ($input as $char) {
            if (!isset($chars[$char])) {
                continue;
            }
            $buffer = ($buffer << 5) | $chars[$char];
            $bitsLeft += 5;

            if ($bitsLeft >= 8) {
                $output .= chr(($buffer >> ($bitsLeft - 8)) & 0xFF);
                $bitsLeft -= 8;
            }
        }

        return $output;
    }

    private function generateBackupCodes(): array
    {
        $codes = [];
        for ($i = 0; $i < self::BACKUP_CODES_COUNT; $i++) {
            $codes[] = strtoupper(bin2hex(random_bytes(4)));
        }
        return $codes;
    }
}