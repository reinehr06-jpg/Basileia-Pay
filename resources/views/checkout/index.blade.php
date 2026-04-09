<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>{{ $transaction->description ?? 'Pagamento' }} - Basileia</title>
    <script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
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
            --success: #10b981;
        }
        body {
            font-family: 'Inter', sans-serif;
            background: linear-gradient(135deg, var(--bg-dark) 0%, #1e1b4b 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        .checkout-wrapper {
            display: grid;
            grid-template-columns: 1fr 380px;
            max-width: 900px;
            width: 100%;
            background: white;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        }
        .left-panel {
            background: linear-gradient(135deg, var(--primary-dark) 0%, var(--primary) 100%);
            padding: 32px;
            color: white;
            display: flex;
            flex-direction: column;
        }
        .brand {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 24px;
        }
        .brand-icon {
            width: 36px;
            height: 36px;
            background: white;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 900;
            color: var(--primary);
            font-size: 20px;
        }
        .brand-name {
            font-weight: 800;
            font-size: 18px;
        }
        .plan-badge {
            background: rgba(255,255,255,0.15);
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 11px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            width: fit-content;
            margin-bottom: 16px;
        }
        .plan-title {
            font-size: 24px;
            font-weight: 700;
            margin-bottom: 8px;
        }
        .price {
            display: flex;
            align-items: baseline;
            gap: 4px;
            margin-bottom: 24px;
        }
        .price-currency {
            font-size: 18px;
            font-weight: 600;
        }
        .price-value {
            font-size: 36px;
            font-weight: 800;
        }
        .price-period {
            font-size: 14px;
            opacity: 0.8;
        }
        .features {
            display: grid;
            gap: 12px;
            margin-bottom: auto;
        }
        .feature-item {
            display: flex;
            align-items: center;
            gap: 10px;
            font-size: 13px;
        }
        .feature-icon {
            width: 20px;
            height: 20px;
            background: rgba(255,255,255,0.2);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 10px;
        }
        .security-badge {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 12px;
            opacity: 0.9;
            margin-top: 20px;
            padding-top: 20px;
            border-top: 1px solid rgba(255,255,255,0.2);
        }
        
        .right-panel {
            padding: 32px;
            display: flex;
            flex-direction: column;
        }
        .form-title {
            font-size: 18px;
            font-weight: 700;
            color: var(--text-dark);
            margin-bottom: 20px;
        }
        .payment-method-toggle {
            display: flex;
            gap: 8px;
            margin-bottom: 20px;
            background: #f1f5f9;
            padding: 4px;
            border-radius: 10px;
        }
        .payment-method-btn {
            flex: 1;
            padding: 10px;
            border: none;
            border-radius: 8px;
            background: transparent;
            color: var(--text-muted);
            font-size: 13px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
        }
        .payment-method-btn.active {
            background: white;
            color: var(--primary);
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        
        .form-group {
            margin-bottom: 14px;
        }
        .form-label {
            display: block;
            font-size: 12px;
            font-weight: 600;
            color: var(--text-dark);
            margin-bottom: 6px;
        }
        .form-input {
            width: 100%;
            height: 40px;
            border: 1px solid var(--border);
            border-radius: 8px;
            padding: 0 12px;
            font-size: 14px;
            font-family: 'Inter', sans-serif;
            transition: border-color 0.2s;
        }
        .form-input:focus {
            outline: none;
            border-color: var(--primary);
        }
        .form-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
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
            transition: all 0.2s;
            margin-top: 16px;
        }
        .cta-button:hover {
            background: var(--primary-dark);
        }
        
        /* PIX Section */
        .pix-section {
            text-align: center;
            padding: 10px 0;
        }
        .pix-qrcode {
            background: white;
            padding: 12px;
            border-radius: 12px;
            box-shadow: 0 2px 12px rgba(0,0,0,0.08);
            display: inline-block;
            margin-bottom: 16px;
        }
        .pix-qrcode img {
            width: 140px;
            height: 140px;
            display: block;
        }
        .pix-code-box {
            background: #f8fafc;
            border: 1px dashed #cbd5e1;
            border-radius: 8px;
            padding: 12px;
            margin-bottom: 12px;
        }
        .pix-code-label {
            font-size: 10px;
            font-weight: 600;
            color: var(--text-muted);
            text-transform: uppercase;
            margin-bottom: 6px;
        }
        .pix-code-value {
            font-family: monospace;
            font-size: 10px;
            color: var(--text-dark);
            word-break: break-all;
        }
        .pix-copy-btn {
            width: 100%;
            padding: 12px;
            border: none;
            border-radius: 8px;
            background: var(--primary);
            color: white;
            font-size: 13px;
            font-weight: 600;
            cursor: pointer;
        }
        .pix-info {
            margin-top: 12px;
            padding: 10px;
            background: #ecfdf5;
            border-radius: 8px;
            font-size: 11px;
            color: #065f46;
        }
        
        .footer-note {
            text-align: center;
            color: var(--text-muted);
            font-size: 11px;
            margin-top: auto;
            padding-top: 16px;
        }
        
        @media (max-width: 768px) {
            .checkout-wrapper {
                grid-template-columns: 1fr;
            }
            .left-panel {
                padding: 24px;
            }
            .right-panel {
                padding: 24px;
            }
        }
    </style>
</head>
<body
    x-data="{
        billingType: '{{ $billingType ?? 'CREDIT_CARD' }}',
        pixCopied: false,
        copyPixCode() {
            navigator.clipboard.writeText('{{ $pixData['payload'] ?? '' }}');
            this.pixCopied = true;
            setTimeout(() => this.pixCopied = false, 2000);
        }
    }"
>
    <div class="checkout-wrapper">
        <!-- LEFT -->
        <div class="left-panel">
            <div class="brand">
                <div class="brand-icon">B</div>
                <span class="brand-name">Basileia</span>
            </div>
            <div class="plan-badge">Plano Premium</div>
            <h1 class="plan-title">{{ $transaction->description ?? 'Pagamento' }}</h1>
            <div class="price">
                <span class="price-currency">R$</span>
                <span class="price-value">{{ number_format($transaction->amount, 2, ',', '.') }}</span>
                <span class="price-period">/mensal</span>
            </div>
            <div class="features">
                <div class="feature-item">
                    <div class="feature-icon">✓</div>
                    <span>Acesso imediato após pagamento</span>
                </div>
                <div class="feature-item">
                    <div class="feature-icon">✓</div>
                    <span>Suporte 24h</span>
                </div>
                <div class="feature-item">
                    <div class="feature-icon">✓</div>
                    <span>Cancelamento anytime</span>
                </div>
            </div>
            <div class="security-badge">
                <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/></svg>
                Pagamento 100% Seguro
            </div>
        </div>

        <!-- RIGHT -->
        <div class="right-panel">
            <h2 class="form-title">Finalizar Pagamento</h2>
            
            <div class="payment-method-toggle">
                <button type="button" class="payment-method-btn" :class="{ 'active': billingType === 'PIX' }" @click="billingType = 'PIX'">
                    <i class="fas fa-qrcode"></i> PIX
                </button>
                <button type="button" class="payment-method-btn" :class="{ 'active': billingType === 'CREDIT_CARD' }" @click="billingType = 'CREDIT_CARD'">
                    <i class="fas fa-credit-card"></i> Cartão
                </button>
            </div>

            <template x-if="billingType === 'PIX'">
                <div class="pix-section">
                    <div class="pix-qrcode">
                        @if(!empty($pixData['encodedImage']))
                            <img src="data:image/png;base64,{{ $pixData['encodedImage'] }}" alt="QR Code PIX">
                        @else
                            <div style="width:140px;height:140px;display:flex;align-items:center;justify-content:center;background:#f1f5f9;color:#94a3b8;">
                                <i class="fas fa-qrcode fa-3x"></i>
                            </div>
                        @endif
                    </div>
                    <div class="pix-code-box">
                        <div class="pix-code-label">Código PIX Copia e Cola</div>
                        <div class="pix-code-value">{{ $pixData['payload'] ?? 'Aguardando...' }}</div>
                    </div>
                    <button type="button" class="pix-copy-btn" @click="copyPixCode()">
                        <span x-show="!pixCopied"><i class="fas fa-copy"></i> Copiar Código PIX</span>
                        <span x-show="pixCopied"><i class="fas fa-check"></i> Copiado!</span>
                    </button>
                    <div class="pix-info">
                        <i class="fas fa-check-circle"></i> Pagamento instantâneo confirmado em segundos
                    </div>
                </div>
            </template>

            <template x-if="billingType === 'CREDIT_CARD'">
                <form method="POST" action="{{ route('checkout.process', $transaction->uuid) }}">
                    @csrf
                    <input type="hidden" name="payment_method" value="credit_card">
                    <div class="form-group">
                        <label class="form-label">Email</label>
                        <input type="email" name="email" class="form-input" placeholder="seu@email.com" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Número do Cartão</label>
                        <input type="text" name="card_number" class="form-input" placeholder="0000 0000 0000 0000" maxlength="19" required>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">Validade</label>
                            <input type="text" name="card_expiry" class="form-input" placeholder="MM/AA" maxlength="5" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label">CVC</label>
                            <input type="text" name="card_cvv" class="form-input" placeholder="123" maxlength="4" required>
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Nome no Cartão</label>
                        <input type="text" name="card_holder_name" class="form-input" placeholder="NOME COMPLETO" required>
                    </div>
                    <button type="submit" class="cta-button">
                        Pagar R$ {{ number_format($transaction->amount, 2, ',', '.') }}
                    </button>
                </form>
            </template>

            <div class="footer-note">
                Basileia Secure &copy; {{ date('Y') }}
            </div>
        </div>
    </div>
</body>
</html>
