<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Erro - Checkout</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8fafc; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 20px; }
        .error-card { max-width: 500px; background: white; padding: 50px 40px; border-radius: 24px; box-shadow: 0 20px 40px rgba(0,0,0,0.08); text-align: center; }
        .error-icon { width: 80px; height: 80px; background: #fef2f2; color: #ef4444; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 2.5rem; margin: 0 auto 24px; }
        h1 { color: #1e293b; font-size: 1.5rem; font-weight: 800; margin-bottom: 12px; }
        p { color: #64748b; font-size: 1rem; line-height: 1.6; margin-bottom: 30px; }
        .btn { display: inline-block; background: #7c3aed; color: white; padding: 14px 28px; border-radius: 12px; font-weight: 700; text-decoration: none; transition: all 0.2s; }
        .btn:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(124, 58, 237, 0.3); }
    </style>
</head>
<body>
    <div class="error-card">
        <div class="error-icon">
            <i class="fas fa-exclamation-triangle"></i>
        </div>
        <h1>Ops! Algo deu errado</h1>
        <p>{{ $message ?? 'Não foi possível processar seu pagamento. Tente novamente ou entre em contato com o suporte.' }}</p>
        <a href="{{ url('/') }}" class="btn">Voltar ao Início</a>
    </div>
</body>
</html>