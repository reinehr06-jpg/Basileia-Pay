@php
    // Fallbacks para compatibilidade entre controladores
    $asaasPayment = $asaasPayment ?? ($asaasData ?? []);
    $plano = $plano ?? ($asaasPayment['description'] ?? 'Plano Premium');
    $ciclo = $ciclo ?? ($isSubscription ? 'recorrente' : 'pagamento único');
    $customerData = $customerData ?? [
        'name' => $transaction->customer_name ?? '',
        'email' => $transaction->customer_email ?? '',
        'phone' => $transaction->customer_phone ?? '',
        'document' => $transaction->customer_document ?? '',
        'address' => json_decode($transaction->customer_address ?? '{}', true)
    ];
@endphp
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>{{ $plano }} - Pagamento Basileia</title>
    <script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js"></script>
    <script src="/js/card-engine.js"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Share+Tech+Mono&display=swap" rel="stylesheet">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Inter', sans-serif;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #6b3fa0 100%);
            padding: 20px;
        }
        .main-card {
            width: 1100px;
            min-height: 650px;
            border-radius: 28px;
            overflow: hidden;
            background: #fff;
            box-shadow: 0 20px 60px rgba(80,40,140,0.12);
            display: grid;
            grid-template-columns: 49% 51%;
            position: relative;
        }
        .left-panel {
            background: linear-gradient(145deg, #5a1d9a 0%, #7b2ff7 50%, #9944dd 100%);
            padding: 40px 44px 30px;
            display: flex;
            flex-direction: column;
            position: relative;
            overflow: hidden;
        }
        .left-panel::before {
            content: '';
            position: absolute;
            top: -40%;
            right: -30%;
            width: 80%;
            height: 80%;
            background: radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%);
            pointer-events: none;
        }
        .brand {
            display: flex;
            align-items: center;
            gap: 14px;
            margin-bottom: 20px;
            position: relative;
            z-index: 2;
        }
        .brand-logo {
            width: 52px;
            height: 52px;
            border-radius: 12px;
            background: #fff;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
        }
        .brand-logo span { color: #7b2ff7; font-size: 26px; font-weight: 800; }
        .brand-text { color: #fff; font-size: 28px; font-weight: 700; }
        .plan-badge {
            display: inline-block;
            padding: 10px 24px;
            border-radius: 999px;
            background: rgba(255,255,255,0.18);
            color: #fff;
            font-size: 13px;
            font-weight: 600;
            letter-spacing: 0.8px;
            margin-bottom: 20px;
            width: fit-content;
            position: relative;
            z-index: 2;
        }
        .plan-title {
            color: #fff;
            font-size: 42px;
            font-weight: 700;
            line-height: 1.1;
            margin-bottom: 6px;
            position: relative;
            z-index: 2;
        }
        .price-row {
            display: flex;
            align-items: baseline;
            gap: 8px;
            color: #fff;
            margin-bottom: 30px;
            position: relative;
            z-index: 2;
        }
        .price-currency { font-size: 24px; font-weight: 500; }
        .price-value { font-size: 56px; font-weight: 800; line-height: 1; }
        .price-period { font-size: 15px; font-weight: 500; opacity: 0.85; text-transform: uppercase; letter-spacing: 0.5px; }
        .features {
            display: flex;
            flex-direction: column;
            gap: 18px;
            position: relative;
            z-index: 2;
            margin-bottom: auto;
        }
        .feature-item {
            display: grid;
            grid-template-columns: 30px 1fr;
            column-gap: 14px;
            align-items: start;
        }
        .feature-icon {
            width: 28px;
            height: 28px;
            border-radius: 50%;
            background: #54d28a;
            color: #fff;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 15px;
            font-weight: 700;
            margin-top: 2px;
        }
        .feature-title { color: #fff; font-size: 17px; font-weight: 600; }
        .feature-desc { color: rgba(255,255,255,0.82); font-size: 14px; margin-top: 2px; }
        .left-bottom {
            position: relative;
            z-index: 2;
            margin-top: auto;
            padding-top: 20px;
            border-top: 1px solid rgba(255,255,255,0.1);
        }
        .left-security-title { color: #fff; font-size: 18px; font-weight: 600; }
        .left-security-desc { color: rgba(255,255,255,0.8); font-size: 13px; margin-top: 4px; }
        .card-brands {
            display: flex;
            align-items: center;
            gap: 16px;
            background: rgba(255,255,255,0.92);
            padding: 10px 20px;
            border-radius: 10px;
            margin-top: 14px;
            width: fit-content;
        }
        .right-panel {
            background: #fbf8fc;
            padding: 36px 48px 24px;
            display: flex;
            flex-direction: column;
            position: relative;
        }
        .form-title { color: #221749; font-size: 26px; font-weight: 700; margin-bottom: 14px; }
        .payment-via {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 18px;
        }
        .payment-label { color: #817796; font-size: 13px; font-weight: 500; }
        .payment-chip {
            padding: 8px 16px;
            border-radius: 8px;
            background: linear-gradient(90deg, #7b35f4, #9b59b6);
            color: #fff;
            font-size: 12px;
            font-weight: 600;
        }
        .form-label { display: block; color: #43395d; font-size: 13px; font-weight: 500; margin-bottom: 6px; }
        .form-input {
            width: 100%;
            height: 44px;
            border: 1px solid #e1dbe9;
            border-radius: 10px;
            background: #fbf9fd;
            color: #2b2340;
            padding: 0 14px;
            font-size: 14px;
            font-family: 'Inter', sans-serif;
            transition: border-color 0.2s, box-shadow 0.2s;
        }
        .form-input::placeholder { color: #a99fbb; }
        .form-input:focus { outline: none; border-color: #7b2ff7; box-shadow: 0 0 0 3px rgba(123,47,247,0.08); }
        .form-input.input-error { border-color: #ef4444; box-shadow: 0 0 0 3px rgba(239,68,68,0.1); }
        .form-input.input-valid { border-color: #22c55e; box-shadow: 0 0 0 3px rgba(34,197,94,0.1); }
        .form-group { margin-bottom: 10px; }
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .cta-button {
            width: 100%;
            height: 48px;
            border: none;
            border-radius: 12px;
            background: linear-gradient(90deg, #7b2ff7, #a855f7);
            color: #fff;
            font-size: 15px;
            font-weight: 700;
            cursor: pointer;
            transition: transform 0.2s, box-shadow 0.2s, opacity 0.2s;
            box-shadow: 0 6px 16px rgba(123,47,247,0.25);
            margin-top: 8px;
            font-family: 'Inter', sans-serif;
        }
        .cta-button:hover { transform: translateY(-2px); box-shadow: 0 10px 24px rgba(123,47,247,0.35); }
        .cta-button:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
        .security-footer {
            display: flex;
            align-items: center;
            gap: 8px;
            color: #3ca95c;
            font-size: 13px;
            font-weight: 500;
            margin-top: 12px;
        }

        /* Card 3D */
        .card-scene {
            perspective: 1000px;
            width: 100%;
            max-width: 340px;
            height: 200px;
            margin: 0 auto 24px;
            cursor: pointer;
        }
        .card-inner {
            position: relative;
            width: 100%;
            height: 100%;
            transition: transform 0.7s cubic-bezier(0.4, 0.2, 0.2, 1);
            transform-style: preserve-3d;
        }
        .card-inner.is-flipped { transform: rotateY(180deg); }
        .card-face {
            position: absolute;
            width: 100%;
            height: 100%;
            backface-visibility: hidden;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        .card-front {
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            padding: 24px;
            color: #fff;
        }
        .card-back { transform: rotateY(180deg); display: flex; flex-direction: column; justify-content: center; }
        .card-back-bg { position: absolute; top: 0; left: 0; right: 0; bottom: 0; }
        .card-back-magnetic { height: 45px; background: rgba(0,0,0,0.6); margin-top: 30px; }
        .card-back-strip {
            height: 36px;
            background: rgba(255,255,255,0.9);
            margin: 16px 20px;
            border-radius: 6px;
            display: flex;
            align-items: center;
            justify-content: flex-end;
            padding: 0 16px;
        }
        .card-back-strip .cvc-display {
            font-family: 'Share Tech Mono', monospace;
            font-size: 18px;
            color: #333;
            letter-spacing: 3px;
            font-weight: 700;
        }
        .card-top-row { display: flex; justify-content: space-between; align-items: flex-start; }
        .card-chip {
            width: 45px;
            height: 34px;
            border-radius: 6px;
            background: linear-gradient(135deg, #f0c040, #d4a020);
            position: relative;
            overflow: hidden;
        }
        .card-chip::before {
            content: '';
            position: absolute;
            top: 50%; left: 0; right: 0;
            height: 1px;
            background: rgba(0,0,0,0.15);
        }
        .card-chip::after {
            content: '';
            position: absolute;
            left: 50%; top: 0; bottom: 0;
            width: 1px;
            background: rgba(0,0,0,0.15);
        }
        .card-contactless { width: 30px; height: 30px; opacity: 0.7; }
        .card-contactless svg { width: 100%; height: 100%; }
        .card-brand-logo { height: 36px; display: flex; align-items: center; }
        .card-brand-logo svg { height: 100%; width: auto; }
        .card-number-display {
            font-family: 'Share Tech Mono', monospace;
            font-size: 20px;
            letter-spacing: 3px;
            text-shadow: 0 1px 2px rgba(0,0,0,0.2);
            word-spacing: 8px;
        }
        .card-bottom-row { display: flex; justify-content: space-between; align-items: flex-end; }
        .card-holder-display {
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            opacity: 0.9;
            max-width: 200px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
        .card-holder-label {
            font-size: 8px;
            text-transform: uppercase;
            letter-spacing: 1px;
            opacity: 0.6;
            margin-bottom: 2px;
        }
        .card-expiry-display { text-align: right; }
        .card-expiry-label {
            font-size: 8px;
            text-transform: uppercase;
            letter-spacing: 1px;
            opacity: 0.6;
            margin-bottom: 2px;
        }
        .card-expiry-value {
            font-family: 'Share Tech Mono', monospace;
            font-size: 14px;
            letter-spacing: 1px;
        }
        .card-shine {
            position: absolute;
            top: 0; left: 0; right: 0; bottom: 0;
            background: linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 40%, rgba(255,255,255,0) 60%, rgba(255,255,255,0.05) 100%);
            pointer-events: none;
        }
        .card-pattern {
            position: absolute;
            top: 0; left: 0; right: 0; bottom: 0;
            opacity: 0.08;
            background-image: radial-gradient(circle at 20% 50%, rgba(255,255,255,0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.2) 0%, transparent 40%);
            pointer-events: none;
        }
        .brand-visa { background: linear-gradient(135deg, #1a1f71, #2b3990, #1a1f71); }
        .brand-mastercard { background: linear-gradient(135deg, #eb001b, #f79e1b); }
        .brand-amex { background: linear-gradient(135deg, #006fcf, #00a1e0); }
        .brand-elo { background: linear-gradient(135deg, #0047bb, #0066cc); }
        .brand-default { background: linear-gradient(135deg, #2d2d2d, #4a4a4a); }
        .card-scene:hover .card-inner { transform: rotateY(5deg) rotateX(-3deg); }
        .card-scene:hover .card-inner.is-flipped { transform: rotateY(185deg) rotateX(-3deg); }

        /* Pre-filled info */
        .customer-info {
            background: rgba(123, 47, 247, 0.08);
            border: 1px solid rgba(123, 47, 247, 0.15);
            border-radius: 12px;
            padding: 16px;
            margin-bottom: 20px;
        }
        .customer-info-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid rgba(123, 47, 247, 0.1);
        }
        .customer-info-row:last-child { border-bottom: none; }
        .customer-info-label { font-size: 12px; color: #817796; text-transform: uppercase; letter-spacing: 0.5px; }
        .customer-info-value { font-size: 14px; font-weight: 600; color: #221749; }

        @media (max-width: 768px) {
            .main-card { grid-template-columns: 1fr; width: 100%; min-height: auto; }
            .left-panel { padding: 30px 24px; }
            .right-panel { padding: 24px; }
            .plan-title { font-size: 32px; }
            .price-value { font-size: 40px; }
            .card-scene { max-width: 300px; height: 180px; }
        }
    </style>
</head>
<body
    x-data="{
        cardNumber: '',
        cardExpiry: '',
        cardCvv: '',
        cardHolder: '',
        detectedBrand: 'default',
        isFlipped: false,
        isProcessing: false,
        validationState: { number: '', expiry: '', cvv: '', holder: '' },
        formatCardNumber(value) {
            const digits = value.replace(/\\D/g, '').substring(0, 19);
            const groups = digits.match(/.{1,4}/g) || [];
            return groups.join(' ');
        },
        getDisplayNumber() {
            if (!this.cardNumber) return '•••• •••• •••• ••••';
            return this.formatCardNumber(this.cardNumber).padEnd(19, '•');
        },
        getDisplayExpiry() { return this.cardExpiry || 'MM/AA'; },
        getDisplayHolder() { return this.cardHolder ? this.cardHolder.toUpperCase() : 'FULL NAME'; },
        getDisplayCvv() { return this.cardCvv || '•••'; },
        handleCardNumberInput(e) {
            const raw = e.target.value.replace(/\\D/g, '').substring(0, 19);
            this.cardNumber = raw;
            e.target.value = this.formatCardNumber(raw);
            if (raw.length >= 6) {
                this.detectedBrand = this.detectBrand(raw);
                this.validationState.number = 'valid';
            } else {
                this.validationState.number = '';
            }
        },
        detectBrand(number) {
            const digits = number.replace(/\\D/g, '');
            if (/^4/.test(digits)) return 'visa';
            if (/^5[1-5]/.test(digits) || /^2[2-7]/.test(digits)) return 'mastercard';
            if (/^3[47]/.test(digits)) return 'amex';
            if (/^(636368|438935|504175|451416|636297|5067|4576|4011)/.test(digits)) return 'elo';
            return 'default';
        },
        handleExpiryInput(e) {
            let raw = e.target.value.replace(/\\D/g, '').substring(0, 4);
            if (raw.length >= 2) {
                raw = raw.substring(0, 2) + '/' + raw.substring(2);
            }
            this.cardExpiry = raw;
            e.target.value = raw;
            if (raw.length === 5) this.validationState.expiry = 'valid';
            else this.validationState.expiry = '';
        },
        handleCvvInput(e) {
            this.cardCvv = e.target.value.replace(/\\D/g, '').substring(0, 4);
            e.target.value = this.cardCvv;
            if (this.cardCvv.length >= 3) this.validationState.cvv = 'valid';
            else this.validationState.cvv = '';
        },
        handleHolderInput(e) {
            this.cardHolder = e.target.value;
            if (this.cardHolder.trim().length >= 3) this.validationState.holder = 'valid';
            else this.validationState.holder = '';
        },
        flipCard() { this.isFlipped = !this.isFlipped; },
        focusCvv() { this.isFlipped = true; },
        blurCvv() { this.isFlipped = false; },
        isFormValid() {
            return this.validationState.number === 'valid' &&
                   this.validationState.expiry === 'valid' &&
                   this.validationState.cvv === 'valid' &&
                   this.validationState.holder === 'valid';
        },
        async handleSubmit(e) {
            e.preventDefault();
            if (!this.isFormValid() || this.isProcessing) return;
            this.isProcessing = true;
            e.target.submit();
        }
    }"
>
    <section class="main-card">
        <div class="left-panel">
            <div class="brand">
                <div class="brand-logo"><span>B</span></div>
                <div class="brand-text">Basileia</div>
            </div>
            <div class="plan-badge">{{ strtoupper($ciclo) }}</div>
            <h1 class="plan-title">{{ $plano }}</h1>
            <div class="price-row">
                <span class="price-currency">R$</span>
                <span class="price-value">{{ number_format($transaction->amount, 2, ',', '.') }}</span>
                <span class="price-period">{{ $ciclo === 'anual' ? '/ano' : '/mês' }}</span>
            </div>
            <div class="features">
                <div class="feature-item">
                    <div class="feature-icon">✓</div>
                    <div>
                        <div class="feature-title">Acesso Completo</div>
                        <div class="feature-desc">Todos os recursos do plano</div>
                    </div>
                </div>
                <div class="feature-item">
                    <div class="feature-icon">✓</div>
                    <div>
                        <div class="feature-title">Renovação Automática</div>
                        <div class="feature-desc">Sem necessidade de ação manual</div>
                    </div>
                </div>
                <div class="feature-item">
                    <div class="feature-icon">✓</div>
                    <div>
                        <div class="feature-title">Suporte Prioritário</div>
                        <div class="feature-desc">Assistência dedicada</div>
                    </div>
                </div>
            </div>
            <div class="left-bottom">
                <div class="left-security-title">Pagamento 100% Seguro</div>
                <div class="left-security-desc">Seus dados são protegidos por criptografia SSL.</div>
                <div class="card-brands">
                    <svg viewBox="0 0 80 30"><rect width="80" height="30" rx="4" fill="#fff"/><text x="40" y="21" font-size="16" font-weight="bold" fill="#1A1F71" text-anchor="middle">VISA</text></svg>
                    <svg viewBox="0 0 80 30"><rect width="80" height="30" rx="4" fill="#fff"/><circle cx="30" cy="15" r="10" fill="#EB001B"/><circle cx="50" cy="15" r="10" fill="#F79E1B"/><path d="M40 7.5a10 10 0 0 1 0 15 10 10 0 0 1 0-15z" fill="#FF5F00"/></svg>
                    <svg viewBox="0 0 80 30"><rect width="80" height="30" rx="4" fill="#006FCF"/><text x="40" y="19" font-size="11" fill="#fff" text-anchor="middle" font-weight="bold">AMEX</text></svg>
                    <svg viewBox="0 0 60 30"><rect width="60" height="30" rx="4" fill="#FFCB05"/><text x="30" y="20" font-size="14" fill="#0047BB" text-anchor="middle" font-weight="bold">ELO</text></svg>
                </div>
            </div>
        </div>

        <div class="right-panel">
            <h2 class="form-title">Pagamento Seguro</h2>
            <div class="payment-via">
                <span class="payment-label">PAGAMENTO VIA:</span>
                <span class="payment-chip">{{ ($asaasPayment['billingType'] ?? '') === 'PIX' ? 'PIX' : 'CARTÃO DE CRÉDITO' }}</span>
            </div>

            <div class="customer-info">
                <div class="customer-info-row">
                    <span class="customer-info-label">Cliente</span>
                    <span class="customer-info-value">{{ $customerData['name'] }}</span>
                </div>
                <div class="customer-info-row">
                    <span class="customer-info-label">E-mail</span>
                    <span class="customer-info-value">{{ $customerData['email'] }}</span>
                </div>
                <div class="customer-info-row">
                    <span class="customer-info-label">Plano</span>
                    <span class="customer-info-value">{{ $plano }} - {{ $ciclo }}</span>
                </div>
            </div>

            @if(($asaasPayment['billingType'] ?? '') === 'PIX')
                <!-- Pix Flow -->
                <div style="text-align: center; margin-top: 10px;">
                    <div style="background: white; padding: 16px; border-radius: 20px; box-shadow: 0 4px 20px rgba(0,0,0,0.05); margin-bottom: 20px; display: inline-block;">
                        @if($pixData && !empty($pixData['encodedImage']))
                            <img src="data:image/png;base64,{{ $pixData['encodedImage'] }}" style="width: 180px; height: 180px; border-radius: 12px; display: block;">
                        @else
                            <div style="width: 180px; height: 180px; background: #f3f4f6; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: #9ca3af;">
                                <i class="fas fa-qrcode" style="font-size: 50px;"></i>
                            </div>
                        @endif
                    </div>

                    <p style="color: #43395d; font-size: 13px; margin-bottom: 16px; font-weight: 500;">Escaneie o QR Code ou copie o código abaixo.</p>

                    <div style="background: #fbf9fd; border: 1px solid #e1dbe9; border-radius: 10px; padding: 12px; margin-bottom: 16px; word-break: break-all; font-family: 'Share Tech Mono', monospace; font-size: 11px; color: #221749; text-align: left; max-height: 80px; overflow-y: auto;">
                        {{ $pixData['payload'] ?? 'Código Pix não disponível' }}
                    </div>

                    <button type="button" class="cta-button" onclick="navigator.clipboard.writeText('{{ $pixData['payload'] ?? '' }}'); const original = this.innerText; this.innerText = 'Copiado!'; setTimeout(() => this.innerText = original, 2000)">
                        <i class="fas fa-copy" style="margin-right: 8px;"></i> Copiar Código Pix
                    </button>

                    <div style="margin-top: 20px; display: flex; align-items: center; justify-content: center; gap: 8px; color: #10b981; font-size: 13px; font-weight: 600;">
                        <span style="width: 8px; height: 8px; background: #10b981; border-radius: 50%; display: inline-block; animation: pulse 1.5s infinite;"></span>
                        Aguardando pagamento...
                    </div>
                </div>
                
                <style>
                    @keyframes pulse {
                        0% { opacity: 0.4; transform: scale(1); }
                        50% { opacity: 1; transform: scale(1.2); }
                        100% { opacity: 0.4; transform: scale(1); }
                    }
                </style>

                <script>
                    setInterval(() => {
                        fetch(window.location.href)
                            .then(response => response.text())
                            .then(html => {
                                if (html.includes('success') || html.includes('aprovado')) {
                                    window.location.reload();
                                }
                            });
                    }, 5000);
                </script>
            @else
                <!-- Credit Card Flow -->
                <div class="card-scene" @click="flipCard()">
                    <div class="card-inner" :class="{ 'is-flipped': isFlipped }">
                        <div class="card-face card-front" :class="'brand-' + detectedBrand">
                            <div class="card-pattern"></div>
                            <div class="card-shine"></div>
                            <div class="card-top-row">
                                <div style="display:flex;align-items:center;gap:12px;">
                                    <div class="card-chip"></div>
                                    <div class="card-contactless">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" stroke-width="2">
                                            <path d="M8.5 16.5a5 5 0 0 1 0-9"/><path d="M12 19a8 8 0 0 0 0-14"/><path d="M15.5 21.5a11 11 0 0 0 0-19"/>
                                        </svg>
                                    </div>
                                </div>
                                <div class="card-brand-logo">
                                    <svg viewBox="0 0 80 30"><text x="40" y="20" font-size="14" font-weight="bold" fill="#fff" text-anchor="middle">VISA</text></svg>
                                </div>
                            </div>
                            <div class="card-number-display" x-text="getDisplayNumber()"></div>
                            <div class="card-bottom-row">
                                <div>
                                    <div class="card-holder-label">TITULAR</div>
                                    <div class="card-holder-display" x-text="getDisplayHolder()"></div>
                                </div>
                                <div class="card-expiry-display">
                                    <div class="card-expiry-label">VALIDADE</div>
                                    <div class="card-expiry-value" x-text="getDisplayExpiry()"></div>
                                </div>
                            </div>
                        </div>
                        <div class="card-face card-back brand-default">
                            <div class="card-back-bg"></div>
                            <div class="card-back-magnetic"></div>
                            <div class="card-back-strip">
                                <span class="cvc-display" x-text="getDisplayCvv()"></span>
                            </div>
                        </div>
                    </div>
                </div>

                <form method="POST" action="{{ route('basileia.checkout.process', $transaction->asaas_payment_id) }}" @submit="handleSubmit($event)">
                    @csrf
                    
                    <div class="form-group">
                        <label class="form-label">NÚMERO DO CARTÃO</label>
                        <input type="text" class="form-input" :class="validationState.number === 'valid' ? 'input-valid' : ''" 
                               placeholder="1234 5678 9012 3456" 
                               @input="handleCardNumberInput($event)"
                               required>
                    </div>

                    <div class="form-group">
                        <label class="form-label">NOME COMPLETO (ESCRITO NO CARTÃO)</label>
                        <input type="text" class="form-input" :class="validationState.holder === 'valid' ? 'input-valid' : ''"
                               placeholder="Nome como está no cartão"
                               @input="handleHolderInput($event)"
                               required>
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">EXPIRAÇÃO</label>
                            <input type="text" class="form-input" :class="validationState.expiry === 'valid' ? 'input-valid' : ''"
                                   placeholder="MM/AA"
                                   @input="handleExpiryInput($event)"
                                   @focus="focusCvv()"
                                   @blur="blurCvv()"
                                   required>
                        </div>
                        <div class="form-group">
                            <label class="form-label">CVV</label>
                            <input type="text" class="form-input" :class="validationState.cvv === 'valid' ? 'input-valid' : ''"
                                   placeholder="123"
                                   @input="handleCvvInput($event)"
                                   required>
                        </div>
                    </div>

                    <button type="submit" class="cta-button" :disabled="isProcessing">
                        <span x-show="!isProcessing">Pagar Agora</span>
                        <span x-show="isProcessing">Processando...</span>
                    </button>

                    <div class="security-footer">
                        <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/>
                        </svg>
                        Pagamento 100% Seguro
                    </div>
                </form>
            @endif
        </div>
    </section>
</body>
</html>