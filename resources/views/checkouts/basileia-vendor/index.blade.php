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
        body {
            font-family: 'Inter', sans-serif;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
            background: linear-gradient(135deg, #0f0a1e 0%, #1a103c 50%, #2d1b69 100%);
            color: white;
            overflow-x: hidden;
        }

        .checkout-wrapper {
            display: grid;
            grid-template-columns: 1fr 1.2fr;
            gap: 40px;
            max-width: 1100px;
            width: 100%;
            align-items: center;
        }

        /* LEFT PANEL */
        .order-summary {
            padding-right: 10px;
        }
        .brand-logo {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 10px;
            margin-bottom: 20px;
            text-align: center;
        }
        .brand-logo img { height: 50px; width: auto; filter: drop-shadow(0 0 10px rgba(124, 58, 237, 0.3)); }
        .summary-label { font-size: 13px; color: #a99fbb; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 1px; }
        .plan-title { font-size: 42px; font-weight: 800; margin-bottom: 20px; line-height: 1.1; }
        .price-row { display: flex; align-items: baseline; gap: 10px; margin-bottom: 30px; }
        .price-currency { font-size: 20px; color: #a99fbb; }
        .price-value { font-size: 40px; font-weight: 800; }
        .price-period { font-size: 14px; color: #a99fbb; }
        
        .features-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            margin-bottom: 40px;
        }
        .feature-item { display: flex; align-items: center; gap: 10px; font-size: 14px; }
        .feature-item i { color: #22c55e; font-size: 16px; }

        .trust-footer {
            display: flex;
            gap: 20px;
            padding-top: 20px;
            border-top: 1px solid rgba(255,255,255,0.1);
            color: #a99fbb;
            font-size: 13px;
        }
        .trust-item { display: flex; align-items: center; gap: 8px; }

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
            padding: 30px;
            color: #1e293b;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
            transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
            transform-origin: left center;
            z-index: 10;
        }

        .book-bg-layer {
            position: absolute;
            top: 8px;
            left: 8px;
            right: -8px;
            bottom: -8px;
            background: #f5f3ff; /* Very light purple */
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
            background: #ede9fe; /* Slightly darker light purple */
            border: 1px solid #ddd6fe;
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
        .card-brand-logo { position: absolute; top: 20px; right: 20px; height: 25px; opacity: 0; transition: opacity 0.3s; }
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
        .layer-enter { 
            opacity: 0; 
            transform: rotateY(-90deg) scale(0.9); 
            transform-origin: left center;
        }
        .layer-enter-active {
            transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .layer-exit { 
            opacity: 0; 
            transform: rotateY(90deg) scale(0.9); 
            transform-origin: right center;
        }
        .layer-exit-active {
            transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
        }

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
            .checkout-wrapper { grid-template-columns: 1fr; gap: 30px; }
            .order-summary { text-align: center; padding-right: 0; }
            .plan-title { font-size: 36px; }
            .price-row { justify-content: center; }
            .features-grid { justify-content: center; }
            .book-container { margin: 0 auto; }
        }
    </style>
</head>
<body x-data="checkoutFlow()" x-init="init()">

    <div class="checkout-wrapper">
        <!-- LEFT PANEL -->
        <div class="order-summary">
            <div class="brand-logo">
                <img src="https://dash.basileia.global/assets/logo-basileia-horizontal.png" alt="Basiléia Logo">
                <div style="background: rgba(124, 58, 237, 0.1); padding: 6px 15px; border-radius: 20px; font-size: 12px; font-weight: 700; color: var(--primary-light); text-transform: uppercase; letter-spacing: 1px;">
                    Checkout 100% Seguro
                </div>
            </div>

            <div class="summary-label" x-text="locale === 'pt-BR' ? 'Você selecionou o plano' : 'You selected the plan'"></div>
            <h1 class="plan-title" style="color: white;">{{ $plano }}</h1>

            <div class="price-row">
                <span class="price-currency" x-text="currencySymbol"></span>
                <span class="price-value" x-text="formatPrice(originalAmount).replace(/[^0-9,.]/g, '')"></span>
                <span class="price-period" x-text="locale === 'pt-BR' ? '/ mês' : '/ month'"></span>
            </div>

            <div class="features-grid">
                <div class="feature-item"><i class="fas fa-check-circle"></i> <span x-text="locale === 'pt-BR' ? 'Conformidade LGPD' : 'GDPR/LGPD Compliance'"></span></div>
                <div class="feature-item"><i class="fas fa-check-circle"></i> <span x-text="locale === 'pt-BR' ? 'Suporte Humanizado' : 'Human Support'"></span></div>
                <div class="feature-item"><i class="fas fa-check-circle"></i> <span x-text="locale === 'pt-BR' ? 'Múltiplas Igrejas' : 'Multiple Churches'"></span></div>
                <div class="feature-item"><i class="fas fa-check-circle"></i> <span x-text="locale === 'pt-BR' ? 'Implantação Rápida' : 'Quick Deployment'"></span></div>
            </div>

            <div class="trust-footer">
                <div class="trust-item"><i class="fas fa-lock"></i> <span x-text="locale === 'pt-BR' ? 'Pagamento 100% seguro' : '100% secure payment'"></span></div>
                <div class="trust-item"><i class="fas fa-shield-alt"></i> <span x-text="locale === 'pt-BR' ? 'Garantia de 7 dias' : '7-day guarantee'"></span></div>
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

            <!-- LAYER 1 & 2: PAYMENT FLOW -->
            <div class="layer" x-show="step === 1 || step === 2" 
                 x-transition:enter="layer-enter-active"
                 x-transition:enter-start="layer-enter"
                 x-transition:leave="layer-exit-active"
                 x-transition:leave-start="layer-exit">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px;">
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

                <div style="text-align: center; margin-bottom: 25px;">
                    <h2 class="form-title" x-text="locale === 'pt-BR' ? 'Dados de Pagamento' : 'Payment Details'" style="margin-bottom: 5px;"></h2>
                </div>

                @if(($asaasPayment['billingType'] ?? 'PIX') === 'PIX')
                    <!-- PIX FLOW -->
                    <div class="pix-container">
                        <div class="pix-qr-box" style="border: 2px solid var(--primary); box-shadow: 0 0 20px rgba(124, 58, 237, 0.2);">
                            <img src="data:image/png;base64,{{ $pixData['encodedImage'] ?? '' }}" alt="QR Code PIX">
                        </div>
                        
                        <div style="display: flex; flex-direction: column; align-items: center; gap: 8px; margin-bottom: 25px; text-align: center;">
                            <div class="summary-label" style="font-size: 12px;" x-text="locale === 'pt-BR' ? 'VALOR' : 'VALUE'"></div>
                            <div style="font-size: 32px; font-weight: 900; color: #1e293b;" x-text="formatPrice(originalAmount)"></div>
                        </div>

                        <div class="pix-payload" id="pixPayload" style="text-align: left;">{{ $pixData['payload'] ?? '' }}</div>
                        
                        <button class="btn-pay" @click="copyPix()">
                            <i class="fas fa-copy"></i> <span x-text="locale === 'pt-BR' ? 'Copiar Código Pix' : 'Copy Pix Code'"></span>
                        </button>
                        
                        <div style="margin-top: 20px; color: #64748b; font-size: 12px; display: flex; align-items: center; justify-content: center; gap: 8px;">
                            <i class="fas fa-check-circle" style="color: #10b981;"></i>
                            Após o pagamento, a confirmação é automática.
                        </div>
                    </div>
                @else
                    <!-- CARD FLOW -->
                    <div class="card-scene" @click="isFlipped = !isFlipped" x-show="step === 1">
                        <div class="card-inner" :class="{ 'is-flipped': isFlipped }">
                            <div class="card-face card-front">
                                <div class="card-chip"></div>
                                <div class="card-brand-logo default" x-show="cardBrand === 'default'">B</div>
                                <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" class="card-brand-logo" :class="{ 'visible': cardBrand === 'visa' }" alt="Visa">
                                <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" class="card-brand-logo" :class="{ 'visible': cardBrand === 'mastercard' }" alt="Mastercard">
                                
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

                    <div style="text-align: center; margin-bottom: 20px;" x-show="step === 1">
                        <div class="summary-label" style="font-size: 12px;" x-text="locale === 'pt-BR' ? 'VALOR' : 'VALUE'"></div>
                        <div style="font-size: 32px; font-weight: 900; color: #1e293b;" x-text="formatPrice(originalAmount)"></div>
                    </div>

                    <form id="paymentForm" method="POST" action="{{ route('checkout.process', $transaction->uuid) }}">
                        @csrf
                        <div x-show="step === 1">
                            <div class="form-group">
                                <label class="form-label" x-text="locale === 'pt-BR' ? 'Número do Cartão' : 'Card Number'"></label>
                                <input type="text" name="card_number" class="form-input" x-model="cardNumber" @input="updateCardNumber($event)" placeholder="0000 0000 0000 0000" maxlength="19" required>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label class="form-label" x-text="locale === 'pt-BR' ? 'Validade' : 'Expiry'"></label>
                                    <input type="text" name="card_expiry" class="form-input" x-model="cardExpiry" @input="updateCardExpiry($event)" placeholder="MM/AA" maxlength="5" required>
                                </div>
                                <div class="form-group">
                                    <label class="form-label" x-text="locale === 'pt-BR' ? 'CVV' : 'CVV'"></label>
                                    <input type="text" name="card_cvv" class="form-input" x-model="cardCvv" @focus="isFlipped = true" @blur="isFlipped = false" placeholder="000" maxlength="4" required>
                                </div>
                            </div>
                            <div class="form-group">
                                <label class="form-label" x-text="locale === 'pt-BR' ? 'Nome no Cartão' : 'Cardholder Name'"></label>
                                <input type="text" name="card_name" class="form-input" x-model="cardHolder" placeholder="Como impresso no cartão" required>
                            </div>
                            <button type="button" class="btn-pay" @click="step = 2">
                                Assinar Agora <i class="fas fa-arrow-right"></i>
                            </button>
                        </div>

                        <!-- LAYER 2: CONFIRMATION -->
                        <div x-show="step === 2" x-cloak>
                            <h2 class="form-title" x-text="locale === 'pt-BR' ? 'Confirme seus dados' : 'Confirm your details'"></h2>
                            <p class="form-subtitle" x-text="locale === 'pt-BR' ? 'Quase lá! Verifique se as informações da sua igreja estão corretas.' : 'Almost there! Check if your information is correct.'"></p>

                            <div class="form-group">
                                <label class="form-label">Nome da Igreja / Instituição</label>
                                <input type="text" name="customer_name" class="form-input" x-model="vendorName" placeholder="Ex: Igreja Central">
                            </div>
                            <div class="form-group">
                                <label class="form-label">E-mail de Contato</label>
                                <input type="email" name="customer_email" class="form-input" x-model="vendorEmail" placeholder="contato@igreja.com">
                            </div>
                            <div class="form-group">
                                <label class="form-label">Documento (CPF/CNPJ)</label>
                                <input type="text" name="customer_document" class="form-input" x-model="vendorDoc" placeholder="00.000.000/0001-00">
                            </div>

                            <div style="background: #f0fdf4; border: 1px solid #dcfce7; padding: 15px; border-radius: 12px; margin-bottom: 20px;">
                                <p style="color: #166534; font-size: 13px; display: flex; gap: 8px;">
                                    <i class="fas fa-info-circle" style="margin-top: 3px;"></i>
                                    Enquanto você revisa, nosso sistema está validando sua transação com a operadora.
                                </p>
                            </div>

                            <button type="submit" class="btn-pay" @click="processing = true">
                                <template x-if="!processing">
                                    <span>Confirmar e Finalizar <i class="fas fa-check"></i></span>
                                </template>
                                <template x-if="processing">
                                    <span><i class="fas fa-circle-notch fa-spin"></i> Processando...</span>
                                </template>
                            </button>
                            
                            <button type="button" class="btn-secondary" @click="step = 1" style="margin-top: 10px; width: 100%;" x-show="!processing">
                                <i class="fas fa-arrow-left"></i> Voltar
                            </button>
                        </div>
                    </form>
                @endif
            </div>

            <!-- LAYER 3: SUCCESS -->
            <div class="layer" x-show="step === 3" 
                 x-transition:enter="layer-enter-active"
                 x-transition:enter-start="layer-enter"
                 x-transition:leave="layer-exit-active"
                 x-transition:leave-start="layer-exit"
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
                step: {{ $step ?? 1 }},
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
                vendorName: '{{ $customerData['name'] ?? '' }}',
                vendorEmail: '{{ $customerData['email'] ?? '' }}',
                vendorDoc: '{{ $customerData['document'] ?? '' }}',

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
                step: {{ $step }},
                showSelector: false,
                processing: false,
                timeLeft: '30:00',

                changeCountry(code) {
                    const c = this.countries.find(x => x.code === code);
                    if (!c) return;
                    this.country = c.code;
                    this.selectedCountry = c;
                    this.locale = c.currency === 'BRL' ? 'pt-BR' : 'en-US';
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
                    if (num.length >= 4) {
                        if (num.startsWith('4')) this.cardBrand = 'visa';
                        else if (num.match(/^5[1-5]/)) this.cardBrand = 'mastercard';
                        else this.cardBrand = 'default';
                    } else {
                        this.cardBrand = 'default';
                    }
                },

                goToStep2() { this.step = 2; },
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
