<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pagamento — {{ $event->titulo }}</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap" rel="stylesheet">
    <style>
        :root { --primary: #0ea5e9; --primary-dark: #0369a1; }
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Plus Jakarta Sans', sans-serif; }
        body { background: #f0f9ff; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 20px; background-image: radial-gradient(circle at 20% 80%, rgba(14,165,233,0.15) 0%, transparent 50%); }
        .card { background: #fff; border-radius: 24px; box-shadow: 0 25px 50px -12px rgba(14,165,233,0.25); max-width: 500px; width: 100%; overflow: hidden; border: 1px solid rgba(14,165,233,0.1); }
        .card-header { background: linear-gradient(135deg, var(--primary), var(--primary-dark)); color: #fff; padding: 32px; text-align: center; position: relative; }
        .card-header::before { content: ''; position: absolute; top: -30px; right: -30px; width: 100px; height: 100px; background: rgba(255,255,255,0.1); border-radius: 50%; }
        .card-header h1 { font-size: 1.3rem; font-weight: 800; position: relative; }
        .card-header .sub { font-size: 0.85rem; opacity: 0.85; margin-top: 6px; position: relative; }
        .card-body { padding: 32px; text-align: center; }
        .ok { font-size: 4rem; color: #10b981; margin-bottom: 20px; animation: pop 0.5s ease-out; }
        @keyframes pop { 0% { transform: scale(0); } 70% { transform: scale(1.1); } 100% { transform: scale(1); } }
        .amount { font-size: 2.4rem; font-weight: 800; color: #0c4a6e; margin-bottom: 24px; }
        .pix-code { background: linear-gradient(135deg, #f0f9ff, #e0f2fe); padding: 14px; border-radius: 12px; font-family: monospace; font-size: 0.75rem; word-break: break-all; margin: 16px 0; border: 1px solid #bae6fd; }
        .btn { padding: 12px 24px; background: linear-gradient(135deg, var(--primary), var(--primary-dark)); color: #fff; border: none; border-radius: 12px; cursor: pointer; font-weight: 700; font-size: 0.9rem; transition: all 0.3s; box-shadow: 0 4px 14px rgba(14,165,233,0.4); }
        .btn:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(14,165,233,0.5); }
        .link-btn { display: inline-flex; align-items: center; gap: 10px; padding: 14px 28px; background: linear-gradient(135deg, var(--primary), var(--primary-dark)); color: #fff; text-decoration: none; border-radius: 14px; font-weight: 700; margin: 16px 0; transition: all 0.3s; box-shadow: 0 4px 14px rgba(14,165,233,0.4); }
        .link-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(14,165,233,0.5); }
        .info { font-size: 0.9rem; color: #64748b; margin-top: 20px; line-height: 1.6; }
        .brand { text-align: center; margin-top: 24px; font-size: 0.75rem; color: #94a3b8; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .card { animation: fadeIn 0.5s ease-out; }
    </style>
</head>
<body>
    <div class="card">
        <div class="card-header">
            <h1>{{ $event->titulo }}</h1>
            <div class="sub">Pagamento gerado com sucesso!</div>
        </div>
        <div class="card-body">
            <div class="ok"><i class="fas fa-circle-check"></i></div>
            <div class="amount">R$ {{ number_format($event->valor, 2, ',', '.') }}</div>

            @if($billing_type === 'PIX')
                @if(isset($payment['encodedImage']))
                    <img src="data:image/png;base64,{{ $payment['encodedImage'] }}" alt="QR Code PIX" style="max-width: 220px; border-radius: 12px; margin-bottom: 16px; box-shadow: 0 4px 14px rgba(0,0,0,0.1);">
                @endif
                @if(isset($payment['payload']))
                    <div class="pix-code">{{ $payment['payload'] }}</div>
                    <button class="btn" onclick="navigator.clipboard.writeText('{{ $payment['payload'] }}'); this.innerHTML='<i class=\'fas fa-check\'></i> Copiado!'">
                        <i class="fas fa-copy"></i> Copiar código PIX
                    </button>
                @endif
                <p class="info">Escaneie o QR Code ou copie o código para pagar via PIX.<br>Pagamento instantâneo!</p>
            @elseif($billing_type === 'BOLETO')
                @if(isset($payment['bankSlipUrl']))
                    <a href="{{ $payment['bankSlipUrl'] }}" target="_blank" class="link-btn"><i class="fas fa-barcode"></i> Visualizar Boleto</a>
                @endif
                <p class="info">O boleto vence em 3 dias.<br>Confirmação em até 3 dias úteis após o pagamento.</p>
            @else
                @if(isset($payment['invoiceUrl']))
                    <a href="{{ $payment['invoiceUrl'] }}" target="_blank" class="link-btn"><i class="fas fa-credit-card"></i> Finalizar Pagamento</a>
                @endif
            @endif

            <div class="brand"><i class="fas fa-shield-halved"></i> Pagamento 100% Seguro</div>
        </div>
    </div>
</body>
</html>
