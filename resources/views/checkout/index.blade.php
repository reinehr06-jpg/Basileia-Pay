<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>{{ $transaction->description ?? 'Pagamento' }} - Basileia</title>
    <script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        :root {
            --primary: #7c3aed;
            --primary-dark: #5b21b6;
            --primary-light: #a78bfa;
            --bg-dark: #0f172a;
            --text-dark: #1e293b;
            --text-muted: #64748b;
            --border: #e2e8f0;
        }
        body {
            font-family: 'Inter', sans-serif;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
            background: linear-gradient(135deg, #0f0a1e 0%, #1a103c 50%, #2d1b69 100%);
        }
        .checkout-container {
            display: grid;
            grid-template-columns: 280px 380px;
            gap: 20px;
            max-width: 700px;
            width: 100%;
        }
        
        /* Card Valor - Roxo Escuro para Claro */
        .value-card {
            background: linear-gradient(135deg, #2e1065 0%, #4c1d95 50%, #7c3aed 100%);
            border-radius: 20px;
            padding: 30px 24px;
            color: white;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-align: center;
            position: relative;
            overflow: hidden;
            min-height: 320px;
        }
        .value-card::before {
            content: '';
            position: absolute;
            top: -30%;
            right: -30%;
            width: 150%;
            height: 150%;
            background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 50%);
            pointer-events: none;
        }
        .value-card-logo {
            width: 80px;
            height: 80px;
            background: white;
            border-radius: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 24px;
            box-shadow: 0 8px 24px rgba(0,0,0,0.2);
        }
        .value-card-logo img {
            width: 60px;
            height: 60px;
            object-fit: contain;
        }
        .value-card-logo span {
            font-size: 40px;
            font-weight: 900;
            color: var(--primary);
        }
        .value-card-plan {
            font-size: 14px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 1px;
            opacity: 0.9;
            margin-bottom: 8px;
        }
        .value-card-amount {
            font-size: 36px;
            font-weight: 800;
            margin-bottom: 4px;
        }
        .value-card-period {
            font-size: 13px;
            opacity: 0.8;
        }
        .value-card-features {
            margin-top: 24px;
            display: grid;
            gap: 8px;
        }
        .value-card-feature {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 12px;
            opacity: 0.9;
        }
        
        /* Card Pagamento - Cinza Prateado */
        .payment-card {
            background: linear-gradient(145deg, #f8fafc 0%, #e2e8f0 100%);
            border-radius: 20px;
            padding: 24px;
            position: relative;
        }
        
        /* Locale Switcher */
        .locale-switcher {
            position: absolute;
            top: 16px;
            right: 16px;
            z-index: 10;
        }
        .locale-switcher select {
            background: white;
            border: 1px solid var(--border);
            border-radius: 8px;
            padding: 6px 10px;
            font-size: 12px;
            cursor: pointer;
            color: var(--text-dark);
        }
        
        /* Cartão 3D Preto */
        .card-preview {
            width: 100%;
            height: 140px;
            border-radius: 12px;
            position: relative;
            margin-bottom: 20px;
            transition: all 0.3s ease;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            padding: 16px;
            color: white;
        }
        .card-preview.default {
            background: linear-gradient(135deg, #1e1e1e 0%, #2d2d2d 100%);
        }
        .card-preview.visa {
            background: linear-gradient(135deg, #1A1F71 0%, #2A3F91 100%);
        }
        .card-preview.mastercard {
            background: linear-gradient(135deg, #1e1e1e 0%, #2d2d2d 100%);
            position: relative;
        }
        .card-preview.mastercard::before {
            content: '';
            position: absolute;
            top: 50%;
            left: 20px;
            width: 30px;
            height: 30px;
            border-radius: 50%;
            background: #eb001b;
            transform: translateY(-50%);
        }
        .card-preview.mastercard::after {
            content: '';
            position: absolute;
            top: 50%;
            left: 40px;
            width: 30px;
            height: 30px;
            border-radius: 50%;
            background: #f79e1b;
            transform: translateY(-50%);
        }
        .card-preview.amex {
            background: linear-gradient(135deg, #0070d1 0%, #00a0f0 100%);
        }
        .card-preview.elo {
            background: linear-gradient(135deg, #0047BB 0%, #FFCB05 100%);
        }
        
        .card-chip {
            width: 36px;
            height: 28px;
            background: linear-gradient(135deg, #d4af37 0%, #f0d075 100%);
            border-radius: 4px;
        }
        .card-number {
            font-size: 18px;
            font-weight: 600;
            letter-spacing: 3px;
            text-shadow: 0 1px 2px rgba(0,0,0,0.3);
        }
        .card-details {
            display: flex;
            justify-content: space-between;
            font-size: 12px;
        }
        .card-holder-name {
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        
        /* Form */
        .form-group {
            margin-bottom: 12px;
        }
        .form-label {
            display: block;
            font-size: 11px;
            font-weight: 600;
            color: var(--text-muted);
            margin-bottom: 4px;
            text-transform: uppercase;
        }
        .form-input {
            width: 100%;
            height: 38px;
            border: 1px solid #cbd5e1;
            border-radius: 8px;
            padding: 0 12px;
            font-size: 14px;
            background: white;
            transition: border-color 0.2s;
        }
        .form-input:focus {
            outline: none;
            border-color: var(--primary);
        }
        .form-row {
            display: grid;
            grid-template-columns: 1fr 80px 60px;
            gap: 10px;
        }
        .cta-button {
            width: 100%;
            height: 44px;
            border: none;
            border-radius: 10px;
            background: var(--primary);
            color: white;
            font-size: 14px;
            font-weight: 700;
            cursor: pointer;
            margin-top: 16px;
            transition: background 0.2s;
        }
        .cta-button:hover {
            background: var(--primary-dark);
        }
        
        .security-footer {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
            font-size: 11px;
            color: var(--text-muted);
            margin-top: 16px;
        }
        
        @media (max-width: 720px) {
            .checkout-container {
                grid-template-columns: 1fr;
                max-width: 400px;
            }
            .value-card {
                min-height: 200px;
            }
        }
    </style>
</head>
<body
    x-data="{
        country: 'BR',
        cardNumber: '',
        cardHolder: '',
        cardExpiry: '',
        cardBrand: 'default',
        updateCard() {
            const num = this.cardNumber.replace(/\D/g, '');
            if (num.startsWith('4')) this.cardBrand = 'visa';
            else if (num.match(/^5[1-5]/)) this.cardBrand = 'mastercard';
            else if (num.match(/^3[47]/)) this.cardBrand = 'amex';
            else if (num.match(/^(4011|4312|4389|4514|4573|4576|5041|5066|5067|5090|6277|6362|6363|6504|6505|6507|6509|6516|6550)/)) this.cardBrand = 'elo';
            else this.cardBrand = 'default';
        },
        countries: [
            {code:'BR',name:'Brasil',flag:'🇧🇷'},{code:'US',name:'EUA',flag:'🇺🇸'},
            {code:'PT',name:'Portugal',flag:'🇵🇹'},{code:'ES',name:'Espanha',flag:'🇪🇸'}
        ]
    }"
>
    <div class="checkout-container">
        <!-- Card Valor -->
        <div class="value-card">
            <div class="value-card-logo">
                <img src="https://basileia.global/wp-content/uploads/2023/12/Design_sem_nome-1.png" alt="Basileia" onerror="this.style.display='none';this.nextElementSibling.style.display='block'">
                <span style="display:none">B</span>
            </div>
            <div class="value-card-plan">{{ $transaction->description ?? 'Plano Premium' }}</div>
            <div class="value-card-amount">R$ {{ number_format($transaction->amount, 2, ',', '.') }}</div>
            <div class="value-card-period">por mês</div>
            <div class="value-card-features">
                <div class="value-card-feature">
                    <i class="fas fa-check"></i> Acesso completo
                </div>
                <div class="value-card-feature">
                    <i class="fas fa-check"></i> Suporte 24h
                </div>
                <div class="value-card-feature">
                    <i class="fas fa-check"></i> Cancelamento fácil
                </div>
            </div>
        </div>
        
        <!-- Card Pagamento -->
        <div class="payment-card">
            <div class="locale-switcher">
                <select x-model="country">
                    <template x-for="c in countries" :key="c.code">
                        <option :value="c.code" x-text="c.flag + ' ' + c.name"></option>
                    </template>
                </select>
            </div>
            
            <!-- Cartão 3D -->
            <div class="card-preview" :class="cardBrand">
                <div class="card-chip"></div>
                <div class="card-number" x-text="cardNumber || '•••• •••• •••• ••••'"></div>
                <div class="card-details">
                    <div class="card-holder-name" x-text="cardHolder || 'NOME DO TITULAR'"></div>
                    <div x-text="cardExpiry || '••/••'"></div>
                </div>
            </div>
            
            <form method="POST" action="{{ route('checkout.process', $transaction->uuid) }}">
                @csrf
                <input type="hidden" name="payment_method" value="credit_card">
                
                <div class="form-group">
                    <label class="form-label">Email</label>
                    <input type="email" name="email" class="form-input" placeholder="seu@email.com" required>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Número do Cartão</label>
                    <input type="text" name="card_number" class="form-input" 
                        placeholder="0000 0000 0000 0000" maxlength="19" required
                        x-model="cardNumber"
                        @input="cardNumber = $event.target.value.replace(/\s+/g, '').replace(/(\d{4})/g, '$1 ').trim(); updateCard()">
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Mês</label>
                        <input type="text" name="card_expiry_month" class="form-input" placeholder="MM" maxlength="2" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Ano</label>
                        <input type="text" name="card_expiry_year" class="form-input" placeholder="AA" maxlength="2" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">CVC</label>
                        <input type="text" name="card_cvv" class="form-input" placeholder="123" maxlength="4" required>
                    </div>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Nome do Titular</label>
                    <input type="text" name="card_holder_name" class="form-input" placeholder="NOME COMPLETO" required
                        x-model="cardHolder">
                </div>
                
                <button type="submit" class="cta-button">
                    Pagar R$ {{ number_format($transaction->amount, 2, ',', '.') }}
                </button>
            </form>
            
            <div class="security-footer">
                <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/></svg>
                Pagamento 100% Seguro
            </div>
        </div>
    </div>
</body>
</html>
