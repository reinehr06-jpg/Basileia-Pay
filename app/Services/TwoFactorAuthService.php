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
        return $this->generateBase32Secret(16);
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

        Log::debug('2FA verify attempt', [
            'user_id' => $user->id,
            'secret_length' => strlen($secret),
            'code_length' => strlen($code),
            'current_time' => $currentTime,
        ]);

        for ($i = -1; $i <= 1; $i++) {
            $timeSlot = floor(($currentTime + ($i * self::PERIOD)) / self::PERIOD);
            $expectedCode = $this->generateTOTP($secret, $timeSlot);

            Log::debug('2FA trying code', [
                'offset' => $i,
                'time_slot' => $timeSlot,
                'expected' => $expectedCode,
                'provided' => $code,
                'match' => ($expectedCode === $code),
            ]);

            if (hash_equals($expectedCode, $code)) {
                $user->update(['last_auth_at' => now()]);
                return true;
            }
        }

        Log::warning('2FA verification failed', ['user_id' => $user->id, 'code_provided' => $code]);
        return false;
    }

    public function verifyBackupCode(User $user, string $code): bool
    {
        if (!$user->two_factor_codes) {
            return false;
        }

        $codes = json_decode(Crypt::decryptString($user->two_factor_codes), true);
        $code = strtoupper(trim($code));

        foreach ($codes as $index => $storedCode) {
            if (strtoupper($storedCode) === $code) {
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
        
        $randomBytes = random_bytes($length);
        $bytes = unpack('C*', $randomBytes);
        
        foreach ($bytes as $byte) {
            $secret .= $chars[$byte % 32];
        }

        return $secret;
    }

    private function generateTOTP(string $secret, int $timeSlot): string
    {
        $secretKey = $this->base32Decode($secret);
        
        $timeBinary = pack('N', $timeSlot);
        $timeBinary = str_pad($timeBinary, 8, "\0", STR_PAD_LEFT);
        
        $hash = hash_hmac('sha1', $timeBinary, $secretKey, true);
        
        $offset = ord(substr($hash, -1)) & 0x0F;
        
        $binary = substr($hash, $offset, 4);
        $unpacked = unpack('N', $binary);
        $truncated = $unpacked[1] & 0x7FFFFFFF;
        
        $code = str_pad($truncated % pow(10, self::CODE_LENGTH), self::CODE_LENGTH, '0', STR_PAD_LEFT);
        
        return $code;
    }

    private function base32Decode(string $input): string
    {
        $alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
        
        $input = strtoupper(preg_replace('/[^A-Z2-7]/', '', $input));
        
        $output = '';
        $buffer = 0;
        $bitsLeft = 0;
        
        for ($i = 0; $i < strlen($input); $i++) {
            $char = $input[$i];
            $value = strpos($alphabet, $char);
            
            if ($value === false) {
                continue;
            }
            
            $buffer = ($buffer << 5) | $value;
            $bitsLeft += 5;
            
            while ($bitsLeft >= 8) {
                $bitsLeft -= 8;
                $output .= chr(($buffer >> $bitsLeft) & 0xFF);
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