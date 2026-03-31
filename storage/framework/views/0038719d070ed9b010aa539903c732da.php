<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="<?php echo e(csrf_token()); ?>">
    <title><?php echo e($transaction->description ?? 'Pagamento'); ?> - Basileia</title>
    <script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js"></script>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Inter', 'Segoe UI', sans-serif; }

        body {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background:
                radial-gradient(circle at 10% 85%, rgba(181,150,255,0.18), transparent 28%),
                radial-gradient(circle at 88% 18%, rgba(255,255,255,0.30), transparent 20%),
                linear-gradient(180deg, #f1eef7 0%, #ece8f2 100%);
            background-color: #efedf6;
            overflow: hidden;
            position: relative;
        }

        /* BACK BUTTON */
        .back-link {
            position: fixed;
            left: 2.5%;
            top: 4.5%;
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 15px;
            font-weight: 500;
            letter-spacing: 0.2px;
            color: #5a536f;
            text-decoration: none;
            z-index: 5;
            cursor: pointer;
        }
        .back-link svg { width: 18px; height: 18px; }

        /* MAIN CARD */
        .main-card {
            position: fixed;
            left: 8%;
            top: 10%;
            width: 81%;
            height: 79%;
            border-radius: 28px;
            overflow: hidden;
            background: #ffffff;
            box-shadow: 0 18px 60px rgba(104,74,150,0.10);
            z-index: 2;
            display: flex;
        }

        /* LEFT PANEL */
        .left-panel {
            position: relative;
            width: 49%;
            height: 100%;
            background:
                radial-gradient(circle at 62% 28%, rgba(255,255,255,0.10), transparent 28%),
                radial-gradient(circle at 15% 92%, rgba(255,255,255,0.08), transparent 22%),
                linear-gradient(145deg, #6e27c4 0%, #962fcb 48%, #c56ab7 100%);
            z-index: 1;
            padding: 5% 11% 0 11%;
            display: flex;
            flex-direction: column;
        }

        /* BRAND */
        .brand {
            display: flex;
            align-items: center;
            gap: 12px;
            color: #fff;
            margin-bottom: 18px;
        }
        .brand-icon {
            width: 52px;
            height: 52px;
            border-radius: 10px;
            background: #ffffff;
            color: #7c2ef0;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 28px;
            font-weight: 800;
        }
        .brand-text {
            font-size: 31px;
            font-weight: 700;
            line-height: 1;
        }

        /* BADGE */
        .plan-badge {
            display: inline-block;
            padding: 11px 28px;
            border-radius: 999px;
            background: rgba(86,18,161,0.42);
            color: #ffffff;
            font-size: 18px;
            font-weight: 600;
            letter-spacing: 0.2px;
            margin-bottom: 18px;
            width: fit-content;
        }

        /* PLAN TITLE */
        .plan-title {
            color: #ffffff;
            font-size: 57px;
            font-weight: 700;
            line-height: 1.08;
            margin-bottom: 4px;
        }

        /* PRICE ROW */
        .price-row {
            display: flex;
            align-items: baseline;
            gap: 10px;
            color: #ffffff;
            margin-bottom: 20px;
        }
        .price-currency { font-size: 28px; font-weight: 500; }
        .price-value { font-size: 64px; font-weight: 700; line-height: 1; }
        .price-period { font-size: 19px; font-weight: 500; opacity: 0.95; text-transform: uppercase; }

        /* FEATURES */
        .features {
            display: flex;
            flex-direction: column;
            gap: 20px;
            margin-bottom: auto;
        }
        .feature-item {
            display: grid;
            grid-template-columns: 34px 1fr;
            column-gap: 16px;
            align-items: start;
        }
        .feature-icon {
            width: 30px;
            height: 30px;
            border-radius: 50%;
            background: #54d28a;
            color: #ffffff;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 17px;
            font-weight: 700;
        }
        .feature-title {
            color: #ffffff;
            font-size: 22px;
            font-weight: 600;
            line-height: 1.15;
        }
        .feature-desc {
            margin-top: 4px;
            color: rgba(255,255,255,0.88);
            font-size: 18px;
            font-weight: 400;
            line-height: 1.25;
        }

        /* SECURITY BAND */
        .left-security-band {
            position: absolute;
            left: 0;
            bottom: 10%;
            width: 100%;
            height: 18%;
            background: rgba(255,255,255,0.06);
            border-top: 1px solid rgba(255,255,255,0.05);
            z-index: 2;
        }
        .left-security-content {
            position: absolute;
            left: 11%;
            bottom: 12%;
            width: 78%;
            z-index: 3;
        }
        .left-security-title {
            color: #ffffff;
            font-size: 23px;
            font-weight: 600;
        }
        .left-security-desc {
            margin-top: 6px;
            color: rgba(255,255,255,0.90);
            font-size: 18px;
            font-weight: 400;
        }
        .card-brands {
            position: absolute;
            left: 11%;
            bottom: 2%;
            width: 58%;
            height: 52px;
            background: rgba(255,255,255,0.92);
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: space-evenly;
            z-index: 3;
        }
        .card-brands svg { height: 28px; width: auto; }

        /* RIGHT PANEL */
        .right-panel {
            position: relative;
            width: 51%;
            height: 100%;
            background: #fbf8fc;
            padding: 5% 7% 0 7%;
            z-index: 2;
            display: flex;
            flex-direction: column;
        }

        /* FORM TITLE */
        .form-title {
            color: #221749;
            font-size: 31px;
            font-weight: 700;
            margin-bottom: 16px;
        }

        /* PAYMENT VIA */
        .payment-via {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 16px;
        }
        .payment-label {
            color: #817796;
            font-size: 15px;
            font-weight: 500;
        }
        .payment-chip {
            padding: 10px 18px;
            border-radius: 8px;
            background: linear-gradient(90deg, #7b35f4 0%, #b783ff 100%);
            color: #ffffff;
            font-size: 14px;
            font-weight: 600;
        }

        /* FORM FIELDS */
        .form-label {
            display: block;
            color: #43395d;
            font-size: 16px;
            font-weight: 500;
            margin-bottom: 8px;
        }
        .form-input {
            width: 100%;
            height: 48px;
            border: 1px solid #e1dbe9;
            border-radius: 10px;
            background: #fbf9fd;
            color: #2b2340;
            padding: 0 16px;
            font-size: 14px;
            font-weight: 400;
            font-family: 'Inter', sans-serif;
            transition: all 0.2s;
            margin-bottom: 4px;
        }
        .form-input::placeholder { color: #8f879d; }
        .form-input:focus {
            outline: none;
            border: 1px solid #7B2FF7;
            box-shadow: 0 0 0 2px rgba(123,47,247,0.1);
        }
        .form-helper {
            color: #8d84a0;
            font-size: 13px;
            font-weight: 400;
            margin-bottom: 12px;
        }
        .form-group { margin-bottom: 12px; }
        .form-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
        }

        /* CTA BUTTON */
        .cta-button {
            width: 100%;
            height: 50px;
            border: none;
            border-radius: 12px;
            background: linear-gradient(90deg, #7d31f5 0%, #c06ef0 100%);
            color: #ffffff;
            font-size: 18px;
            font-weight: 700;
            cursor: pointer;
            transition: 0.3s;
            box-shadow: 0 8px 18px rgba(125,49,245,0.22);
            margin-top: 8px;
            font-family: 'Inter', sans-serif;
        }
        .cta-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 20px rgba(123,47,247,0.3);
        }

        /* SECURITY FOOTER */
        .security-footer {
            display: flex;
            align-items: center;
            gap: 8px;
            color: #3ca95c;
            font-size: 14px;
            font-weight: 500;
            margin-top: 12px;
        }

        /* COPYRIGHT FOOTER */
        .footer-note {
            position: absolute;
            left: 50%;
            bottom: 24px;
            transform: translateX(-50%);
            color: #7c6f95;
            font-size: 14px;
            font-weight: 400;
            white-space: nowrap;
            z-index: 3;
        }
    </style>
</head>
<body>
    <div x-data="{ locale: 'pt-BR' }">
        <!-- BACK BUTTON -->
        <a class="back-link">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
            VOLTAR
        </a>

        <section class="main-card">
            <!-- LEFT PANEL -->
            <div class="left-panel">
                <div class="brand">
                    <div class="brand-icon">B</div>
                    <div class="brand-text">Basileia</div>
                </div>

                <div class="plan-badge">PLANO PROFISSIONAL ATIVADO</div>

                <h1 class="plan-title"><?php echo e($transaction->description ?? 'Plano Mensal'); ?></h1>

                <div class="price-row">
                    <span class="price-currency">R$</span>
                    <span class="price-value"><?php echo e(number_format($transaction->amount, 2, ',', '.')); ?></span>
                    <span class="price-period">COBRANÇA MENSAL</span>
                </div>

                <div class="features">
                    <div class="feature-item">
                        <div class="feature-icon">✓</div>
                        <div>
                            <div class="feature-title">Gestão com IA Integrada</div>
                            <div class="feature-desc">Aplicação para solicitações da igreja.</div>
                        </div>
                    </div>
                    <div class="feature-item">
                        <div class="feature-icon">✓</div>
                        <div>
                            <div class="feature-title">Automação de Cultos</div>
                            <div class="feature-desc">Lembretes e avisos 100% automaticos.</div>
                        </div>
                    </div>
                    <div class="feature-item">
                        <div class="feature-icon">✓</div>
                        <div>
                            <div class="feature-title">Células e Eventos</div>
                            <div class="feature-desc">Controle total de presença, cursos e células.</div>
                        </div>
                    </div>
                </div>

                <div class="left-security-band"></div>
                <div class="left-security-content">
                    <div class="left-security-title">Pagamento 100% Seguro</div>
                    <div class="left-security-desc">Seus dados são protegidos por criptografia SSL.</div>
                </div>

                <div class="card-brands">
                    <svg viewBox="0 0 60 20"><text x="0" y="16" font-size="16" font-weight="bold" fill="#1A1F71">VISA</text></svg>
                    <svg viewBox="0 0 70 20"><circle cx="20" cy="10" r="8" fill="#EB001B" opacity="0.8"/><circle cx="30" cy="10" r="8" fill="#F79E1B" opacity="0.8"/></svg>
                    <svg viewBox="0 0 40 20"><rect x="0" y="0" width="40" height="20" rx="3" fill="#006FCF"/><text x="20" y="14" font-size="8" fill="white" text-anchor="middle" font-weight="bold">AMEX</text></svg>
                    <svg viewBox="0 0 50 20"><text x="0" y="15" font-size="14" font-weight="bold" fill="#FF6600">elo</text></svg>
                </div>
            </div>

            <!-- RIGHT PANEL -->
            <div class="right-panel">
                <h2 class="form-title">Pagamento Seguro</h2>

                <div class="payment-via">
                    <span class="payment-label">PAGAMENTO VIA:</span>
                    <span class="payment-chip">CARTÃO DE CRÉDITO</span>
                </div>

                <form method="POST" action="<?php echo e(route('checkout.process', $transaction->uuid)); ?>">
                    <?php echo csrf_field(); ?>
                    <input type="hidden" name="payment_method" value="credit_card">

                    <div class="form-group">
                        <label class="form-label">E-MAIL DE ACESSO AO PAINEL</label>
                        <input type="email" name="email" class="form-input" value="<?php echo e($transaction->customer_email ?? ''); ?>" placeholder="seu@email.com" required>
                        <div class="form-helper">Este e-mail receberá suas credenciais de login.</div>
                    </div>

                    <div class="form-group">
                        <label class="form-label">NÚMERO DO CARTÃO</label>
                        <input type="text" name="card_number" class="form-input" maxlength="19" placeholder="0000 0000 0000 0000" required>
                    </div>

                    <div class="form-row">
                        <div>
                            <label class="form-label">EXPIRAÇÃO</label>
                            <input type="text" name="card_expiry" class="form-input" maxlength="5" placeholder="01 / 26" required>
                        </div>
                        <div>
                            <label class="form-label">CVC</label>
                            <input type="text" name="card_cvv" class="form-input" maxlength="4" placeholder="123" required>
                        </div>
                    </div>

                    <div class="form-group" style="margin-top: 8px;">
                        <label class="form-label">NOME COMPLETO (ESCRITO NO CARTÃO)</label>
                        <input type="text" name="card_holder_name" class="form-input" placeholder="FULANO DE TAL" required style="text-transform: uppercase;">
                    </div>

                    <div class="form-group">
                        <label class="form-label">DOCUMENTO DO PAGADOR (CPF ou CNPJ)</label>
                        <input type="text" name="cpf_cnpj" class="form-input" maxlength="18" placeholder="000.000.000-00" required>
                    </div>

                    <button type="submit" class="cta-button">
                        Assinar Plano por R$<?php echo e(number_format($transaction->amount, 2, ',', '.')); ?>

                    </button>
                </form>

                <div class="security-footer">
                    <svg width="16" height="16" fill="none" stroke="#3ca95c" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
                    Pagamento 100% Seguro
                </div>
            </div>

            <div class="footer-note">© 2024 Basileia Vendas - Enterprise Cloud Operations</div>
        </section>
    </div>
</body>
</html>
<?php /**PATH /Users/viniciusreinehr/.gemini/antigravity/scratch/Checkout/resources/views/checkout/index.blade.php ENDPATH**/ ?>