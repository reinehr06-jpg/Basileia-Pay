<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Alterar Senha - Checkout</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f5f5; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 20px; }
        .login-container { width: 100%; max-width: 420px; background: white; border-radius: 12px; padding: 40px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
        .login-header { text-align: center; margin-bottom: 32px; }
        .login-header h1 { font-size: 24px; color: #111827; margin-bottom: 8px; }
        .login-header p { color: #6b7280; font-size: 14px; }
        .alert { padding: 12px 16px; border-radius: 8px; margin-bottom: 20px; }
        .alert-success { background: #ecfdf5; border: 1px solid #10b981; color: #065f46; }
        .alert-danger { background: #fef2f2; border: 1px solid #ef4444; color: #991b1b; }
        .alert-warning { background: #fffbeb; border: 1px solid #f59e0b; color: #92400e; }
        .form-group { margin-bottom: 20px; }
        .form-group label { display: block; font-size: 14px; font-weight: 600; color: #374151; margin-bottom: 6px; }
        .form-group input { width: 100%; padding: 12px 16px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 16px; transition: border-color 0.2s, box-shadow 0.2s; }
        .form-group input:focus { outline: none; border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.1); }
        .form-group input.error { border-color: #ef4444; }
        .error-message { font-size: 12px; color: #dc2626; margin-top: 4px; }
        .password-requirements { background: #f3f4f6; padding: 12px; border-radius: 8px; margin-bottom: 20px; }
        .password-requirements h4 { font-size: 12px; font-weight: 600; color: #374151; margin-bottom: 8px; }
        .password-requirements ul { font-size: 12px; color: #6b7280; padding-left: 16px; margin: 0; }
        .password-requirements li { margin-bottom: 4px; }
        .password-requirements li.valid { color: #10b981; }
        .btn-submit { width: 100%; padding: 14px; background: #3b82f6; color: white; border: none; border-radius: 8px; font-size: 16px; font-weight: 600; cursor: pointer; transition: background 0.2s; }
        .btn-submit:hover { background: #2563eb; }
        .btn-submit:disabled { background: #9ca3af; cursor: not-allowed; }
    </style>
</head>
<body>
    <div class="login-container">
        <div class="login-header">
            <h1>Alterar Senha</h1>
            <p>Por segurança, você deve alterar sua senha no primeiro acesso.</p>
        </div>

        @if(session('success'))
            <div class="alert alert-success">{{ session('success') }}</div>
        @endif

        @if($errors->any())
            <div class="alert alert-danger">
                {{ $errors->first() }}
            </div>
        @endif

        <form method="POST" action="{{ route('password.change') }}">
            @csrf
            
            <div class="form-group">
                <label for="current_password">Senha Atual</label>
                <input type="password" id="current_password" name="current_password" required>
                @error('current_password')
                    <div class="error-message">{{ $message }}</div>
                @enderror
            </div>

            <div class="form-group">
                <label for="new_password">Nova Senha</label>
                <input type="password" id="new_password" name="new_password" required>
                @error('new_password')
                    <div class="error-message">{{ $message }}</div>
                @enderror
            </div>

            <div class="form-group">
                <label for="new_password_confirmation">Confirmar Nova Senha</label>
                <input type="password" id="new_password_confirmation" name="new_password_confirmation" required>
                @error('new_password_confirmation')
                    <div class="error-message">{{ $message }}</div>
                @enderror
            </div>

            <div class="password-requirements">
                <h4>Requisitos da senha:</h4>
                <ul>
                    <li id="req-length">Mínimo 12 caracteres</li>
                    <li id="req-upper">Pelo menos 1 letra maiúscula</li>
                    <li id="req-lower">Pelo menos 1 letra minúscula</li>
                    <li id="req-number">Pelo menos 1 número</li>
                    <li id="req-special">Pelo menos 1 caractere especial (!@#$%&*)</li>
                </ul>
            </div>

            <button type="submit" class="btn-submit">Alterar Senha</button>
        </form>
    </div>

    <script>
        const passwordInput = document.getElementById('new_password');
        const requirements = {
            length: document.getElementById('req-length'),
            upper: document.getElementById('req-upper'),
            lower: document.getElementById('req-lower'),
            number: document.getElementById('req-number'),
            special: document.getElementById('req-special')
        };

        passwordInput.addEventListener('input', function() {
            const password = this.value;
            
            // Check length
            requirements.length.classList.toggle('valid', password.length >= 12);
            
            // Check uppercase
            requirements.upper.classList.toggle('valid', /[A-Z]/.test(password));
            
            // Check lowercase
            requirements.lower.classList.toggle('valid', /[a-z]/.test(password));
            
            // Check number
            requirements.number.classList.toggle('valid', /[0-9]/.test(password));
            
            // Check special
            requirements.special.classList.toggle('valid', /[!@#$%&*]/.test(password));
        });
    </script>
</body>
</html>