<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $event->titulo }} — Checkout</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <style>
        :root { --primary: #0ea5e9; --primary-hover: #0284c7; --primary-dark: #0369a1; --bg: #f0f9ff; --surface: #fff; --text: #0c4a6e; --muted: #64748b; --border: #e0f2fe; --success: #10b981; --warning: #f59e0b; }
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Plus Jakarta Sans', sans-serif; }
        body { background: var(--bg); min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 20px; background-image: radial-gradient(circle at 20% 80%, rgba(14,165,233,0.15) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(14,165,233,0.1) 0%, transparent 50%); }
        .card { background: var(--surface); border-radius: 24px; box-shadow: 0 25px 50px -12px rgba(14,165,233,0.25); max-width: 480px; width: 100%; overflow: hidden; border: 1px solid rgba(14,165,233,0.1); }
        .card-header { background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%); color: #fff; padding: 36px 28px; text-align: center; position: relative; overflow: hidden; }
        .card-header::before { content: ''; position: absolute; top: -50%; left: -50%; width: 200%; height: 200%; background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 60%); }
        .card-header h1 { font-size: 1.4rem; font-weight: 800; position: relative; }
        .card-header p { font-size: 0.85rem; opacity: 0.85; margin-top: 8px; position: relative; }
        .card-header .badge { display: inline-block; background: rgba(255,255,255,0.2); padding: 4px 12px; border-radius: 20px; font-size: 0.7rem; font-weight: 600; margin-top: 12px; backdrop-filter: blur(4px); }
        .card-body { padding: 32px; }
        .price { text-align: center; margin-bottom: 24px; }
        .price .amount { font-size: 2.8rem; font-weight: 800; color: var(--text); letter-spacing: -1px; }
        .price .label { font-size: 0.8rem; color: var(--muted); text-transform: uppercase; letter-spacing: 1px; font-weight: 600; }
        .vagas { display: flex; align-items: center; justify-content: center; gap: 10px; padding: 14px; background: linear-gradient(135deg, #ecfdf5, #d1fae5); border-radius: 12px; font-size: 0.9rem; color: #047857; font-weight: 700; margin-bottom: 24px; border: 1px solid rgba(16,185,129,0.2); }
        .vagas i { font-size: 1.1rem; }
        .form-group { margin-bottom: 18px; }
        .form-group label { display: block; font-size: 0.8rem; font-weight: 700; margin-bottom: 6px; color: var(--text); }
        .form-control { width: 100%; padding: 14px 16px; border: 2px solid var(--border); border-radius: 12px; font-size: 0.95rem; transition: all 0.25s; background: #f8fafc; }
        .form-control:focus { outline: none; border-color: var(--primary); box-shadow: 0 0 0 4px rgba(14,165,233,0.15); background: #fff; }
        .pay-options { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 24px; }
        .pay-opt { text-align: center; padding: 16px 8px; border: 2px solid var(--border); border-radius: 14px; cursor: pointer; transition: all 0.25s; background: #f8fafc; }
        .pay-opt:hover { border-color: var(--primary); transform: translateY(-2px); }
        .pay-opt.sel { border-color: var(--primary); background: linear-gradient(135deg, rgba(14,165,233,0.1), rgba(14,165,233,0.05)); box-shadow: 0 4px 12px rgba(14,165,233,0.2); }
        .pay-opt input { display: none; }
        .pay-opt i { font-size: 1.5rem; color: var(--primary); display: block; margin-bottom: 6px; }
        .pay-opt span { font-size: 0.75rem; font-weight: 700; color: var(--text); }
        .btn-pay { width: 100%; padding: 16px; background: linear-gradient(135deg, var(--primary), var(--primary-dark)); color: #fff; border: none; border-radius: 14px; font-size: 1.05rem; font-weight: 700; cursor: pointer; transition: all 0.3s; box-shadow: 0 4px 14px rgba(14,165,233,0.4); }
        .btn-pay:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(14,165,233,0.5); }
        .btn-pay:active { transform: translateY(0); }
        .error { background: linear-gradient(135deg, #fef2f2, #fee2e2); color: #b91c1c; padding: 14px; border-radius: 12px; font-size: 0.85rem; margin-bottom: 18px; border: 1px solid rgba(220,38,38,0.2); }
        .brand { text-align: center; margin-top: 20px; font-size: 0.75rem; color: #94a3b8; }
        .secure-icon { display: inline-flex; align-items: center; gap: 6px; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .card { animation: fadeIn 0.5s ease-out; }
    </style>
</head>
<body>
    <div class="card">
        <div class="card-header">
            <h1>{{ $event->titulo }}</h1>
            @if($event->descricao) <p>{{ $event->descricao }}</p> @endif
        </div>
        <div class="card-body">
            <div class="price">
                <div class="amount">R$ {{ number_format($event->valor, 2, ',', '.') }}</div>
                <div class="label">Valor do evento</div>
            </div>
            <div class="vagas">
                <i class="fas fa-ticket"></i> {{ $event->vagasRestantes() }} {{ $event->vagasRestantes() === 1 ? 'vaga restante' : 'vagas restantes' }}
            </div>

            @if($errors->any())
            <div class="error">
                @foreach($errors->all() as $e) <div>{{ $e }}</div> @endforeach
            </div>
            @endif

            <form action="{{ url("/evento/{$event->slug}/pay") }}" method="POST">
                @csrf
                <div class="form-group">
                    <label>Nome completo</label>
                    <input type="text" name="name" class="form-control" required value="{{ old('name') }}">
                </div>
                <div class="form-group">
                    <label>E-mail</label>
                    <input type="email" name="email" class="form-control" required value="{{ old('email') }}">
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                    <div class="form-group">
                        <label>CPF/CNPJ</label>
                        <input type="text" name="document" class="form-control" required value="{{ old('document') }}" id="doc">
                    </div>
                    <div class="form-group">
                        <label>Telefone</label>
                        <input type="text" name="phone" class="form-control" value="{{ old('phone') }}">
                    </div>
                </div>

                @if($event->metodo_pagamento === 'all')
                <label style="font-size: 0.8rem; font-weight: 600; display: block; margin-bottom: 8px;">Forma de Pagamento</label>
                <div class="pay-options">
                    <label class="pay-opt sel" onclick="selPay(this)"><input type="radio" name="billing_type" value="PIX" checked><i class="fas fa-qrcode"></i><span>PIX</span></label>
                    <label class="pay-opt" onclick="selPay(this)"><input type="radio" name="billing_type" value="BOLETO"><i class="fas fa-barcode"></i><span>Boleto</span></label>
                    <label class="pay-opt" onclick="selPay(this)"><input type="radio" name="billing_type" value="CREDIT_CARD"><i class="fas fa-credit-card"></i><span>Cartão</span></label>
                </div>
                @else
                <input type="hidden" name="billing_type" value="{{ strtoupper($event->metodo_pagamento) }}">
                @endif

                <button type="submit" class="btn-pay"><i class="fas fa-shield-halved"></i> Pagar Agora</button>
            </form>
            <div class="brand"><i class="fas fa-lock"></i> Pagamento 100% Seguro</div>
        </div>
    </div>
    <script>
        function selPay(el){document.querySelectorAll('.pay-opt').forEach(o=>o.classList.remove('sel'));el.classList.add('sel');el.querySelector('input').checked=true;}
        document.getElementById('doc')?.addEventListener('input',function(e){let v=e.target.value.replace(/\D/g,'');if(v.length<=11){v=v.replace(/(\d{3})(\d)/,'$1.$2');v=v.replace(/(\d{3})(\d)/,'$1.$2');v=v.replace(/(\d{3})(\d{1,2})$/,'$1-$2');}else{v=v.replace(/^(\d{2})(\d)/,'$1.$2');v=v.replace(/^(\d{2})\.(\d{3})(\d)/,'$1.$2.$3');v=v.replace(/\.(\d{3})(\d)/,'.$1/$2');v=v.replace(/(\d{4})(\d)/,'$1-$2');}e.target.value=v;});
    </script>
</body>
</html>
