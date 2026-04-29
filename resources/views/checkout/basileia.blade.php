<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>{{ $plano }} - Basileia Checkout</title>
    
    <!-- Fonts & Icons -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@500&display=swap" rel="stylesheet">
    <script src="https://unpkg.com/lucide@latest"></script>
    <script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js"></script>

    <style>
        :root {
            --primary: #7c3aed;
            --primary-dark: #6d28d9;
            --primary-light: #a78bfa;
            --accent: #10b981;
            --bg-deep: #0f0a1e;
            --card-bg: #ffffff;
            --text-main: #1f2937;
            --text-muted: #6b7280;
            --border-color: #e5e7eb;
            --glass-bg: rgba(255, 255, 255, 0.05);
            --glass-border: rgba(255, 255, 255, 0.1);
        }

        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        body {
            font-family: 'Inter', sans-serif;
            background-color: var(--bg-deep);
            background-image: 
                radial-gradient(at 0% 0%, hsla(253,16%,7%,1) 0, transparent 50%), 
                radial-gradient(at 50% 0%, hsla(225,39%,30%,1) 0, transparent 50%), 
                radial-gradient(at 100% 0%, hsla(339,49%,30%,1) 0, transparent 50%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            overflow-x: hidden;
        }

        /* Animated background mesh */
        .mesh-gradient {
            position: fixed;
            top: 0; left: 0; width: 100%; height: 100%;
            z-index: -1;
            filter: blur(100px);
            opacity: 0.5;
        }
        .mesh-ball-1 { position: absolute; top: 10%; left: 10%; width: 400px; height: 400px; background: #4f46e5; border-radius: 50%; animation: float 20s infinite alternate; }
        .mesh-ball-2 { position: absolute; bottom: 10%; right: 10%; width: 500px; height: 500px; background: #7c3aed; border-radius: 50%; animation: float 25s infinite alternate-reverse; }

        @keyframes float {
            0% { transform: translate(0, 0); }
            100% { transform: translate(100px, 50px); }
        }

        .checkout-wrapper {
            display: flex;
            width: 100%;
            max-width: 1100px;
            min-height: 720px;
            background: rgba(15, 10, 30, 0.4);
            backdrop-filter: blur(20px);
            border: 1px solid var(--glass-border);
            border-radius: 32px;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
            margin: 20px;
            overflow: hidden;
            animation: fadeIn 0.8s ease-out;
        }

        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }

        /* Left Panel - Summary */
        .summary-panel {
            flex: 1;
            padding: 60px;
            display: flex;
            flex-direction: column;
            border-right: 1px solid var(--glass-border);
            position: relative;
        }

        .logo-container {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 60px;
        }

        .logo-icon {
            width: 48px;
            height: 48px;
            background: white;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 0 20px rgba(124, 58, 237, 0.3);
        }

        .logo-text {
            font-size: 24px;
            font-weight: 800;
            letter-spacing: -0.5px;
            background: linear-gradient(to right, #fff, #a78bfa);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        .badge-secure {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 6px 16px;
            background: rgba(16, 185, 129, 0.1);
            border: 1px solid rgba(16, 185, 129, 0.2);
            color: #34d399;
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1px;
            border-radius: 99px;
            margin-bottom: 32px;
        }

        .plan-selection {
            margin-bottom: 40px;
        }

        .plan-label {
            font-size: 14px;
            font-weight: 500;
            color: var(--primary-light);
            margin-bottom: 8px;
            display: block;
        }

        .plan-name {
            font-size: 48px;
            font-weight: 800;
            margin-bottom: 24px;
        }

        .price-box {
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid var(--glass-border);
            border-radius: 24px;
            padding: 24px;
            display: flex;
            align-items: baseline;
            gap: 8px;
            margin-bottom: 40px;
        }

        .currency-symbol {
            font-size: 24px;
            font-weight: 600;
            color: var(--primary-light);
        }

        .price-val {
            font-size: 56px;
            font-weight: 800;
            letter-spacing: -1px;
        }

        .price-period {
            font-size: 16px;
            color: var(--text-muted);
        }

        .feature-list {
            display: flex;
            flex-direction: column;
            gap: 20px;
        }

        .feature-row {
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .feature-check {
            width: 20px;
            height: 20px;
            background: var(--accent);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            flex-shrink: 0;
        }

        .feature-label {
            font-size: 15px;
            font-weight: 500;
            color: #d1d5db;
        }

        .summary-footer {
            margin-top: auto;
            display: flex;
            justify-content: space-between;
            padding-top: 40px;
            font-size: 13px;
            color: var(--text-muted);
        }

        /* Right Panel - Payment */
        .payment-panel {
            flex: 1.1;
            background: var(--card-bg);
            padding: 60px;
            color: var(--text-main);
            display: flex;
            flex-direction: column;
        }

        .payment-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 40px;
        }

        .payment-title {
            font-size: 28px;
            font-weight: 800;
            color: #111827;
        }

        .timer-box {
            display: flex;
            flex-direction: column;
            align-items: flex-end;
            gap: 4px;
        }

        .timer-label { font-size: 10px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; }
        .timer-value { 
            font-family: 'JetBrains Mono', monospace;
            background: #fee2e2;
            color: #ef4444;
            padding: 4px 12px;
            border-radius: 8px;
            font-weight: 700;
            font-size: 16px;
            animation: pulse 2s infinite;
        }

        @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.7; }
            100% { opacity: 1; }
        }

        /* Country Selector */
        .locale-select {
            margin-bottom: 24px;
            display: flex;
            justify-content: flex-end;
        }

        .custom-select {
            position: relative;
            background: #f3f4f6;
            padding: 8px 12px;
            border-radius: 12px;
            border: 1px solid var(--border-color);
            display: flex;
            align-items: center;
            gap: 8px;
            cursor: pointer;
            transition: all 0.2s;
        }
        .custom-select:hover { border-color: var(--primary-light); }

        /* Card Preview */
        .card-container {
            perspective: 1000px;
            margin-bottom: 40px;
        }

        .card-preview {
            width: 100%;
            height: 220px;
            position: relative;
            transform-style: preserve-3d;
            transition: transform 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            cursor: pointer;
        }

        .card-preview.flipped { transform: rotateY(180deg); }

        .card-face {
            position: absolute;
            width: 100%;
            height: 100%;
            backface-visibility: hidden;
            border-radius: 20px;
            padding: 30px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.15);
            overflow: hidden;
        }

        .card-face-front {
            background: linear-gradient(135deg, #7c3aed 0%, #4c1d95 100%);
            color: white;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
        }

        .card-face-back {
            background: linear-gradient(135deg, #4c1d95 0%, #2e1065 100%);
            transform: rotateY(180deg);
            padding: 0;
            display: flex;
            flex-direction: column;
            justify-content: center;
        }

        .card-gloss {
            position: absolute;
            top: 0; left: 0; width: 100%; height: 100%;
            background: linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 50%);
            pointer-events: none;
        }

        .card-chip {
            width: 50px;
            height: 38px;
            background: linear-gradient(135deg, #fbbf24 0%, #d97706 100%);
            border-radius: 6px;
            position: relative;
        }

        .card-chip::after {
            content: '';
            position: absolute;
            top: 50%; left: 0; width: 100%; height: 1px; background: rgba(0,0,0,0.1);
        }

        .card-number {
            font-family: 'JetBrains Mono', monospace;
            font-size: 22px;
            letter-spacing: 4px;
            text-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }

        .card-info-row {
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
        }

        .info-label { font-size: 9px; font-weight: 700; opacity: 0.6; text-transform: uppercase; margin-bottom: 4px; }
        .info-value { font-size: 14px; font-weight: 600; text-transform: uppercase; }

        .magnetic-stripe { height: 44px; background: #111; width: 100%; margin-top: 20px; }
        .signature-area { 
            height: 40px; 
            background: rgba(255,255,255,0.9); 
            margin: 20px; 
            border-radius: 4px;
            display: flex;
            align-items: center;
            justify-content: flex-end;
            padding-right: 15px;
        }
        .cvv-text { font-family: 'JetBrains Mono', monospace; color: #111; font-weight: 700; letter-spacing: 2px; }

        /* Form */
        .payment-form {
            display: grid;
            gap: 20px;
        }

        .input-group {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }

        .input-label {
            font-size: 12px;
            font-weight: 700;
            color: var(--text-muted);
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .input-wrapper {
            position: relative;
            display: flex;
            align-items: center;
        }

        .input-icon {
            position: absolute;
            left: 14px;
            color: var(--text-muted);
            width: 18px;
        }

        .form-control {
            width: 100%;
            height: 52px;
            background: #f9fafb;
            border: 1px solid var(--border-color);
            border-radius: 14px;
            padding: 0 16px 0 44px;
            font-size: 15px;
            font-weight: 500;
            color: var(--text-main);
            transition: all 0.3s;
        }

        .form-control:focus {
            outline: none;
            background: white;
            border-color: var(--primary);
            box-shadow: 0 0 0 4px rgba(124, 58, 237, 0.1);
        }

        .form-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
        }

        .submit-btn {
            height: 56px;
            background: linear-gradient(to right, var(--primary), #a855f7);
            color: white;
            border: none;
            border-radius: 16px;
            font-size: 16px;
            font-weight: 700;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            transition: all 0.3s;
            box-shadow: 0 10px 20px -5px rgba(124, 58, 237, 0.4);
            margin-top: 10px;
        }

        .submit-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 15px 25px -5px rgba(124, 58, 237, 0.5);
        }

        .submit-btn:active { transform: translateY(0); }

        .submit-btn:disabled {
            opacity: 0.7;
            cursor: not-allowed;
            transform: none;
        }

        .footer-badges {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 24px;
            margin-top: 32px;
            opacity: 0.5;
            filter: grayscale(1);
            transition: all 0.3s;
        }

        .footer-badges:hover { opacity: 0.8; filter: grayscale(0); }

        @media (max-width: 900px) {
            .checkout-wrapper { flex-direction: column; max-width: 500px; height: auto; }
            .summary-panel { border-right: none; border-bottom: 1px solid var(--glass-border); padding: 40px; }
            .payment-panel { padding: 40px; }
        }
    </style>
</head>
<body x-data="checkoutApp({{ json_encode($i18n) }}, '{{ $currentLocale }}')">
    <div class="mesh-gradient">
        <div class="mesh-ball-1"></div>
        <div class="mesh-ball-2"></div>
    </div>

    <main class="checkout-wrapper">
        <!-- Left Panel: Order Summary -->
        <section class="summary-panel">
            <div class="logo-container">
                <div class="logo-icon">
                    <img src="{{ asset('img/basileia-logo-clean-b.png') }}" alt="B" style="width: 32px;">
                </div>
                <span class="logo-text">Basiléia</span>
            </div>

            <div class="badge-secure">
                <i data-lucide="shield-check" style="width: 14px; height: 14px;"></i>
                <span x-text="t('secure_checkout')">Checkout 100% Seguro</span>
            </div>

            <div class="plan-selection">
                <span class="plan-label" x-text="t('selected_plan')">PLANO SELECIONADO</span>
                <h1 class="plan-name">{{ $plano }}</h1>
            </div>

            <div class="price-box">
                <span class="currency-symbol" x-text="currentCountry.symbol">R$</span>
                <span class="price-val" x-text="formatPrice({{ $transaction->amount }})">{{ number_format($transaction->amount, 2, ',', '.') }}</span>
                <span class="price-period" x-text="'/' + (ciclo === 'anual' ? t('year') : t('month'))">/mês</span>
            </div>

            <div class="feature-list">
                <div class="feature-row">
                    <div class="feature-check"><i data-lucide="check" style="width: 14px; height: 14px;"></i></div>
                    <div>
                        <div class="feature-label" x-text="t('immediate_access')">Acesso imediato ao painel</div>
                        <div style="font-size: 11px; opacity: 0.6;" x-text="t('immediate_access_desc')">Credenciais enviadas no seu e-mail.</div>
                    </div>
                </div>
                <div class="feature-row">
                    <div class="feature-check"><i data-lucide="check" style="width: 14px; height: 14px;"></i></div>
                    <div>
                        <div class="feature-label" x-text="t('ai_assistant')">Assistente IA no WhatsApp</div>
                        <div style="font-size: 11px; opacity: 0.6;" x-text="t('ai_assistant_desc')">Atenda membros 24h com inteligência artificial.</div>
                    </div>
                </div>
                <div class="feature-row">
                    <div class="feature-check"><i data-lucide="check" style="width: 14px; height: 14px;"></i></div>
                    <div>
                        <div class="feature-label" x-text="t('member_management')">Gestão completa de membros</div>
                        <div style="font-size: 11px; opacity: 0.6;" x-text="t('member_management_desc')">Cadastros, trilha de crescimento e árvore genealógica.</div>
                    </div>
                </div>
            </div>

            <div class="summary-footer">
                <span>Basiléia Church © 2026</span>
                <div style="display:flex; gap: 10px;">
                    <i data-lucide="lock" style="width: 14px;"></i>
                    <span x-text="t('encryption_notice')">Criptografia 256-bit</span>
                </div>
            </div>
        </section>

        <!-- Right Panel: Payment Details -->
        <section class="payment-panel">
            <div class="payment-header">
                <h2 class="payment-title" x-text="t('payment_details')">Detalhes do Pagamento</h2>
                <div class="timer-box">
                    <span class="timer-label" x-text="t('expires_in')">Expira em</span>
                    <div class="timer-value" x-text="formatTime()">10:00</div>
                </div>
            </div>

            <div class="locale-select">
                <div class="custom-select" @click="showDropdown = !showDropdown" style="position: relative;">
                    <span x-text="currentCountry.flag"></span>
                    <span x-text="currentCountry.code" style="font-weight: 700; font-size: 12px;"></span>
                    <i data-lucide="chevron-down" style="width: 14px;"></i>
                    
                    <div x-show="showDropdown" @click.away="showDropdown = false" 
                         style="position: absolute; top: 100%; right: 0; background: white; border: 1px solid #ddd; border-radius: 8px; width: 150px; z-index: 100; box-shadow: 0 10px 25px rgba(0,0,0,0.1); margin-top: 8px;">
                        <template x-for="country in countries" :key="country.code">
                            <div @click="setCountry(country)" 
                                 style="padding: 10px; display: flex; align-items: center; gap: 10px; cursor: pointer; transition: background 0.2s;"
                                 onmouseover="this.style.background='#f3f4f6'" onmouseout="this.style.background='transparent'">
                                <span x-text="country.flag"></span>
                                <span x-text="country.name" style="font-size: 12px; font-weight: 500; color: #374151;"></span>
                            </div>
                        </template>
                    </div>
                </div>
            </div>

            <div class="card-container">
                <div class="card-preview" :class="{ 'flipped': isFlipped }">
                    <div class="card-face card-face-front">
                        <div class="card-gloss"></div>
                        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                            <div class="card-chip"></div>
                            <div class="brand-logo" x-html="getBrandLogo()"></div>
                        </div>
                        <div class="card-number" x-text="displayCardNumber">•••• •••• •••• ••••</div>
                        <div class="card-info-row">
                            <div>
                                <div class="info-label" x-text="t('card_holder')">Titular</div>
                                <div class="info-value" x-text="cardHolder || t('card_holder_placeholder')">Nome no Cartão</div>
                            </div>
                            <div style="text-align: right;">
                                <div class="info-label" x-text="t('expiry_date')">Validade</div>
                                <div class="info-value" x-text="cardExpiry || 'MM/AA'">MM/AA</div>
                            </div>
                        </div>
                    </div>
                    <div class="card-face card-face-back">
                        <div class="magnetic-stripe"></div>
                        <div class="signature-area">
                            <div class="cvv-text" x-text="cardCvv || '•••'"></div>
                        </div>
                        <div style="padding: 15px; font-size: 7px; color: rgba(255,255,255,0.4); text-align: center;" x-text="t('card_property_notice')"></div>
                    </div>
                </div>
            </div>

            <form class="payment-form" method="POST" action="{{ route('basileia.checkout.process', $transaction->uuid) }}" id="checkoutForm">
                @csrf
                <div class="input-group">
                    <label class="input-label" x-text="t('card_number')">Número do Cartão</label>
                    <div class="input-wrapper">
                        <i data-lucide="credit-card" class="input-icon"></i>
                        <input type="text" name="card_number" class="form-control" 
                               placeholder="0000 0000 0000 0000" 
                               x-model="cardNumber" 
                               @input="formatCardNumber"
                               @focus="isFlipped = false"
                               required>
                    </div>
                </div>

                <div class="form-row">
                    <div class="input-group">
                        <label class="input-label" x-text="t('expiry_date')">Validade</label>
                        <div class="input-wrapper">
                            <i data-lucide="calendar" class="input-icon"></i>
                            <input type="text" name="card_expiry" class="form-control" 
                                   placeholder="MM/AA" 
                                   x-model="cardExpiry"
                                   @input="formatExpiry"
                                   @focus="isFlipped = false"
                                   required>
                        </div>
                    </div>
                    <div class="input-group">
                        <label class="input-label" x-text="t('cvv')">CVV</label>
                        <div class="input-wrapper">
                            <i data-lucide="shield" class="input-icon"></i>
                            <input type="text" name="card_cvv" class="form-control" 
                                   placeholder="000" 
                                   x-model="cardCvv"
                                   maxlength="4"
                                   @focus="isFlipped = true"
                                   @blur="isFlipped = false"
                                   required>
                        </div>
                    </div>
                </div>

                <div class="input-group">
                    <label class="input-label" x-text="t('card_holder')">Nome no Cartão</label>
                    <div class="input-wrapper">
                        <i data-lucide="user" class="input-icon"></i>
                        <input type="text" name="card_name" class="form-control" 
                               :placeholder="t('card_holder_placeholder')" 
                               x-model="cardHolder"
                               @focus="isFlipped = false"
                               required>
                    </div>
                </div>

                <button type="submit" class="submit-btn" :disabled="loading" @click="loading = true">
                    <template x-if="!loading">
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <span x-text="t('pay_now')">Inscrever-se Agora</span>
                            <i data-lucide="arrow-right" style="width: 18px;"></i>
                        </div>
                    </template>
                    <template x-if="loading">
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <span x-text="t('processing')">Processando...</span>
                            <div class="spinner" style="width: 16px; height: 16px; border: 2px solid white; border-top-color: transparent; border-radius: 50%; animation: spin 1s linear infinite;"></div>
                        </div>
                    </template>
                </button>
            </form>

            <div class="footer-badges">
                <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" height="12">
                <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" height="20">
                <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" height="18">
            </div>
        </section>
    </main>

    <style>
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
    </style>

    <script>
        function checkoutApp(i18nData, initialLocale) {
            return {
                cardNumber: '',
                cardExpiry: '',
                cardCvv: '',
                cardHolder: '',
                isFlipped: false,
                loading: false,
                showDropdown: false,
                timeLeft: 600, 
                i18n: i18nData,
                locale: initialLocale || 'pt',
                ciclo: '{{ $ciclo }}',
                
                countries: [
                    { code: 'BR', flag: '🇧🇷', name: 'Brasil', lang: 'pt', currency: 'BRL', symbol: 'R$' },
                    { code: 'JP', flag: '🇯🇵', name: 'Japan', lang: 'ja', currency: 'JPY', symbol: '¥' },
                    { code: 'US', flag: '🇺🇸', name: 'USA', lang: 'en', currency: 'USD', symbol: '$' }
                ],

                get currentCountry() {
                    return this.countries.find(c => c.lang === this.locale) || this.countries[0];
                },
                
                init() {
                    lucide.createIcons();
                    this.startTimer();
                },

                t(key) {
                    return (this.i18n[this.locale] && this.i18n[this.locale][key]) || 
                           (this.i18n['pt'] && this.i18n['pt'][key]) || key;
                },

                setCountry(country) {
                    this.locale = country.lang;
                    this.showDropdown = false;
                    document.documentElement.lang = country.lang;
                    // Trigger icon refresh if needed
                    this.$nextTick(() => lucide.createIcons());
                },

                formatPrice(amount) {
                    return new Intl.NumberFormat(this.locale === 'pt' ? 'pt-BR' : (this.locale === 'ja' ? 'ja-JP' : 'en-US'), {
                        minimumFractionDigits: this.locale === 'ja' ? 0 : 2,
                        maximumFractionDigits: this.locale === 'ja' ? 0 : 2
                    }).format(this.locale === 'ja' ? amount * 25 : amount); // Fake conversion for demo if needed
                },

                formatTime() {
                    const m = Math.floor(this.timeLeft / 60);
                    const s = this.timeLeft % 60;
                    return `${m}:${s.toString().padStart(2, '0')}`;
                },

                startTimer() {
                    setInterval(() => {
                        if (this.timeLeft > 0) this.timeLeft--;
                    }, 1000);
                },

                formatCardNumber(e) {
                    let val = e.target.value.replace(/\D/g, '');
                    val = val.substring(0, 16);
                    let formatted = val.match(/.{1,4}/g)?.join(' ') || val;
                    this.cardNumber = formatted;
                    e.target.value = formatted;
                },

                get displayCardNumber() {
                    return this.cardNumber || '•••• •••• •••• ••••';
                },

                formatExpiry(e) {
                    let val = e.target.value.replace(/\D/g, '');
                    if (val.length >= 2) {
                        val = val.substring(0, 2) + '/' + val.substring(2, 4);
                    }
                    this.cardExpiry = val;
                    e.target.value = val;
                },

                getBrandLogo() {
                    const num = this.cardNumber.replace(/\s/g, '');
                    if (num.startsWith('4')) return '<span style="font-weight:900;font-style:italic">VISA</span>';
                    if (num.match(/^5[1-5]/)) return '<span style="font-weight:900">mastercard</span>';
                    return '<i data-lucide="credit-card"></i>';
                }
            }
        }
    </script>
</body>
</html>