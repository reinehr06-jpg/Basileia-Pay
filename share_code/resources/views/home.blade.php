<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Basileia Secure - Checkout</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        :root {
            --primary: #7c3aed;
            --primary-light: #a78bfa;
            --primary-dark: #5b21b6;
            --bg-dark: #0f172a;
            --text-muted: #94a3b8;
            --radius-xl: 16px;
        }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Inter', sans-serif;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #2e1065 0%, #0f172a 100%);
            color: white;
        }
        .container {
            text-align: center;
            max-width: 500px;
            padding: 40px;
            animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        
        .logo {
            font-size: 2.5rem;
            font-weight: 900;
            letter-spacing: -2px;
            margin-bottom: 10px;
        }
        .logo span { color: var(--primary-light); }
        
        .subtitle {
            color: var(--text-muted);
            font-size: 1rem;
            margin-bottom: 40px;
        }
        
        .search-box {
            background: rgba(255, 255, 255, 0.05);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: var(--radius-xl);
            padding: 30px;
        }
        
        .search-box h2 {
            font-size: 1.2rem;
            font-weight: 600;
            margin-bottom: 20px;
            color: #e2e8f0;
        }
        
        .input-group {
            display: flex;
            gap: 10px;
        }
        
        .input-group input {
            flex: 1;
            padding: 14px 16px;
            background: rgba(255,255,255,0.05);
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 12px;
            color: white;
            font-size: 1rem;
            outline: none;
            transition: all 0.2s ease;
        }
        
        .input-group input:focus {
            border-color: var(--primary);
            background: rgba(255,255,255,0.08);
        }
        
        .input-group input::placeholder {
            color: #64748b;
        }
        
        .input-group button {
            padding: 14px 24px;
            background: var(--primary);
            color: white;
            border: none;
            border-radius: 12px;
            font-weight: 700;
            font-size: 0.9rem;
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .input-group button:hover {
            background: var(--primary-light);
            transform: translateY(-1px);
            box-shadow: 0 10px 20px rgba(124, 58, 237, 0.3);
        }
        
        .error-msg {
            background: rgba(239, 68, 68, 0.1);
            border: 1px solid rgba(239, 68, 68, 0.2);
            color: #f87171;
            border-radius: 12px;
            padding: 14px;
            margin-bottom: 20px;
            font-size: 0.9rem;
            font-weight: 500;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .footer {
            margin-top: 40px;
            color: #64748b;
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 1.5px;
        }
        
        .demo-links {
            margin-top: 30px;
            display: flex;
            flex-direction: column;
            gap: 10px;
        }
        
        .demo-links a {
            color: var(--primary-light);
            text-decoration: none;
            font-size: 0.85rem;
            transition: all 0.2s ease;
        }
        
        .demo-links a:hover {
            color: white;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">Basileia <span>Secure</span></div>
        <p class="subtitle">Plataforma de Pagamentos Corporativos</p>
        
        <div class="search-box">
            <h2><i class="fas fa-qrcode" style="margin-right: 10px;"></i>Acessar Checkout</h2>
            
            @if(isset($error))
                <div class="error-msg">
                    <i class="fas fa-exclamation-circle"></i>
                    {{ $error }}
                </div>
            @endif
            
            <form action="/" method="GET">
                <div class="input-group">
                    <input 
                        type="text" 
                        name="uuid" 
                        placeholder="Digite o código do checkout" 
                        value="{{ old('uuid') }}"
                        required
                    >
                    <button type="submit">
                        <i class="fas fa-search"></i>
                        Acessar
                    </button>
                </div>
            </form>
        </div>
        
        <div class="footer">
            Basileia Secure &copy; {{ date('Y') }}
        </div>
    </div>
</body>
</html>
