<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login Elite - Checkout</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        :root {
            --primary: #4f46e5;
            --primary-light: #6366f1;
            --bg-dark: #0f172a;
            --text-muted: #94a3b8;
            --radius-xl: 16px;
        }
        body {
            margin: 0; padding: 0;
            background: linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%);
            min-height: 100vh;
            display: flex; align-items: center; justify-content: center;
            font-family: 'Inter', sans-serif;
            color: white;
            overflow: hidden;
        }
        .login-glass {
            background: rgba(255, 255, 255, 0.03);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: var(--radius-xl);
            padding: 40px;
            width: 100%;
            max-width: 400px;
            box-shadow: 0 40px 100px rgba(0,0,0,0.5);
            animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        
        .header h1 { font-size: 1.8rem; font-weight: 900; letter-spacing: -1.5px; margin: 0 0 4px 0; }
        .header h1 span { color: var(--primary-light); display: block; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 3px; margin-top: -4px; }
        .header p { color: var(--text-muted); font-size: 0.85rem; margin-bottom: 30px; }
        
        .form-group { margin-bottom: 20px; text-align: left; }
        .form-group label { font-size: 0.7rem; font-weight: 800; text-transform: uppercase; color: #64748b; letter-spacing: 1px; display: block; margin-bottom: 8px; }
        .form-control { 
            width: 100%; box-sizing: border-box; padding: 14px 16px; 
            background: rgba(255,255,255,0.05); 
            border: 1px solid rgba(255,255,255,0.1); 
            border-radius: 10px; color: white; font-size: 0.95rem; 
            transition: all 0.2s ease;
        }
        .form-control:focus { outline: none; border-color: var(--primary); background: rgba(255,255,255,0.08); }
        
        .btn { 
            width: 100%; padding: 15px; background: var(--primary); color: white; 
            border: none; border-radius: 12px; font-weight: 800; font-size: 0.95rem;
            cursor: pointer; transition: all 0.3s ease; 
            display: flex; align-items: center; justify-content: center; gap: 10px;
        }
        .btn:hover { background: var(--primary-light); transform: translateY(-1px); box-shadow: 0 10px 20px rgba(79, 70, 229, 0.3); }
        
        .footer { margin-top: 40px; text-align: center; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 24px; }
        .footer p { color: #64748b; font-size: 0.65rem; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; margin: 0; }
        
        .error-box { background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2); color: #f87171; border-radius: 10px; padding: 12px; margin-bottom: 24px; font-size: 0.8rem; font-weight: 600; }
    </style>
</head>
<body>
    <div class="login-glass">
        <div class="header">
            <h1>Checkout <span>Elite</span></h1>
            <p>Painel de Controle Restrito</p>
        </div>

        @if($errors->any())
            <div class="error-box">
                @foreach($errors->all() as $error)
                    <div style="margin-bottom: 4px;"><i class="fas fa-exclamation-circle" style="margin-right: 8px;"></i>{{ $error }}</div>
                @endforeach
            </div>
        @endif

        <form method="POST" action="{{ route('login.post') }}">
            @csrf
            <div class="form-group">
                <label>E-mail Corporativo</label>
                <input type="email" name="email" class="form-control" value="{{ old('email') }}" required autofocus placeholder="seu@email.com">
            </div>
            <div class="form-group">
                <label>Chave de Acesso</label>
                <input type="password" name="password" class="form-control" required placeholder="••••••••">
            </div>
            <button type="submit" class="btn">
                <span>Acessar Painel</span>
                <i class="fas fa-chevron-right"></i>
            </button>
        </form>

        <div class="footer">
            <p>Platform Elite &copy; {{ date('Y') }}</p>
        </div>
    </div>
</body>
</html>
