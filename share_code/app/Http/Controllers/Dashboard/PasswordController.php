<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class PasswordController extends Controller
{
    public function showChangeForm()
    {
        return view('auth.change-password');
    }

    public function changePassword(Request $request)
    {
        $request->validate([
            'current_password' => 'required',
            'new_password' => ['required', 'string', 'min:12'],
            'new_password_confirmation' => 'required|same:new_password',
        ], [
            'new_password.min' => 'A senha deve ter pelo menos 12 caracteres.',
            'new_password.required' => 'A nova senha é obrigatória.',
            'new_password_confirmation.required' => 'A confirmação da senha é obrigatória.',
            'new_password_confirmation.same' => 'As senhas não conferem.',
        ]);

        $user = Auth::user();

        if (!Hash::check($request->current_password, $user->password)) {
            Log::warning('PasswordChange: Senha atual incorreta', [
                'user_id' => $user->id,
                'ip' => $request->ip(),
            ]);
            return back()->withErrors([
                'current_password' => 'A senha atual está incorreta.',
            ]);
        }

        $validacao = $this->validarSenhaForte($request->new_password);
        if (!$validacao['valida']) {
            return back()->withErrors([
                'new_password' => $validacao['mensagem'],
            ]);
        }

        $user->update([
            'password' => Hash::make($request->new_password),
            'must_change_password' => false,
            'password_changed_at' => now(),
        ]);

        Log::info('PasswordChange: Senha alterada com sucesso', [
            'user_id' => $user->id,
        ]);

        return redirect()->route('dashboard.index')
            ->with('success', 'Senha alterada com sucesso!');
    }

    public function validarSenhaForte(string $senha): array
    {
        $erros = [];

        if (strlen($senha) < 12) {
            $erros[] = 'Mínimo de 12 caracteres';
        }

        if (!preg_match('/[A-Z]/', $senha)) {
            $erros[] = 'pelo menos 1 letra maiúscula';
        }

        if (!preg_match('/[a-z]/', $senha)) {
            $erros[] = 'pelo menos 1 letra minúscula';
        }

        if (!preg_match('/[0-9]/', $senha)) {
            $erros[] = 'pelo menos 1 número';
        }

        if (!preg_match('/[!@#$%&*]/', $senha)) {
            $erros[] = 'pelo menos 1 caractere especial (!@#$%&*)';
        }

        if (!empty($erros)) {
            return [
                'valida' => false,
                'mensagem' => 'A senha deve conter: ' . implode(', ', $erros) . '.',
            ];
        }

        return ['valida' => true, 'mensagem' => 'Senha válida.'];
    }
}