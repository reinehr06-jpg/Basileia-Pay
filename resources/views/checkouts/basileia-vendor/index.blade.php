<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>{{ $plano }} - Checkout Basiléia</title>
    <script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Share+Tech+Mono&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        :root {
            --primary: #7c3aed;
            --primary-dark: #5b21b6;
            --primary-light: #a78bfa;
            --bg-dark: #0f0a1e;
            --purple-glow: rgba(124, 58, 237, 0.5);
        }
        html, body {
            height: 100%;
            margin: 0;
            padding: 0;
            overflow-x: hidden;
            background: #0f0a1e;
        }
        body {
            font-family: 'Inter', sans-serif;
            min-height: 100vh;
            min-height: 100dvh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
            background: linear-gradient(135deg, #0f0a1e 0%, #1a103c 50%, #2d1b69 100%);
            background-attachment: fixed;
            color: white;
        }

        .checkout-wrapper {
            display: grid;
            grid-template-columns: 1fr 1.2fr;
            gap: 40px;
            max-width: 1100px;
            width: 100%;
            align-items: center;
        }

        /* LEFT PANEL - SUMMARY CARD */
        .order-summary {
            padding-right: 0;
            display: flex;
            flex-direction: column;
            gap: 25px;
        }
        
        .summary-card {
            background: rgba(255, 255, 255, 0.03);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 24px;
            padding: 30px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
            position: relative;
            overflow: hidden;
        }

        .summary-card::before {
            content: '';
            position: absolute;
            top: 0; left: 0; width: 100%; height: 4px;
            background: linear-gradient(90deg, var(--primary), var(--primary-light));
        }

        .brand-logo {
            display: flex;
            align-items: center;
            gap: 15px;
            margin-bottom: 10px;
        }
        .brand-logo img { height: 35px; width: auto; filter: drop-shadow(0 0 10px rgba(124, 58, 237, 0.3)); display: block; }
        .brand-logo .fallback-text { font-size: 24px; font-weight: 800; color: white; }
        
        .badge-secure {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            background: rgba(34, 197, 94, 0.1);
            padding: 6px 12px;
            border-radius: 100px;
            font-size: 11px;
            font-weight: 700;
            color: #4ade80;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            border: 1px solid rgba(34, 197, 94, 0.2);
        }

        .summary-label { font-size: 13px; color: #a99fbb; margin-top: 15px; text-transform: uppercase; letter-spacing: 1px; opacity: 0.8; }
        .plan-title { font-size: 38px; font-weight: 900; margin: 5px 0 15px; line-height: 1; letter-spacing: -1px; }
        
        .price-container {
            background: rgba(124, 58, 237, 0.1);
            border-radius: 16px;
            padding: 20px;
            margin-bottom: 25px;
            border: 1px solid rgba(124, 58, 237, 0.1);
            display: flex;
            align-items: baseline;
            gap: 8px;
        }
        .price-currency { font-size: 18px; font-weight: 600; color: var(--primary-light); }
        .price-value { font-size: 44px; font-weight: 900; color: white; line-height: 1; }
        .price-period { font-size: 14px; color: #a99fbb; }
        
        .features-list {
            display: flex;
            flex-direction: column;
            gap: 12px;
            margin-bottom: 5px;
        }
        .feature-item { 
            display: flex; 
            align-items: center; 
            gap: 12px; 
            font-size: 14px; 
            color: #e2e8f0;
            padding: 8px 0;
            border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }
        .feature-item:last-child { border-bottom: none; }
        .feature-item i { color: #22c55e; font-size: 16px; }

        .trust-row {
            display: flex;
            justify-content: space-between;
            margin-top: 10px;
            color: #a99fbb;
            font-size: 12px;
            font-weight: 500;
        }
        .trust-item { display: flex; align-items: center; gap: 6px; }
        .trust-item i { font-size: 14px; opacity: 0.7; }

        /* RIGHT PANEL - THE BOOK */
        .book-container {
            position: relative;
            perspective: 2000px;
            width: 100%;
            max-width: 420px;
        }

        .layer {
            position: relative;
            background: white;
            border-radius: 20px;
            padding: 20px;
            color: #1e293b;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
            z-index: 10;
        }

        .book-bg-layer {
            position: absolute;
            top: 8px;
            left: 8px;
            right: -8px;
            bottom: -8px;
            background: #e9e5ff; /* More visible roxinho */
            border: 1px solid #ddd6fe;
            border-radius: 20px;
            z-index: 5;
            transform: rotate(-2deg);
        }
        .book-bg-layer-2 {
            position: absolute;
            top: 16px;
            left: 16px;
            right: -16px;
            bottom: -16px;
            background: #ddd6fe; /* Darker roxinho */
            border: 1px solid #c4b5fd;
            border-radius: 20px;
            z-index: 2;
            transform: rotate(-4deg);
        }

        /* CARD DESIGN */
        .card-scene {
            width: 100%;
            height: 180px;
            perspective: 1000px;
            margin-bottom: 20px;
            cursor: pointer;
        }
        .card-inner {
            position: relative;
            width: 100%;
            height: 100%;
            transition: transform 0.8s;
            transform-style: preserve-3d;
        }
        .card-inner.is-flipped { transform: rotateY(180deg); }
        .card-face {
            position: absolute;
            width: 100%;
            height: 100%;
            backface-visibility: hidden;
            border-radius: 14px;
            padding: 20px;
            color: white;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            background: linear-gradient(135deg, #4c1d95 0%, #7c3aed 100%);
            box-shadow: 0 10px 25px rgba(0,0,0,0.2);
            overflow: hidden;
        }
        .card-face::before {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 80%);
            pointer-events: none;
        }
        .card-back { transform: rotateY(180deg); background: linear-gradient(135deg, #1e1b4b 0%, #312e81 100%); }
        .card-chip { width: 40px; height: 30px; background: linear-gradient(135deg, #ffd700 0%, #facc15 100%); border-radius: 6px; margin-bottom: 15px; }
        .card-number-display { font-family: 'Share Tech Mono', monospace; font-size: 20px; letter-spacing: 2px; margin-bottom: 15px; }
        .card-bottom { display: flex; justify-content: space-between; align-items: flex-end; }
        .card-label { font-size: 9px; text-transform: uppercase; opacity: 0.7; margin-bottom: 3px; }
        .card-value { font-size: 13px; font-weight: 600; text-transform: uppercase; }
        .card-brand-logo { position: absolute; top: 20px; right: 20px; height: 25px; width: auto; opacity: 0; transition: opacity 0.3s; pointer-events: none; }
        .card-brand-logo.visible { opacity: 1; }
        .card-brand-logo.default { font-weight: 900; font-size: 20px; color: white; opacity: 0; }
        .card-brand-logo.default.visible { opacity: 0.3; }

        .card-magnetic-strip { height: 35px; background: #000; width: 120%; margin: 0 -20px; }
        .card-cvv-strip { height: 30px; background: white; width: 80%; border-radius: 4px; margin-top: 15px; display: flex; align-items: center; justify-content: flex-end; padding-right: 15px; color: #1e293b; font-weight: 700; font-family: 'Share Tech Mono', monospace; }

        /* FORM ELEMENTS */
        .form-title { font-size: 22px; font-weight: 800; color: #1e293b; margin-bottom: 5px; }
        .form-subtitle { font-size: 13px; color: #64748b; margin-bottom: 20px; }
        .form-group { margin-bottom: 12px; }
        .form-label { display: block; font-size: 11px; font-weight: 700; color: #475569; text-transform: uppercase; margin-bottom: 6px; }
        .form-input { width: 100%; padding: 12px 15px; border: 2px solid #e2e8f0; border-radius: 10px; font-size: 14px; transition: all 0.3s; background: #f8fafc; color: #1e293b; font-weight: 500; }
        .form-input:focus { border-color: var(--primary); outline: none; background: white; box-shadow: 0 0 0 4px rgba(124, 58, 237, 0.1); }
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

        .btn-pay { width: 100%; padding: 15px; background: var(--primary); color: white; border: none; border-radius: 12px; font-size: 15px; font-weight: 700; cursor: pointer; transition: all 0.3s; display: flex; align-items: center; justify-content: center; gap: 10px; margin-top: 5px; }
        .btn-pay:hover { background: var(--primary-dark); transform: translateY(-2px); box-shadow: 0 10px 25px rgba(124, 58, 237, 0.3); }
        .btn-pay:disabled { opacity: 0.7; cursor: not-allowed; transform: none; }

        .btn-secondary { width: 100%; padding: 10px; background: #f1f5f9; color: #475569; border: none; border-radius: 10px; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.3s; display: flex; align-items: center; justify-content: center; gap: 8px; }
        .btn-secondary:hover { background: #e2e8f0; }

        /* SUCCESS STATE */
        .success-icon { width: 60px; height: 60px; background: #f0fdf4; color: #22c55e; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 30px; margin: 0 auto 20px; }
        .success-btns { display: flex; flex-direction: column; gap: 10px; margin-top: 30px; }

        /* PIX ELEMENTS */
        .pix-container { text-align: center; }
        .pix-qr-box { background: white; padding: 15px; border-radius: 15px; display: inline-block; margin-bottom: 20px; }
        .pix-qr-box img { width: 180px; height: 180px; }
        .pix-payload { background: #f1f5f9; padding: 12px; border-radius: 10px; font-family: 'Share Tech Mono', monospace; font-size: 11px; color: #475569; word-break: break-all; margin-bottom: 15px; border: 1px dashed #cbd5e1; }

        /* UTILS */
        [x-cloak] { display: none !important; }
        .layer-enter-start { opacity: 0; transform: translateY(20px); }
        .layer-enter-end { opacity: 1; transform: translateY(0); }
        .layer-leave-start { opacity: 1; transform: translateY(0); }
        .layer-leave-end { opacity: 0; transform: translateY(-20px); }
        .layer-transition { transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); }

        /* COUNTRY SELECTOR */
        .custom-select-container { position: relative; width: 110px; }
        .custom-select-trigger { display: flex; align-items: center; gap: 6px; padding: 6px 10px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 11px; font-weight: 600; color: #475569; cursor: pointer; }
        .custom-select-options { position: absolute; top: calc(100% + 5px); right: 0; width: 160px; background: white; border-radius: 10px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); border: 1px solid #e2e8f0; z-index: 100; max-height: 250px; overflow-y: auto; display: none; }
        .custom-select-options.show { display: block; }
        .custom-select-option { padding: 8px 12px; display: flex; align-items: center; gap: 8px; cursor: pointer; font-size: 12px; transition: background 0.2s; }
        .custom-select-option:hover { background: #f1f5f9; }

        /* EXPIRED OVERLAY */
        .expired-overlay { position: absolute; inset: 0; background: rgba(255,255,255,0.95); z-index: 1000; border-radius: 20px; display: flex; align-items: center; justify-content: center; padding: 30px; text-align: center; }
        .expired-box i { font-size: 40px; color: #dc2626; margin-bottom: 15px; }

        @media (max-width: 900px) {
            body { padding: 0; align-items: flex-start; }
            .checkout-wrapper { grid-template-columns: 1fr; gap: 0; max-width: 100%; }
            
            .mobile-summary-toggle {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 15px 20px;
                background: rgba(15, 10, 30, 0.95);
                backdrop-filter: blur(10px);
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                position: sticky;
                top: 0;
                z-index: 1000;
                cursor: pointer;
                color: white;
                font-size: 14px;
            }

            .order-summary { 
                height: 0;
                overflow: hidden;
                padding: 0 20px;
                transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                background: #0f0a1e;
                opacity: 0;
            }
            .order-summary.mobile-open {
                height: auto;
                padding: 20px;
                opacity: 1;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            }

            .plan-title { font-size: 28px; }
            .book-container { margin: 20px auto; padding: 0 15px; }
            .layer { padding: 15px; }
        }

        .mobile-summary-toggle { display: none; }
    </style>
</head>
<body x-data="checkoutFlow()" x-init="init()">

    <div class="checkout-wrapper">
        
        <!-- MOBILE SUMMARY TOGGLE -->
        <div class="mobile-summary-toggle" @click="mobileSummaryOpen = !mobileSummaryOpen">
            <div style="display: flex; align-items: center; gap: 10px;">
                <i class="fas fa-shopping-cart"></i>
                <span x-text="mobileSummaryOpen ? (locale === 'pt-BR' ? 'Ocultar Resumo' : 'Hide Summary') : (locale === 'pt-BR' ? 'Ver Resumo' : 'View Summary')"></span>
                <i class="fas" :class="mobileSummaryOpen ? 'fa-chevron-up' : 'fa-chevron-down'" style="font-size: 10px;"></i>
            </div>
            <div style="font-weight: 700;" x-text="formatPrice(originalAmount)"></div>
        </div>

        <!-- LEFT PANEL (Order Summary) -->
        <div class="order-summary" :class="{ 'mobile-open': mobileSummaryOpen }">
            <div class="brand-logo">
            <img src="https://dash.basileia.global/assets/logo-basileia-horizontal.png" alt="Basiléia Logo" onerror="this.style.display='none'; this.nextElementSibling.style.display='block'">
            <span class="fallback-text" style="display: none;">Basiléia</span>
            </div>

            <div class="summary-card">
                <div class="badge-secure">
                    <i class="fas fa-shield-alt"></i> Checkout 100% Seguro
                </div>

                <div class="summary-label" x-text="locale === 'pt-BR' ? 'Plano Selecionado' : 'Selected Plan'"></div>
                <h1 class="plan-title" style="color: white;">{{ $plano }}</h1>

                <div class="price-container">
                    <span class="price-currency" x-text="currencySymbol"></span>
                    <span class="price-value" x-text="formatPrice(originalAmount).replace(/[^0-9,.]/g, '')"></span>
                    <span class="price-period" x-text="locale === 'pt-BR' ? '/ mês' : '/ month'"></span>
                </div>

                <div class="features-list">
                    <div class="feature-item"><i class="fas fa-check-circle"></i> <span x-text="locale === 'pt-BR' ? 'Conformidade LGPD' : 'GDPR/LGPD Compliance'"></span></div>
                    <div class="feature-item"><i class="fas fa-check-circle"></i> <span x-text="locale === 'pt-BR' ? 'Suporte Humanizado' : 'Human Support'"></span></div>
                    <div class="feature-item"><i class="fas fa-check-circle"></i> <span x-text="locale === 'pt-BR' ? 'Múltiplas Igrejas' : 'Multiple Churches'"></span></div>
                    <div class="feature-item"><i class="fas fa-check-circle"></i> <span x-text="locale === 'pt-BR' ? 'Implantação Rápida' : 'Quick Deployment'"></span></div>
                </div>

                <div class="trust-row">
                    <div class="trust-item"><i class="fas fa-lock"></i> <span x-text="locale === 'pt-BR' ? 'Garantia total' : 'Full Guarantee'"></span></div>
                    <div class="trust-item"><i class="fas fa-shield-alt"></i> <span x-text="locale === 'pt-BR' ? 'Pagamento Seguro' : 'Secure Payment'"></span></div>
                </div>
            </div>

            <div style="text-align: center; color: #a99fbb; font-size: 11px; opacity: 0.5;">
                Basiléia Church &copy; {{ date('Y') }} - Todos os direitos reservados
            </div>
        </div>

        <!-- THE BOOK (Right Panel) -->
        <div class="book-container">
            <div class="book-bg-layer"></div>
            <div class="book-bg-layer-2"></div>

            <!-- EXPIRED OVERLAY (THE SCARE) -->
            <div x-show="isExpired" class="expired-overlay" x-cloak x-transition>
                <div class="expired-box">
                    <i class="fas fa-clock"></i>
                    <h3 x-text="locale === 'pt-BR' ? 'Link Temporariamente Inativo' : 'Link Temporarily Inactive'"></h3>
                    <p x-text="locale === 'pt-BR' ? 'Esta oferta expirou por inatividade. Aguarde alguns segundos...' : 'This offer has expired. Please wait a few seconds...'"></p>
                </div>
            </div>

            <!-- LAYER 1: PAYMENT -->
            <div class="layer" x-show="step === 1" 
                 x-transition:enter="layer-transition"
                 x-transition:enter-start="layer-enter-start"
                 x-transition:enter-end="layer-enter-end"
                 x-transition:leave="layer-transition"
                 x-transition:leave-start="layer-leave-start"
                 x-transition:leave-end="layer-leave-end">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                    <div>
                        <div class="summary-label" style="font-size: 10px; margin-bottom: 4px;" x-text="locale === 'pt-BR' ? 'EXPIRA EM' : 'EXPIRES IN'"></div>
                        <div style="font-size: 14px; font-weight: 800; background: #fef2f2; color: #dc2626; padding: 6px 12px; border-radius: 10px; display: inline-block; letter-spacing: 1px;" x-text="timeLeft"></div>
                    </div>
                    
                    <div class="custom-select-container" @click.away="showSelector = false">
                        <div class="custom-select-trigger" @click="showSelector = !showSelector">
                            <span x-text="countries.find(x => x.code === country).flag + ' ' + country"></span>
                            <i class="fas fa-chevron-down" style="font-size: 10px;"></i>
                        </div>
                        <div class="custom-select-options" :class="{ 'show': showSelector }">
                            <template x-for="c in countries" :key="c.code">
                                <div class="custom-select-option" @click="changeCountry(c.code); showSelector = false">
                                    <span x-text="c.flag"></span>
                                    <span x-text="c.name"></span>
                                </div>
                            </template>
                        </div>
                    </div>
                </div>

                <div style="text-align: center; margin-bottom: 15px;">
                    <h2 class="form-title" x-text="locale === 'pt-BR' ? 'Dados de Pagamento' : 'Payment Details'" style="margin-bottom: 5px;"></h2>
                </div>

                @if(($asaasPayment['billingType'] ?? 'PIX') === 'PIX')
                    <!-- PIX FLOW -->
                    <div class="pix-container">
                        <div style="text-align: center; margin-bottom: 20px;">
                            <div class="badge-secure" style="background: rgba(124, 58, 237, 0.1); color: var(--primary-light); border-color: rgba(124, 58, 237, 0.2);">
                                <i class="fas fa-bolt"></i> Pagamento Instantâneo
                            </div>
                        </div>

                        <div class="pix-qr-box" style="border: 2px solid var(--primary); box-shadow: 0 15px 35px rgba(124, 58, 237, 0.2); background: white; padding: 15px; border-radius: 20px; display: inline-block; margin-bottom: 20px;">
                            <img src="data:image/png;base64,{{ $pixData['encodedImage'] ?? '' }}" alt="QR Code PIX" style="width: 180px; height: 180px; display: block;">
                        </div>
                        
                        <div style="display: flex; flex-direction: column; align-items: center; gap: 4px; margin-bottom: 20px; text-align: center;">
                            <div class="summary-label" style="font-size: 11px;" x-text="locale === 'pt-BR' ? 'VALOR TOTAL' : 'TOTAL VALUE'"></div>
                            <div style="font-size: 36px; font-weight: 900; color: #1e293b; letter-spacing: -1px;" x-text="formatPrice(originalAmount)"></div>
                        </div>

                        <div style="text-align: left; margin-bottom: 15px;">
                            <div class="summary-label" style="font-size: 10px; margin-bottom: 6px;">CÓDIGO PIX</div>
                            <div class="pix-payload" id="pixPayload">{{ $pixData['payload'] ?? '' }}</div>
                        </div>
                        
                        <button class="btn-pay" @click="copyPix()">
                            <i class="fas fa-copy"></i> <span x-text="locale === 'pt-BR' ? 'Copiar Código' : 'Copy Code'"></span>
                        </button>
                        
                        <div style="margin-top: 15px; color: #64748b; font-size: 11px; display: flex; align-items: center; justify-content: center; gap: 6px;">
                            <i class="fas fa-shield-check" style="color: #10b981;"></i>
                            <span x-text="locale === 'pt-BR' ? 'Confirmação automática em segundos' : 'Automatic confirmation in seconds'"></span>
                        </div>
                    </div>
                @else
                    <!-- CARD FLOW -->
                    <div class="card-scene" @click="isFlipped = !isFlipped" x-show="step === 1">
                        <div class="card-inner" :class="{ 'is-flipped': isFlipped }">
                            <div class="card-face card-front">
                                <div class="card-chip"></div>
                                <div class="card-brand-logo default" x-show="cardBrand === 'default'">B</div>
                                <div class="card-brand-logo" :class="{ 'visible': cardBrand === 'visa' }" style="top: 15px; right: 15px;">
                                    <svg viewBox="0 0 48 24" width="48" height="24">
                                        <path d="M18.2 18.5l2.8-13h2.1l-2.8 13h-2.1zm11.7-12.7c-0.5-0.2-1.3-0.4-2.2-0.4-2.4 0-4.1 1.3-4.1 3.1 0 1.4 1.2 2.1 2.2 2.6 1 0.5 1.4 0.8 1.4 1.2 0 0.7-0.8 1-1.5 1-1 0-1.7-0.2-2.7-0.6l-0.4 1.8c0.5 0.2 1.5 0.4 2.5 0.4 2.4 0 4-1.2 4-3 0-1-0.6-1.8-1.9-2.4-0.8-0.4-1.3-0.7-1.3-1.2 0-0.4 0.5-0.9 1.5-0.9 0.9 0 1.5 0.2 2 0.4l0.4-1.8zm6.5 12.7h2l-1.8-13h-1.8c-0.6 0-1 0.3-1.2 0.9l-4.4 10.6h2.2l0.4-1.2h2.7l0.3 1.2zm-2-3.1l1.1-3 0.6 3h-1.7zm-26.6-9.6l-0.2 1.1c1.2 0.3 2.5 0.8 3.3 1.3l1.8 7.2h2.2l3.4-13h-2.2l-2.1 8.3-0.9-4.3c-0.3-1-1.1-1.8-2.1-2.2-1.2-0.6-2.4-1-3.2-1.4" fill="#fff"/>
                                    </svg>
                                </div>
                                <div class="card-brand-logo" :class="{ 'visible': cardBrand === 'mastercard' }" style="top: 18px; right: 18px;">
                                    <svg viewBox="0 0 24 18" width="44" height="34">
                                        <circle cx="7" cy="9" r="7" fill="#eb001b" />
                                        <circle cx="17" cy="9" r="7" fill="#f79e1b" opacity="0.85" />
                                        <path d="M12 2.2a7 7 0 0 1 0 13.6 7 7 0 0 1 0-13.6z" fill="#ff5f00" />
                                    </svg>
                                </div>
                                <img src="https://cdn.jsdelivr.net/npm/payment-icons@1.1.0/svg/flat/amex.svg" class="card-brand-logo" :class="{ 'visible': cardBrand === 'amex' }" alt="Amex">
                                <img src="https://cdn.jsdelivr.net/npm/payment-icons@1.1.0/svg/flat/elo.svg" class="card-brand-logo" :class="{ 'visible': cardBrand === 'elo' }" alt="Elo">
                                <img src="https://cdn.jsdelivr.net/npm/payment-icons@1.1.0/svg/flat/hipercard.svg" class="card-brand-logo" :class="{ 'visible': cardBrand === 'hipercard' }" alt="Hipercard">
                                <img src="https://cdn.jsdelivr.net/npm/payment-icons@1.1.0/svg/flat/diners.svg" class="card-brand-logo" :class="{ 'visible': cardBrand === 'diners' }" alt="Diners">
                                
                                <div class="card-number-display" x-text="formatCardNumber(cardNumber)"></div>
                                <div class="card-bottom">
                                    <div>
                                        <div class="card-label">Titular</div>
                                        <div class="card-value" x-text="cardHolder || 'NOME NO CARTÃO'"></div>
                                    </div>
                                    <div style="text-align: right;">
                                        <div class="card-label">Validade</div>
                                        <div class="card-value" x-text="cardExpiry || 'MM/AA'"></div>
                                    </div>
                                </div>
                            </div>
                            <div class="card-face card-back">
                                <div class="card-magnetic-strip"></div>
                                <div class="card-cvv-strip" x-text="cardCvv || '•••'"></div>
                                <div style="padding: 20px; font-size: 10px; opacity: 0.5;">Assinatura Autorizada</div>
                            </div>
                        </div>
                    </div>

                    <div style="text-align: center; margin-bottom: 10px;" x-show="step === 1">
                        <div class="summary-label" style="font-size: 12px;" x-text="locale === 'pt-BR' ? 'VALOR' : 'VALUE'"></div>
                        <div style="font-size: 32px; font-weight: 900; color: #1e293b;" x-text="formatPrice(originalAmount)"></div>
                    </div>

                    <!-- STEP 1 UI (OUTSIDE FORM TO PREVENT RELOAD) -->
                    <div x-show="step === 1" x-transition>
                        <div class="form-group">
                            <label class="form-label" x-text="locale === 'pt-BR' ? 'Número do Cartão' : 'Card Number'"></label>
                            <input type="text" class="form-input" x-model="cardNumber" @input="updateCardNumber($event)" placeholder="0000 0000 0000 0000" maxlength="19">
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label" x-text="locale === 'pt-BR' ? 'Validade' : 'Expiry'"></label>
                                <input type="text" class="form-input" x-model="cardExpiry" @input="updateCardExpiry($event)" placeholder="MM/AA" maxlength="5">
                            </div>
                            <div class="form-group">
                                <label class="form-label" x-text="locale === 'pt-BR' ? 'CVV' : 'CVV'"></label>
                                <input type="text" class="form-input" x-model="cardCvv" @focus="isFlipped = true" @blur="isFlipped = false" placeholder="000" maxlength="4">
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="form-label" x-text="locale === 'pt-BR' ? 'Nome no Cartão' : 'Cardholder Name'"></label>
                            <input type="text" class="form-input" x-model="cardHolder" placeholder="Como impresso no cartão">
                        </div>
                        <button type="button" class="btn-pay" @click="step = 2; localStorage.setItem('checkout_step_' + '{{ $transaction->uuid }}', 2)">
                            <span x-text="locale === 'pt-BR' ? 'Assinar Agora' : 'Subscribe Now'"></span> <i class="fas fa-arrow-right"></i>
                        </button>
                    </div>

                    <!-- STEP 2 FORM (ONLY SUBMITS HERE) -->
                    <form id="paymentForm" method="POST" action="{{ route('checkout.process', $transaction->uuid) }}" x-show="step === 2" x-transition:enter="layer-transition" x-transition:enter-start="layer-enter-start" x-transition:enter-end="layer-enter-end" x-transition:leave="layer-transition" x-transition:leave-start="layer-leave-start" x-transition:leave-end="layer-leave-end" x-cloak>
                        @csrf
                        <!-- HIDDEN FIELDS SYNCED VIA ALPINE -->
                        <input type="hidden" name="card_number" :value="cardNumber.replace(/\D/g, '')">
                        <input type="hidden" name="card_expiry" :value="cardExpiry">
                        <input type="hidden" name="card_cvv" :value="cardCvv">
                        <input type="hidden" name="card_name" :value="cardHolder">

                        <h2 class="form-title" x-text="locale === 'pt-BR' ? 'Confirme seus dados' : 'Confirm your details'"></h2>
                        <p class="form-subtitle" x-text="locale === 'pt-BR' ? 'Quase lá! Verifique se as informações da sua igreja estão corretas.' : 'Almost there! Check if your information is correct.'"></p>

                        <div class="form-group">
                            <label class="form-label" x-text="locale === 'pt-BR' ? 'Nome da Igreja / Instituição' : 'Church / Institution Name'"></label>
                            <input type="text" name="customer_name" class="form-input" x-model="vendorName" placeholder="Ex: Igreja Central">
                        </div>
                        <div class="form-group">
                            <label class="form-label" x-text="locale === 'pt-BR' ? 'E-mail de Contato' : 'Contact Email'"></label>
                            <input type="email" name="customer_email" class="form-input" x-model="vendorEmail" placeholder="contato@igreja.com">
                        </div>
                        <div class="form-group">
                            <label class="form-label" x-text="locale === 'pt-BR' ? 'Documento (CPF/CNPJ)' : 'Document (Tax ID)'"></label>
                            <input type="text" name="customer_document" class="form-input" x-model="vendorDoc" placeholder="00.000.000/0001-00">
                        </div>

                        <div style="background: #f0fdf4; border: 1px solid #dcfce7; padding: 15px; border-radius: 12px; margin-bottom: 20px;">
                            <p style="color: #166534; font-size: 13px; display: flex; gap: 8px;">
                                <i class="fas fa-info-circle" style="margin-top: 3px;"></i>
                                <span x-text="locale === 'pt-BR' ? 'Enquanto você revisa, nosso sistema está validando sua transação.' : 'While you review, our system is validating your transaction.'"></span>
                            </p>
                        </div>

                        <button type="submit" class="btn-pay" @click="processing = true">
                            <template x-if="!processing">
                                <span><span x-text="locale === 'pt-BR' ? 'Confirmar e Finalizar' : 'Confirm and Finish'"></span> <i class="fas fa-check"></i></span>
                            </template>
                            <template x-if="processing">
                                <span><i class="fas fa-circle-notch fa-spin"></i> <span x-text="locale === 'pt-BR' ? 'Processando...' : 'Processing...'"></span></span>
                            </template>
                        </button>
                        
                        <button type="button" class="btn-secondary" @click="step = 1; localStorage.setItem('checkout_step_' + '{{ $transaction->uuid }}', 1)" style="margin-top: 10px; width: 100%;" x-show="!processing">
                            <i class="fas fa-arrow-left"></i> <span x-text="locale === 'pt-BR' ? 'Voltar' : 'Back'"></span>
                        </button>
                    </form>
                @endif
            </div>

            <!-- LAYER 3: SUCCESS -->
            <div class="layer" x-show="step === 3" 
                 x-transition:enter="layer-transition"
                 x-transition:enter-start="layer-enter-start"
                 x-transition:enter-end="layer-enter-end"
                 x-transition:leave="layer-transition"
                 x-transition:leave-start="layer-leave-start"
                 x-transition:leave-end="layer-leave-end"
                 x-cloak>
                <div class="success-icon">
                    <i class="fas fa-check"></i>
                </div>
                <h2 class="form-title" style="text-align: center;">Pagamento Aprovado!</h2>
                <p class="form-subtitle" style="text-align: center;">Bem-vindo à nova era da sua igreja. Seus recursos já estão liberados.</p>

                <div style="background: #f8fafc; border-radius: 16px; padding: 20px; margin-top: 20px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 13px; color: #64748b;">
                        <span>Transação</span>
                        <span style="font-weight: 700; color: #1e293b;">#{{ strtoupper(substr($transaction->uuid, 0, 8)) }}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; font-size: 13px; color: #64748b;">
                        <span>Data</span>
                        <span style="font-weight: 700; color: #1e293b;">{{ date('d/m/Y H:i') }}</span>
                    </div>
                </div>

                <div class="success-btns">
                    <a href="https://dash.basileia.global/dashboard" class="btn-pay" style="margin-top: 0;">
                        Acessar Basiléia Church <i class="fas fa-church"></i>
                    </a>
                    <a :href="getWhatsappLink()" target="_blank" class="btn-secondary">
                        <i class="fab fa-whatsapp" style="color: #25d366;"></i> Suporte no WhatsApp
                    </a>
                    <a href="#" class="btn-secondary">
                        <i class="fas fa-play-circle" style="color: var(--primary);"></i> Vídeos de Implementação
                    </a>
                </div>
            </div>
        </div>
    </div>

    <script>
        function checkoutFlow() {
            return {
                step: parseInt(localStorage.getItem('checkout_step_' + '{{ $transaction->uuid }}')) || {{ $step ?? 1 }},
                isFlipped: false,
                processing: false,
                showSelector: false,
                summaryExpanded: false,
                
                // i18n and Currency
                country: 'BR',
                locale: 'pt-BR',
                currency: 'BRL',
                currencySymbol: 'R$',
                
                // Timer
                timeLeft: '30:00',
                secondsRemaining: 1800,

                // Card Data
                cardNumber: '',
                cardExpiry: '',
                cardCvv: '',
                cardHolder: '',
                cardBrand: 'default',

                // Vendor Data
                vendorName: '{{ $transaction->vendor->name ?? '' }}',
                vendorEmail: '{{ $transaction->customer_email ?? '' }}',
                vendorDoc: '{{ $transaction->customer_document ?? '' }}',
                mobileSummaryOpen: false,

                originalAmount: {{ $transaction->amount }},
                selectedCountry: {code:'BR',name:'Brasil',flag:'🇧🇷',locale:'pt-BR',currency:'BRL',symbol:'R$',rate:1},
                
                countries: [
                    {code:'AF',name:'Afghanistan',flag:'🇦🇫',currency:'AFN',symbol:'Af',rate:0.015},
                    {code:'AL',name:'Albania',flag:'🇦🇱',currency:'ALL',symbol:'L',rate:0.011},
                    {code:'DZ',name:'Algeria',flag:'🇩🇿',currency:'DZD',symbol:'DA',rate:0.0074},
                    {code:'AD',name:'Andorra',flag:'🇦🇩',currency:'EUR',symbol:'€',rate:0.17},
                    {code:'AO',name:'Angola',flag:'🇦🇴',currency:'AOA',symbol:'Kz',rate:0.00021},
                    {code:'AR',name:'Argentina',flag:'🇦🇷',currency:'ARS',symbol:'$',rate:0.0011},
                    {code:'AU',name:'Australia',flag:'🇦🇺',currency:'AUD',symbol:'$',rate:0.28},
                    {code:'AT',name:'Österreich',flag:'🇦🇹',currency:'EUR',symbol:'€',rate:0.17},
                    {code:'BE',name:'België',flag:'🇧🇪',currency:'EUR',symbol:'€',rate:0.17},
                    {code:'BO',name:'Bolivia',flag:'🇧🇴',currency:'BOB',symbol:'Bs',rate:0.026},
                    {code:'BR',name:'Brasil',flag:'🇧🇷',currency:'BRL',symbol:'R$',rate:1},
                    {code:'CA',name:'Canada',flag:'🇨🇦',currency:'CAD',symbol:'$',rate:0.26},
                    {code:'CL',name:'Chile',flag:'🇨🇱',currency:'CLP',symbol:'$',rate:0.0002},
                    {code:'CN',name:'China',flag:'🇨🇳',currency:'CNY',symbol:'¥',rate:0.026},
                    {code:'CO',name:'Colombia',flag:'🇨🇴',currency:'COP',symbol:'$',rate:0.00004},
                    {code:'CR',name:'Costa Rica',flag:'🇨🇷',currency:'CRC',symbol:'₡',rate:0.00035},
                    {code:'CU',name:'Cuba',flag:'🇨🇺',currency:'CUP',symbol:'$',rate:0.0075},
                    {code:'DK',name:'Danmark',flag:'🇩🇰',currency:'DKK',symbol:'kr',rate:0.023},
                    {code:'DE',name:'Deutschland',flag:'🇩🇪',currency:'EUR',symbol:'€',rate:0.17},
                    {code:'EC',name:'Ecuador',flag:'🇪🇨',currency:'USD',symbol:'$',rate:0.18},
                    {code:'EG',name:'Egypt',flag:'🇪🇬',currency:'EGP',symbol:'E£',rate:0.0037},
                    {code:'SV',name:'El Salvador',flag:'🇸🇻',currency:'USD',symbol:'$',rate:0.18},
                    {code:'ES',name:'España',flag:'🇪🇸',currency:'EUR',symbol:'€',rate:0.17},
                    {code:'FI',name:'Suomi',flag:'🇫🇮',currency:'EUR',symbol:'€',rate:0.17},
                    {code:'FR',name:'France',flag:'🇫🇷',currency:'EUR',symbol:'€',rate:0.17},
                    {code:'GB',name:'Great Britain',flag:'🇬🇧',currency:'GBP',symbol:'£',rate:0.14},
                    {code:'GR',name:'Elláda',flag:'🇬🇷',currency:'EUR',symbol:'€',rate:0.17},
                    {code:'GT',name:'Guatemala',flag:'🇬🇹',currency:'GTQ',symbol:'Q',rate:0.023},
                    {code:'HN',name:'Honduras',flag:'🇭🇳',currency:'HNL',symbol:'L',rate:0.0073},
                    {code:'HK',name:'Hong Kong',flag:'🇭🇰',currency:'HKD',symbol:'$',rate:1.4},
                    {code:'HU',name:'Magyarország',flag:'🇭🇺',currency:'HUF',symbol:'Ft',rate:0.00049},
                    {code:'IN',name:'India',flag:'🇮🇳',currency:'INR',symbol:'₹',rate:0.015},
                    {code:'IE',name:'Ireland',flag:'🇮🇪',currency:'EUR',symbol:'€',rate:0.17},
                    {code:'IL',name:'Israel',flag:'🇮🇱',currency:'ILS',symbol:'₪',rate:0.67},
                    {code:'IT',name:'Italia',flag:'🇮🇹',currency:'EUR',symbol:'€',rate:0.17},
                    {code:'JP',name:'Japan',flag:'🇯🇵',currency:'JPY',symbol:'¥',rate:2.8},
                    {code:'MX',name:'Mexico',flag:'🇲🇽',currency:'MXN',symbol:'$',rate:0.11},
                    {code:'NL',name:'Nederland',flag:'🇳🇱',currency:'EUR',symbol:'€',rate:0.17},
                    {code:'NZ',name:'New Zealand',flag:'🇳🇿',currency:'NZD',symbol:'$',rate:0.30},
                    {code:'NI',name:'Nicaragua',flag:'🇳🇮',currency:'NIO',symbol:'C$',rate:0.0049},
                    {code:'NO',name:'Norge',flag:'🇳🇴',currency:'NOK',symbol:'kr',rate:0.019},
                    {code:'PA',name:'Panamá',flag:'🇵🇦',currency:'PAB',symbol:'B/.',rate:0.18},
                    {code:'PY',name:'Paraguay',flag:'🇵🇾',currency:'PYG',symbol:'₲',rate:1.4},
                    {code:'PE',name:'Perú',flag:'🇵🇪',currency:'PEN',symbol:'S/',rate:0.048},
                    {code:'PL',name:'Polska',flag:'🇵🇱',currency:'PLN',symbol:'zł',rate:0.041},
                    {code:'PT',name:'Portugal',flag:'🇵🇹',currency:'EUR',symbol:'€',rate:0.17},
                    {code:'RU',name:'Rossiya',flag:'🇷🇺',currency:'RUB',symbol:'₽',rate:0.016},
                    {code:'SA',name:'Saudi Arabia',flag:'🇸🇦',currency:'SAR',symbol:'SR',rate:0.67},
                    {code:'SG',name:'Singapore',flag:'🇸🇬',currency:'SGD',symbol:'$',rate:0.24},
                    {code:'ZA',name:'South Africa',flag:'🇿🇦',currency:'ZAR',symbol:'R',rate:0.34},
                    {code:'KR',name:'South Korea',flag:'🇰🇷',currency:'KRW',symbol:'₩',rate:245},
                    {code:'SE',name:'Sverige',flag:'🇸🇪',currency:'SEK',symbol:'kr',rate:0.19},
                    {code:'CH',name:'Schweiz',flag:'🇨🇭',currency:'CHF',symbol:'CHF',rate:0.16},
                    {code:'TW',name:'Taiwan',flag:'🇹🇼',currency:'TWD',symbol:'NT$',rate:5.8},
                    {code:'TH',name:'Thailand',flag:'🇹🇭',currency:'THB',symbol:'฿',rate:6.5},
                    {code:'TR',name:'Türkiye',flag:'🇹🇷',currency:'TRY',symbol:'₺',rate:0.56},
                    {code:'UA',name:'Ukraina',flag:'🇺🇦',currency:'UAH',symbol:'₴',rate:7.2},
                    {code:'AE',name:'United Arab Emirates',flag:'🇦🇪',currency:'AED',symbol:'DH',rate:0.66},
                    {code:'US',name:'USA',flag:'🇺🇸',currency:'USD',symbol:'$',rate:0.18},
                    {code:'UY',name:'Uruguay',flag:'🇺🇾',currency:'UYU',symbol:'$',rate:0.0047},
                    {code:'VE',name:'Venezuela',flag:'🇻🇪',currency:'VES',symbol:'Bs.',rate:0.000005},
                    {code:'VN',name:'Vietnam',flag:'🇻🇳',currency:'VND',symbol:'₫',rate:4500}
                ],
                country: 'BR',
                locale: 'pt-BR',
                currency: 'BRL',
                isExpired: false,
                isFlipped: false,
                step: parseInt(localStorage.getItem('checkout_step_' + '{{ $transaction->uuid }}')) || {{ $step }},
                showSelector: false,
                processing: false,
                timeLeft: '30:00',

                changeCountry(code) {
                    const c = this.countries.find(x => x.code === code);
                    if (!c) return;
                    this.country = c.code;
                    this.selectedCountry = c;
                    
                    // Improved locale/currency logic
                    if (c.code === 'BR') {
                        this.locale = 'pt-BR';
                    } else if (['PT', 'AO', 'MZ'].includes(c.code)) {
                        this.locale = 'pt-PT';
                    } else if (['ES', 'MX', 'AR', 'CO', 'CL'].includes(c.code)) {
                        this.locale = 'es-ES';
                    } else {
                        this.locale = 'en-US';
                    }
                    
                    this.currency = c.currency;
                    this.currencySymbol = c.symbol;
                    localStorage.setItem('selected_country_code', code);
                    this.showSelector = false;
                },

                formatPrice(amount) {
                    const finalAmount = amount * (this.selectedCountry.rate || 1);
                    return new Intl.NumberFormat(this.locale, {
                        style: 'currency',
                        currency: this.currency,
                        minimumFractionDigits: 2
                    }).format(finalAmount);
                },
                
                init() {
                    const savedCode = localStorage.getItem('selected_country_code');
                    if (savedCode) {
                        this.changeCountry(savedCode);
                    } else {
                        const browserLang = navigator.language || 'pt-BR';
                        if (browserLang.includes('pt')) this.changeCountry('BR');
                        else if (browserLang.includes('es')) this.changeCountry('ES');
                        else this.changeCountry('US');
                    }

                    let startTime = localStorage.getItem('checkout_start_time_' + '{{ $transaction->uuid }}');
                    if (!startTime) {
                        startTime = Date.now();
                        localStorage.setItem('checkout_start_time_' + '{{ $transaction->uuid }}', startTime);
                    }

                    setInterval(() => {
                        if (this.isExpired) return;
                        const now = Date.now();
                        const elapsed = Math.floor((now - startTime) / 1000);
                        this.secondsRemaining = Math.max(0, 1800 - elapsed);
                        if (this.secondsRemaining === 0) {
                            this.isExpired = true;
                            setTimeout(() => {
                                this.isExpired = false;
                                startTime = Date.now();
                                localStorage.setItem('checkout_start_time_' + '{{ $transaction->uuid }}', startTime);
                            }, 30000);
                        }
                        const mins = Math.floor(this.secondsRemaining / 60);
                        const secs = this.secondsRemaining % 60;
                        this.timeLeft = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
                    }, 1000);
                },

                formatCardNumber(val) {
                    let v = val.replace(/\D/g, '');
                    let masked = v.match(/.{1,4}/g)?.join(' ') || v;
                    return masked || '0000 0000 0000 0000';
                },

                updateCardNumber(e) {
                    let value = e.target.value.replace(/\D/g, '');
                    let masked = value.match(/.{1,4}/g)?.join(' ') || value;
                    this.cardNumber = masked;
                    this.updateCardBrand();
                },

                updateCardExpiry(e) {
                    let value = e.target.value.replace(/\D/g, '');
                    if (value.length > 2) {
                        value = value.substring(0, 2) + '/' + value.substring(2, 4);
                    }
                    this.cardExpiry = value;
                },

                updateCardBrand() {
                    const num = this.cardNumber.replace(/\D/g, '');
                    if (num.length >= 2) {
                        // Elo patterns (common in Brazil)
                        const eloRegex = /^(401178|401179|431274|438935|451416|457393|457631|457632|504175|506699|5067|5090|627780|636297|636368|650031|650032|650033|650035|650036|650037|650038|650039|650040|650041|650042|650043|650044|650045|650046|650047|650048|650049|650050|650051|650405|650406|650407|650408|650409|650410|650411|650412|650413|650414|650415|650416|650417|650418|650419|650420|650421|650422|650423|650424|650425|650426|650427|650428|650429|650430|650431|650432|650433|650434|650435|650436|650437|650438|650439|650485|650486|650487|650488|650489|650490|650491|650492|650493|650494|650495|650496|650497|650498|650499|650500|650501|650502|650503|650504|650505|650506|650507|650508|650509|650510|650511|650512|650513|650514|650515|650516|650517|650518|650519|650520|650521|650522|650523|650524|650525|650526|650527|650528|650529|650530|650531|650532|650533|650534|650535|650536|650537|650538|650539|650541|650542|650543|650544|650545|650546|650547|650548|650549|650598|650700|650701|650702|650703|650704|650705|650706|650707|650708|650709|650710|650711|650712|650713|650714|650715|650716|650717|650718|650719|650720|650721|650722|650723|650724|650725|650726|650727|650901|650902|650903|650904|650905|650906|650907|650908|650909|650910|650911|650912|650913|650914|650915|650916|650917|650918|650919|650920|651652|651653|651654|651655|651656|651657|651658|651659|651660|651661|651662|651663|651664|651665|651666|651667|651668|651669|651670|651671|651672|651673|651674|651675|651676|651677|651678|651679|651680|651681|655000|655001)/;
                        
                        if (eloRegex.test(num)) this.cardBrand = 'elo';
                        else if (num.startsWith('4')) this.cardBrand = 'visa';
                        else if (num.match(/^(5[1-5]|2[2-7])/)) this.cardBrand = 'mastercard';
                        else if (num.match(/^(34|37)/)) this.cardBrand = 'amex';
                        else if (num.startsWith('6062')) this.cardBrand = 'hipercard';
                        else if (num.match(/^(301|305|36|38)/)) this.cardBrand = 'diners';
                        else this.cardBrand = 'default';
                    } else {
                        this.cardBrand = 'default';
                    }
                },

                goToStep2() { 
                    this.step = 2; 
                    localStorage.setItem('checkout_step_' + '{{ $transaction->uuid }}', 2);
                },
                processPayment() {
                    this.processing = true;
                    // Real form submission happens via button type="submit"
                },
                copyPix() {
                    const el = document.createElement('textarea');
                    el.value = document.getElementById('pixPayload').innerText;
                    document.body.appendChild(el);
                    el.select();
                    document.execCommand('copy');
                    document.body.removeChild(el);
                    alert('Código Pix copiado!');
                },
                getWhatsappLink() {
                    const msg = encodeURIComponent(`Ola, sou ${this.vendorName} e adquiri o basileia, queria saber os próximos passos!`);
                    return `https://wa.me/5511934924430?text=${msg}`;
                }
            }
        }
    </script>
</body>
</html>
