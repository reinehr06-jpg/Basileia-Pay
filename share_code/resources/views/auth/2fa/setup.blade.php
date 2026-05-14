<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ativar 2FA - Basileia Secure</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        :root {
            --primary: #7c3aed;
            --primary-light: #a78bfa;
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
            max-width: 420px;
            box-shadow: 0 40px 100px rgba(0,0,0,0.5);
        }
        .header h1 { font-size: 1.4rem; font-weight: 900; letter-spacing: -1px; margin: 0 0 8px 0; }
        .header p { color: var(--text-muted); font-size: 0.85rem; margin-bottom: 30px; }
        
        .qr-container { text-align: center; margin-bottom: 24px; }
        .qr-container img { border-radius: 12px; border: 2px solid rgba(255,255,255,0.1); }
        
        .alert {
            background: rgba(59, 130, 246, 0.1);
            border: 1px solid rgba(59, 130, 246, 0.2);
            border-radius: 10px;
            padding: 16px;
            margin-bottom: 24px;
            text-align: left;
        }
        .alert strong { color: #60a5fa; font-size: 0.8rem; }
        .alert small { color: var(--text-muted); font-size: 0.75rem; display: block; margin-top: 8px; }
        
        .form-group { margin-bottom: 20px; text-align: left; }
        .form-group label { font-size: 0.7rem; font-weight: 800; text-transform: uppercase; color: #64748b; letter-spacing: 1px; display: block; margin-bottom: 8px; }
        .form-control { 
            width: 100%; box-sizing: border-box; padding: 14px 16px; 
            background: rgba(255,255,255,0.05); 
            border: 1px solid rgba(255,255,255,0.1); 
            border-radius: 10px; color: white; font-size: 1rem; text-align: center;
            letter-spacing: 4px; font-weight: 700;
            transition: all 0.2s ease;
        }
        .form-control:focus { outline: none; border-color: var(--primary); background: rgba(255,255,255,0.08); }
        
        .btn { 
            width: 100%; padding: 15px; background: var(--primary); color: white; 
            border: none; border-radius: 12px; font-weight: 800; font-size: 0.95rem;
            cursor: pointer; transition: all 0.3s ease; 
            display: flex; align-items: center; justify-content: center; gap: 10px;
        }
        .btn:hover { background: var(--primary-light); transform: translateY(-1px); box-shadow: 0 10px 20px rgba(124, 58, 237, 0.3); }
        
        .error-box { background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2); color: #f87171; border-radius: 10px; padding: 12px; margin-bottom: 24px; font-size: 0.8rem; font-weight: 600; }
    </style>
</head>
<body>
    <div class="card">
        <div class="header">
            <h1><i class="fas fa-shield-alt"></i> Autenticação 2FA</h1>
            <p>Configure a autenticação de dois fatores</p>
        </div>

        @if($errors->any())
            <div class="error-box">
                @foreach($errors->all() as $error)
                    <div style="margin-bottom: 4px;"><i class="fas fa-exclamation-circle" style="margin-right: 8px;"></i>{{ $error }}</div>
                @endforeach
            </div>
        @endif

        <div class="qr-container" style="background: white; padding: 20px; border-radius: 12px; display: inline-block; margin-bottom: 24px;">
            {!! QrCode::size(200)->generate($qrCodeUrl) !!}
        </div>
        
        <div class="alert">
            <strong>Chave secreta:</strong> {{ $secret }}<br>
            <small>Caso não seja possível escanear, insira esta chave manualmente no seu aplicativo de autenticação.</small>
        </div>
        
        <form method="POST" action="{{ route('profile.2fa.enable') }}">
            @csrf
            <div class="form-group">
                <label>Código de 6 dígitos</label>
                <input type="text" name="code" class="form-control" 
                       maxlength="6" pattern="[0-9]*" inputmode="numeric" required autofocus
                       placeholder="000000">
            </div>
            
            <button type="submit" class="btn">
                <i class="fas fa-check"></i>
                <span>Ativar Autenticação</span>
            </button>
        </form>
    </div>
</body>
</html>