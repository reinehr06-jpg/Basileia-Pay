<?php

namespace App\Services\Security;

use PragmaRX\Google2FA\Google2FA;

class TwoFactorAuthService
{
    protected $google2fa;

    public function __construct()
    {
        $this->google2fa = new Google2FA();
    }

    /**
     * Gera um novo segredo 2FA para o usuário.
     */
    public function generateSecret(): string
    {
        return $this->google2fa->generateSecretKey();
    }

    /**
     * Gera a URL do QR Code para o usuário escanear.
     */
    public function getQrCodeUrl(string $company, string $email, string $secret): string
    {
        return $this->google2fa->getQRCodeUrl($company, $email, $secret);
    }

    /**
     * Valida o código TOTP informado pelo usuário.
     */
    public function verify(string $secret, string $code): bool
    {
        return $this->google2fa->verifyKey($secret, $code);
    }
}
