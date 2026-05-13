<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Promoção Esgotada</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap" rel="stylesheet">
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Plus Jakarta Sans', sans-serif; }
        body { background: #fef2f2; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 20px; background-image: radial-gradient(circle at 30% 70%, rgba(239,68,68,0.1) 0%, transparent 50%); }
        .card { background: #fff; border-radius: 24px; box-shadow: 0 25px 50px -12px rgba(239,68,68,0.2); padding: 52px 36px; max-width: 480px; width: 100%; text-align: center; border: 1px solid rgba(239,68,68,0.1); }
        .icon { font-size: 5rem; color: #fca5a5; margin-bottom: 24px; animation: pulse 2s infinite; }
        @keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }
        h1 { font-size: 1.75rem; font-weight: 800; color: #7f1d1d; margin-bottom: 16px; }
        .desc { font-size: 1rem; color: #64748b; line-height: 1.6; margin-bottom: 32px; }
        .desc strong { color: #dc2626; font-weight: 700; }
        .btn-wa { display: inline-flex; align-items: center; gap: 12px; padding: 16px 32px; background: linear-gradient(135deg, #25d366, #128c7e); color: #fff; text-decoration: none; border-radius: 14px; font-size: 1.05rem; font-weight: 700; transition: all 0.3s; box-shadow: 0 8px 20px rgba(37,211,102,0.35); }
        .btn-wa:hover { transform: translateY(-3px); box-shadow: 0 12px 28px rgba(37,211,102,0.45); }
        .btn-wa i { font-size: 1.4rem; }
        .alt { margin-top: 20px; font-size: 0.85rem; color: #94a3b8; }
        .alt a { color: #6366f1; text-decoration: none; font-weight: 600; }
        .brand { margin-top: 32px; font-size: 0.75rem; color: #cbd5e1; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .card { animation: fadeIn 0.6s ease-out; }
    </style>
</head>
<body>
    <div class="card">
        <div class="icon"><i class="fas fa-circle-xmark"></i></div>
        <h1>Promoção Esgotada</h1>
        <p class="desc">
            O evento <strong>{{ $event->titulo }}</strong> atingiu o limite de vagas disponíveis no momento.
            @if($event->whatsapp_vendedor)<br><br>Entre em contato para verificar vagas extras ou novas turmas.@endif
        </p>
        @if($event->whatsapp_vendedor)
        <a href="https://wa.me/{{ $event->whatsapp_vendedor }}?text=Olá! Tenho interesse no evento '{{ $event->titulo }}' mas as vagas esgotaram. Há possibilidade de novas vagas?" target="_blank" class="btn-wa">
            <i class="fab fa-whatsapp"></i> Falar com Vendedor
        </a>
        @endif
        <p class="alt">Voltar para a <a href="/">página inicial</a></p>
        <div class="brand">Checkout Platform</div>
    </div>
</body>
</html>
