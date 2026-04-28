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
            gap: 60px;
            max-width: 1100px;
            width: 100%;
            align-items: center;
        }

        /* LEFT PANEL */
        .order-summary {
            padding-right: 20px;
        }
        .brand-logo {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 15px;
            margin-bottom: 40px;
            text-align: center;
        }
        .brand-logo img { height: 70px; width: auto; filter: drop-shadow(0 0 10px rgba(124, 58, 237, 0.3)); }
        .summary-label { font-size: 14px; color: #a99fbb; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 1px; }
        .plan-title { font-size: 56px; font-weight: 800; margin-bottom: 30px; line-height: 1.1; }
        .price-row { display: flex; align-items: baseline; gap: 10px; margin-bottom: 40px; }
        .price-currency { font-size: 24px; color: #a99fbb; }
        .price-value { font-size: 48px; font-weight: 800; }
        .price-period { font-size: 16px; color: #a99fbb; }
        
        .features-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 60px;
        }
        .feature-item { display: flex; align-items: center; gap: 10px; font-size: 15px; }
        .feature-item i { color: #22c55e; font-size: 18px; }

        .trust-footer {
            display: flex;
            gap: 30px;
            padding-top: 30px;
            border-top: 1px solid rgba(255,255,255,0.1);
            color: #a99fbb;
            font-size: 14px;
        }
        .trust-item { display: flex; align-items: center; gap: 8px; }

        /* RIGHT PANEL - THE BOOK */
        .book-container {
            position: relative;
            perspective: 2000px;
            width: 100%;
            max-width: 450px;
        }

        .layer {
            position: relative;
            background: white;
            border-radius: 24px;
            padding: 40px;
            color: #1e293b;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
            transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
            transform-origin: left center;
            z-index: 10;
        }

        /* Camadas de fundo para o efeito de "book" */
        .book-bg-layer {
            position: absolute;
            top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(124, 58, 237, 0.3);
            border-radius: 24px;
            transform: translate(12px, 12px) rotate(2deg);
            z-index: 1;
            filter: blur(2px);
        }
        .book-bg-layer-2 {
            position: absolute;
            top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(124, 58, 237, 0.15);
            border-radius: 24px;
            transform: translate(24px, 24px) rotate(4deg);
            z-index: 0;
            filter: blur(4px);
        }

        /* 3D CARD */
        .card-scene {
            width: 100%;
            height: 200px;
            perspective: 1000px;
            margin-bottom: 20px;
        }
        .card-inner {
            position: relative;
            width: 100%;
            height: 100%;
            transition: transform 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            transform-style: preserve-3d;
            cursor: pointer;
        }
        .card-inner.is-flipped { transform: rotateY(180deg); }
        .card-face {
            position: absolute;
            width: 100%;
            height: 100%;
            backface-visibility: hidden;
            border-radius: 16px;
            padding: 24px;
            color: white;
            box-shadow: 0 15px 35px rgba(0,0,0,0.2);
            background: linear-gradient(135deg, #7c3aed 0%, #4c1d95 100%);
        }
        .card-back { transform: rotateY(180deg); display: flex; flex-direction: column; justify-content: center; padding: 0; }
        .card-magnetic-strip { height: 40px; background: rgba(0,0,0,0.8); margin-top: 20px; }
        .card-cvv-strip { height: 35px; background: white; margin: 15px 20px; border-radius: 4px; display: flex; align-items: center; justify-content: flex-end; padding-right: 15px; color: #1e293b; font-family: 'Share Tech Mono', monospace; font-weight: bold; }
        
        .card-chip { width: 45px; height: 34px; background: linear-gradient(135deg, #ffd700 0%, #daa520 100%); border-radius: 6px; margin-bottom: 20px; }
        .card-number-display { font-family: 'Share Tech Mono', monospace; font-size: 22px; letter-spacing: 2px; margin-bottom: 25px; text-shadow: 0 2px 4px rgba(0,0,0,0.3); }
        .card-bottom { display: flex; justify-content: space-between; align-items: flex-end; }
        .card-label { font-size: 9px; opacity: 0.7; text-transform: uppercase; margin-bottom: 4px; }
        .card-value { font-size: 14px; font-weight: 600; text-transform: uppercase; }
        .card-brand-logo { position: absolute; top: 24px; right: 24px; height: 30px; opacity: 0; transition: opacity 0.3s; }
        .card-brand-logo.visible { opacity: 1; }
        .card-brand-logo.default { 
            opacity: 1; 
            background: white; 
            color: #7c3aed; 
            width: 40px; 
            height: 40px; 
            border-radius: 8px; 
            display: flex; 
            align-items: center; 
            justify-content: center;
            font-size: 20px; 
            font-weight: 900; 
        }

        /* Custom Selector */
        .custom-select-container { position: relative; width: 140px; }
        .custom-select-trigger {
            background: #f1f5f9;
            border: 1px solid #e2e8f0;
            padding: 8px 12px;
            border-radius: 10px;
            font-size: 13px;
            font-weight: 600;
            color: #475569;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 6px;
        }
        .custom-select-options {
            position: absolute;
            top: calc(100% + 5px);
            right: 0;
            width: 180px;
            background: white;
            border-radius: 12px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.1);
            border: 1px solid #e2e8f0;
            z-index: 100;
            max-height: 250px;
            overflow-y: auto;
            display: none;
        }
        .custom-select-options.show { display: block; }
        .custom-select-option {
            padding: 10px 15px;
            display: flex;
            align-items: center;
            gap: 10px;
            cursor: pointer;
            transition: background 0.2s;
            font-size: 13px;
        }
        .custom-select-option:hover { background: #f8fafc; }

        /* FORMS */
        .form-title { font-size: 24px; font-weight: 800; margin-bottom: 8px; }
        .form-subtitle { font-size: 14px; color: #64748b; margin-bottom: 25px; }
        .form-group { margin-bottom: 15px; }
        .form-label { display: block; font-size: 12px; font-weight: 700; color: #64748b; margin-bottom: 6px; text-transform: uppercase; }
        .form-input { width: 100%; height: 48px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 0 16px; font-size: 15px; font-family: inherit; transition: all 0.2s; }
        .form-input:focus { outline: none; border-color: var(--primary); box-shadow: 0 0 0 4px rgba(124, 58, 237, 0.1); }
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
        
        .btn-pay {
            width: 100%;
            height: 56px;
            background: linear-gradient(90deg, #7c3aed, #a855f7);
            color: white;
            border: none;
            border-radius: 16px;
            font-size: 16px;
            font-weight: 800;
            cursor: pointer;
            transition: all 0.3s;
            box-shadow: 0 10px 20px rgba(124, 58, 237, 0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            margin-top: 20px;
        }
        .btn-pay:hover { transform: translateY(-2px); box-shadow: 0 15px 30px rgba(124, 58, 237, 0.4); }
        .btn-pay:active { transform: translateY(0); }

        /* ANIMATIONS */
        [x-cloak] { display: none !important; }
        
        .layer-exit { transform: rotateY(-90deg) scale(0.9); opacity: 0; }
        .layer-enter { transform: rotateY(0deg) scale(1); opacity: 1; }

        /* PIX STYLES */
        .pix-container { text-align: center; }
        .pix-qr-box { background: white; padding: 20px; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); display: inline-block; margin-bottom: 20px; }
        .pix-qr-box img { width: 180px; height: 180px; }
        .pix-payload { background: #f8fafc; border: 1px dashed #cbd5e1; padding: 15px; border-radius: 10px; font-family: 'Share Tech Mono', monospace; font-size: 12px; word-break: break-all; margin-bottom: 20px; }

        /* SUCCESS STYLES */
        .success-icon { width: 80px; height: 80px; background: #ecfdf5; color: #10b981; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 32px; margin: 0 auto 20px; }
        .success-btns { display: grid; gap: 12px; margin-top: 30px; }
        .btn-secondary { background: #f1f5f9; color: #1e293b; text-decoration: none; padding: 14px; border-radius: 12px; font-weight: 700; font-size: 14px; display: flex; align-items: center; justify-content: center; gap: 8px; transition: background 0.2s; }
        .btn-secondary:hover { background: #e2e8f0; }

        @media (max-width: 900px) {
            body { padding: 10px; align-items: flex-start; }
            .checkout-wrapper { grid-template-columns: 1fr; gap: 20px; margin-top: 20px; }
            
            .order-summary { 
                background: rgba(255, 255, 255, 0.05); 
                padding: 20px; 
                border-radius: 20px; 
                border: 1px solid rgba(255, 255, 255, 0.1);
                text-align: left;
                cursor: pointer;
                order: -1;
                transition: all 0.3s ease;
            }
            .order-summary:hover { background: rgba(255, 255, 255, 0.08); }
            
            .brand-logo { margin-bottom: 0; flex-direction: row; justify-content: flex-start; gap: 10px; }
            .brand-logo img { height: 40px; }
            .brand-logo span { font-size: 20px; }
            
            .plan-title { font-size: 28px; margin: 15px 0 5px; }
            .price-row { margin-bottom: 20px; }
            .price-value { font-size: 32px; }
            
            .mobile-collapse-content { 
                max-height: 0; 
                overflow: hidden; 
                transition: max-height 0.5s ease-out, opacity 0.3s ease;
                opacity: 0;
            }
            .mobile-collapse-content.expanded { 
                max-height: 1000px; 
                opacity: 1;
                margin-top: 20px;
                padding-top: 20px;
                border-top: 1px solid rgba(255, 255, 255, 0.1);
            }
            
            .features-grid { grid-template-columns: 1fr; gap: 12px; margin-bottom: 30px; }
            .trust-footer { flex-direction: column; gap: 15px; }
            
            .book-container { max-width: 100%; }
            .layer { padding: 30px 20px; border-radius: 20px; }
            
            /* Toggle indicator */
            .expand-indicator {
                margin-left: auto;
                transition: transform 0.3s;
            }
            .expanded .expand-indicator { transform: rotate(180deg); }
        }
        
        @media (min-width: 901px) {
            .expand-indicator { display: none; }
            .mobile-collapse-content { max-height: none !important; opacity: 1 !important; }
        }
    </style>
</head>
<body x-data="checkoutFlow()">
    <div class="checkout-wrapper">
        <!-- SUMMARY PANEL -->
        <div class="order-summary" @click="summaryExpanded = !summaryExpanded">
            <div style="display: flex; align-items: center; width: 100%;">
                <div class="brand-logo" style="margin-bottom: 0; align-items: flex-start;">
                    <img src="https://basileia.global/wp-content/uploads/2024/09/Logo-Basileia-Horizontal-Branca.png" alt="Basileia" style="height: 40px; margin-bottom: 0;">
                </div>
                <i class="fas fa-chevron-down expand-indicator" :class="{ 'expanded': summaryExpanded }"></i>
            </div>
            
            <div class="mobile-collapse-content" :class="{ 'expanded': summaryExpanded }">
                <div class="summary-label" x-text="locale === 'pt-BR' ? 'Resumo do pedido' : 'Order summary'" style="margin-top: 30px;"></div>
                <h1 class="plan-title" style="margin-bottom: 10px;">{{ $plano }}</h1>
                
                <div class="price-row" style="margin-bottom: 40px;">
                    <span class="price-value" style="font-size: 56px;" x-text="selectedCountry.symbol + ' ' + formatPrice(originalAmount)"></span>
                    <span class="price-period">/{{ $ciclo }}</span>
                </div>

                <div class="features-grid">
                    <div class="feature-item"><i class="fas fa-check-circle"></i> <span x-text="locale === 'pt-BR' ? 'IA via WhatsApp' : 'AI via WhatsApp'"></span></div>
                    <div class="feature-item"><i class="fas fa-check-circle"></i> <span x-text="locale === 'pt-BR' ? 'Gestão de Células (CGs)' : 'Cell/Small Group Management'"></span></div>
                    <div class="feature-item"><i class="fas fa-check-circle"></i> <span x-text="locale === 'pt-BR' ? 'Conformidade LGPD' : 'GDPR/LGPD Compliance'"></span></div>
                    <div class="feature-item"><i class="fas fa-check-circle"></i> <span x-text="locale === 'pt-BR' ? 'Suporte Humanizado' : 'Humanized Support'"></span></div>
                    <div class="feature-item"><i class="fas fa-check-circle"></i> <span x-text="locale === 'pt-BR' ? 'Múltiplas Igrejas' : 'Multiple Churches'"></span></div>
                    <div class="feature-item"><i class="fas fa-check-circle"></i> <span x-text="locale === 'pt-BR' ? 'Implantação Rápida' : 'Quick Implementation'"></span></div>
                </div>

                <div class="trust-footer">
                    <div class="trust-item"><i class="fas fa-lock"></i> <span x-text="locale === 'pt-BR' ? 'Pagamento 100% seguro' : '100% secure payment'"></span></div>
                    <div class="trust-item"><i class="fas fa-shield-alt"></i> <span x-text="locale === 'pt-BR' ? 'Garantia de 7 dias' : '7-day guarantee'"></span></div>
                </div>
            </div>
        </div>

        <!-- THE BOOK (Right Panel) -->
        <div class="book-container">
            <div class="book-bg-layer"></div>
            <div class="book-bg-layer-2"></div>

            <!-- LAYER 1: PAYMENT -->
            <div class="layer" x-show="step === 1" x-transition:enter="layer-enter" x-transition:leave="layer-exit">
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
                    <p class="form-subtitle" x-text="locale === 'pt-BR' ? 'Escolha como deseja pagar seu plano' : 'Choose how you want to pay'"></p>
                </div>

                @if(($asaasPayment['billingType'] ?? 'PIX') === 'PIX')
                    <!-- PIX FLOW -->
                    <div class="pix-container">
                        <div class="pix-qr-box" style="border: 2px solid var(--primary); box-shadow: 0 0 20px rgba(124, 58, 237, 0.2);">
                            <img src="data:image/png;base64,{{ $pixData['encodedImage'] ?? '' }}" alt="QR Code PIX">
                        </div>
                        
                        <div style="display: flex; flex-direction: column; align-items: center; gap: 8px; margin-bottom: 25px; text-align: center;">
                            <div class="summary-label" style="font-size: 12px;" x-text="locale === 'pt-BR' ? 'VALOR' : 'VALUE'"></div>
                            <div style="font-size: 32px; font-weight: 900; color: #1e293b;" x-text="formatPrice({{ $transaction->amount }})"></div>
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
                    <div class="card-scene" @click="isFlipped = !isFlipped">
                        <div class="card-inner" :class="{ 'is-flipped': isFlipped }">
                            <div class="card-face card-front">
                                <div class="card-chip"></div>
                                <div class="card-brand-logo default" :class="{ 'visible': cardBrand === 'default' }">B</div>
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

                    <div style="text-align: center; margin-bottom: 20px;">
                        <div class="summary-label" style="font-size: 12px;" x-text="locale === 'pt-BR' ? 'VALOR' : 'VALUE'"></div>
                        <div style="font-size: 32px; font-weight: 900; color: #1e293b;" x-text="formatPrice({{ $transaction->amount }})"></div>
                    </div>

                    <form id="paymentForm" @submit.prevent="goToStep2()">
                        <div class="form-group">
                            <label class="form-label">Número do Cartão</label>
                            <input type="text" class="form-input" x-model="cardNumber" @input="updateCardBrand()" placeholder="0000 0000 0000 0000" maxlength="19" required>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label">Validade</label>
                                <input type="text" class="form-input" x-model="cardExpiry" placeholder="MM/AA" maxlength="5" required>
                            </div>
                            <div class="form-group">
                                <label class="form-label">CVV</label>
                                <input type="text" class="form-input" x-model="cardCvv" @focus="isFlipped = true" @blur="isFlipped = false" placeholder="000" maxlength="4" required>
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Nome no Cartão</label>
                            <input type="text" class="form-input" x-model="cardHolder" placeholder="Como impresso no cartão" required>
                        </div>
                        <button type="submit" class="btn-pay">
                            Assinar Agora <i class="fas fa-arrow-right"></i>
                        </button>
                    </form>
                @endif
            </div>

            <!-- LAYER 2: CONFIRMATION (DISTRACTION) -->
            <div class="layer" x-show="step === 2" x-transition:enter="layer-enter" x-transition:leave="layer-exit" x-cloak>
                <div style="margin-bottom: 25px;">
                    <div class="summary-label" style="font-size: 10px; margin-bottom: 4px;" x-text="locale === 'pt-BR' ? 'EXPIRA EM' : 'EXPIRES IN'"></div>
                    <div style="font-size: 14px; font-weight: 800; background: #fef2f2; color: #dc2626; padding: 6px 12px; border-radius: 10px; display: inline-block; letter-spacing: 1px;" x-text="timeLeft"></div>
                </div>
                <h2 class="form-title">Confirme seus dados</h2>
                <p class="form-subtitle">Quase lá! Verifique se as informações da sua igreja estão corretas.</p>

                <div class="form-group">
                    <label class="form-label">Nome da Igreja / Instituição</label>
                    <input type="text" class="form-input" x-model="vendorName" placeholder="Ex: Igreja Central">
                </div>
                <div class="form-group">
                    <label class="form-label">E-mail de Contato</label>
                    <input type="email" class="form-input" x-model="vendorEmail" placeholder="contato@igreja.com">
                </div>
                <div class="form-group">
                    <label class="form-label">Documento (CPF/CNPJ)</label>
                    <input type="text" class="form-input" x-model="vendorDoc" placeholder="00.000.000/0001-00">
                </div>

                <div style="background: #f0fdf4; border: 1px solid #dcfce7; padding: 15px; border-radius: 12px; margin-bottom: 20px;">
                    <p style="color: #166534; font-size: 13px; display: flex; gap: 8px;">
                        <i class="fas fa-info-circle" style="margin-top: 3px;"></i>
                        Enquanto você revisa, nosso sistema está validando sua transação com a operadora.
                    </p>
                </div>

                <button class="btn-pay" @click="processPayment()" :disabled="processing">
                    <template x-if="!processing">
                        <span>Confirmar e Finalizar <i class="fas fa-check"></i></span>
                    </template>
                    <template x-if="processing">
                        <span><i class="fas fa-circle-notch fa-spin"></i> Processando...</span>
                    </template>
                </button>
            </div>

            <!-- LAYER 3: SUCCESS -->
            <div class="layer" x-show="step === 3" x-transition:enter="layer-enter" x-transition:leave="layer-exit" x-cloak>
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

                originalAmount: {{ $transaction->amount / 100 }},
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

                formatPrice(value) {
                    const converted = value * this.selectedCountry.rate;
                    return converted.toLocaleString('pt-BR', { 
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                    });
                },

                changeCountry(code) {
                    const found = this.countries.find(c => c.code === code);
                    if (found) {
                        this.selectedCountry = found;
                    }
                    this.showSelector = false;
                },

                init() {
                    // Auto-detect language
                    const browserLang = navigator.language || 'pt-BR';
                    const matched = this.countries.find(c => browserLang.includes(c.locale));
                    if (matched) this.changeCountry(matched.code);

                    // Timer Persistence
                    let startTime = localStorage.getItem('checkout_start_time_' + '{{ $transaction->uuid }}');
                    if (!startTime) {
                        startTime = Date.now();
                        localStorage.setItem('checkout_start_time_' + '{{ $transaction->uuid }}', startTime);
                    }

                    setInterval(() => {
                        const now = Date.now();
                        const elapsed = Math.floor((now - startTime) / 1000);
                        this.secondsRemaining = Math.max(0, 1800 - elapsed);
                        
                        const mins = Math.floor(this.secondsRemaining / 60);
                        const secs = this.secondsRemaining % 60;
                        this.timeLeft = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
                    }, 1000);
                },

                changeCountry(code) {
                    const c = this.countries.find(x => x.code === code);
                    if (!c) return;
                    this.country = c.code;
                    this.locale = c.locale;
                    this.currency = c.currency;
                    this.currencySymbol = c.symbol;
                },

                formatPrice(amount) {
                    const c = this.countries.find(x => x.code === this.country);
                    const finalAmount = amount * (c.rate || 1);
                    
                    return new Intl.NumberFormat(this.locale, {
                        style: 'currency',
                        currency: this.currency,
                        minimumFractionDigits: 2
                    }).format(finalAmount);
                },

                formatCardNumber(val) {
                    let v = val.replace(/\D/g, '');
                    let match = v.match(/\d{4,16}/);
                    let m = match ? match[0] : '';
                    let parts = [];
                    for (let i=0, len=m.length; i<len; i+=4) {
                        parts.push(m.substring(i, i+4));
                    }
                    if (parts.length) return parts.join(' ');
                    return val || '0000 0000 0000 0000';
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
                    setTimeout(() => { this.step = 3; this.processing = false; }, 2000);
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
