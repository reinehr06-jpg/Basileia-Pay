<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\LoginAttempt;
use App\Models\User;
use App\Services\TwoFactorAuthService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    private const MAX_FAILED_ATTEMPTS = 5;
    private const LOCKOUT_MINUTES = 30;

    public function __construct(
        private TwoFactorAuthService $twoFactorService
    ) {}

    public function showLogin()
    {
        return view('auth.login');
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $email = $request->input('email');
        $password = $request->input('password');

        $user = User::where('email', $email)->first();

        if ($user) {
            if ($user->locked_until && now()->lessThan($user->locked_until)) {
                $minutes = now()->diffInMinutes($user->locked_until);
                
                $this->registrarTentativa($user, $request, false, 'Conta bloqueada');
                
                return back()->withErrors([
                    'email' => "Conta temporariamente bloqueada. Tente novamente em {$minutes} minutos.",
                ])->withInput();
            }

            if (!Hash::check($password, $user->password)) {
                $user->increment('failed_login_attempts');
                
                $totalTentativas = $user->failed_login_attempts;
                
                if ($totalTentativas >= self::MAX_FAILED_ATTEMPTS) {
                    $user->update([
                        'locked_until' => now()->addMinutes(self::LOCKOUT_MINUTES),
                        'failed_login_attempts' => 0,
                    ]);
                    
                    Log::warning('Login: Conta bloqueada por múltiplas tentativas', [
                        'user_id' => $user->id,
                        'ip' => $request->ip(),
                    ]);
                    
                    $this->registrarTentativa($user, $request, false, 'Bloqueado por tentativas');
                    
                    return back()->withErrors([
                        'email' => "Conta bloqueada após {$totalTentativas} tentativas falhas. Tente novamente em " . self::LOCKOUT_MINUTES . " minutos.",
                    ])->withInput();
                }
                
                $this->registrarTentativa($user, $request, false, 'Senha incorreta');
                
                return back()->withErrors([
                    'email' => "Credenciais inválidas. Você tem " . (self::MAX_FAILED_ATTEMPTS - $totalTentativas) . " tentativas restantes.",
                ])->withInput();
            }

            if ($user->status !== 'active') {
                $this->registrarTentativa($user, $request, false, 'Conta inativa');
                
                return back()->withErrors([
                    'email' => 'Esta conta está inativa. Entre em contato com o administrador.',
                ])->withInput();
            }

            Auth::login($user, $request->boolean('remember'));
            
            $user->update([
                'failed_login_attempts' => 0,
                'locked_until' => null,
            ]);
            
            $this->registrarTentativa($user, $request, true);
            
            Log::info('Login: Usuário logado com sucesso', [
                'user_id' => $user->id,
                'ip' => $request->ip(),
            ]);
            
            $request->session()->regenerate();

            if ($user->must_change_password) {
                return redirect()->route('password.change')
                    ->with('warning', 'Você deve alterar sua senha no primeiro acesso.');
            }

            if ($user->two_factor_enabled) {
                $request->session()->put('2fa_required', true);
                return redirect()->route('profile.2fa.verify');
            }

            return redirect()->intended(route('dashboard.index'));
        }

        $this->registrarTentativa(null, $request, false, 'Usuário não encontrado', $email);

        return back()->withErrors([
            'email' => 'Credenciais inválidas.',
        ])->withInput();
    }

    public function logout(Request $request)
    {
        Log::info('Logout: Usuário deslogado', [
            'user_id' => Auth::id(),
            'ip' => $request->ip(),
        ]);

        Auth::logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('login');
    }

    private function registrarTentativa(?User $user, Request $request, bool $success, ?string $motivo = null, ?string $email = null): void
    {
        try {
            LoginAttempt::create([
                'user_id' => $user?->id,
                'email' => $email ?? $request->input('email'),
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'success' => $success,
                'failure_reason' => $motivo,
                'created_at' => now(),
            ]);
        } catch (\Exception $e) {
            Log::error('LoginAttempt: Erro ao registrar tentativa', [
                'error' => $e->getMessage(),
            ]);
        }
    }
}