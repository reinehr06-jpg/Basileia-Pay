<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\TwoFactorAuthService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ProfileController extends Controller
{
    public function __construct(
        private TwoFactorAuthService $twoFactorService
    ) {}

    public function show2FASetup()
    {
        $user = Auth::user();

        if ($user->two_factor_enabled) {
            return redirect()->route('dashboard.index');
        }

        $secret = $this->twoFactorService->generateSecret();
        $user->update(['two_factor_secret' => $secret]);

        $qrCodeUrl = $this->twoFactorService->generateQRCodeUrl($user);

        return view('auth.2fa.setup', compact('qrCodeUrl', 'secret'));
    }

    public function enable2FA(Request $request)
    {
        $request->validate([
            'code' => 'required|digits:6',
        ]);

        $user = Auth::user();

        if ($this->twoFactorService->enable($user, $request->input('code'))) {
            Log::info('2FA enabled by user', ['user_id' => $user->id]);
            $request->session()->put('2fa_verified', true);
            return redirect()->route('dashboard.index')
                ->with('success', 'Autenticação de dois fatores ativada com sucesso!');
        }

        return back()->withErrors(['code' => 'Código inválido.']);
    }

    public function show2FAVerify()
    {
        return view('auth.2fa.verify');
    }

    public function verify2FA(Request $request)
    {
        $request->validate([
            'code' => 'required',
        ]);

        $user = Auth::user();

        if ($this->twoFactorService->verifyCode($user, $request->input('code')) ||
            $this->twoFactorService->verifyBackupCode($user, $request->input('code'))) {
            
            $request->session()->put('2fa_verified', true);
            Auth::login($user);
            return redirect()->intended(route('dashboard.index'));
        }

        return back()->withErrors(['code' => 'Código inválido.']);
    }

    public function show2FADisable()
    {
        return view('auth.2fa.disable');
    }

    public function disable2FA(Request $request)
    {
        $request->validate([
            'password' => 'required',
        ]);

        $user = Auth::user();

        if ($this->twoFactorService->disable($user, $request->input('password'))) {
            Log::info('2FA disabled by user', ['user_id' => $user->id]);
            return redirect()->route('dashboard.index')
                ->with('success', 'Autenticação de dois fatores desativada.');
        }

        return back()->withErrors(['password' => 'Senha incorreta.']);
    }
}