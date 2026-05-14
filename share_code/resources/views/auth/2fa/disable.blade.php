<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Desativar 2FA - Basileia Secure</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        :root {
            --primary: #7c3aed;
            --primary-light: #a78bfa;
            --danger: #ef4444;
            --bg-dark: #0f172a;
            --text-muted: #94a3b8;
            --radius-xl: 16px;
        }
        body {
            margin: 0; padding: 0;
            background: linear-gradient(135deg, #2e1065 0%, #0f172a 100%);
            min-height: 100vh;
            display: flex; align-items: center; justify-content: center;
            font-family: 'Inter', sans-serif;
            color: white;
        }
        .card {
            background: rgba(255, 255, 255, 0.03);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: var(--radius-xl);
            padding: 40px;
            width: 100%;
            max-width: 400px;
            box-shadow: 0 40px 100px rgba(0,0,0,0.5);
        }
        .header h1 { font-size: 1.4rem; font-weight: 900; letter-spacing: -1px; margin: 0 0 8px 0; }
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
            width: 100%; padding: 15px; background: var(--danger); color: white; 
            border: none; border-radius: 12px; font-weight: 800; font-size: 0.95rem;
            cursor: pointer; transition: all 0.3s ease; 
            display: flex; align-items: center; justify-content: center; gap: 10px;
            margin-bottom: 12px;
        }
        .btn:hover { background: #f87171; transform: translateY(-1px); box-shadow: 0 10px 20px rgba(239, 68, 68, 0.3); }
        
        .btn-secondary {
            background: transparent;
            border: 1px solid rgba(255,255,255,0.2);
        }
        .btn-secondary:hover { background: rgba(255,255,255,0.05); box-shadow: none; }
        
        .error-box { background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2); color: #f87171; border-radius: 10px; padding: 12px; margin-bottom: 24px; font-size: 0.8rem; font-weight: 600; }
    </style>
</head>
<body>
    <div class="card">
        <div class="header">
            <h1><i class="fas fa-shield-alt"></i> Desativar 2FA</h1>
            <p>Para desativar, insira sua senha</p>
        </div>

        @if($errors->any())
            <div class="error-box">
                @foreach($errors->all() as $error)
                    <div style="margin-bottom: 4px;"><i class="fas fa-exclamation-circle" style="margin-right: 8px;"></i>{{ $error }}</div>
                @endforeach
            </div>
        @endif

        <form method="POST" action="{{ route('profile.2fa.disable.post') }}">
            @csrf
            <div class="form-group">
                <label>Senha atual</label>
                <input type="password" name="password" class="form-control" required placeholder="••••••••">
            </div>
            
            <button type="submit" class="btn">
                <i class="fas fa-times"></i>
                <span>Desativar 2FA</span>
            </button>
            <a href="{{ route('dashboard.index') }}" class="btn btn-secondary">
                <span>Cancelar</span>
            </a>
        </form>
    </div>
</body>
</html>