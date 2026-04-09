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
            overflow: hidden;
        }
        .value-card-logo img {
            width: 100%;
            height: 100%;
            object-fit: contain;
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
        .plan-name-text {
            text-transform: uppercase;
            font-size: 14px;
            font-weight: 600;
            letter-spacing: 1px;
            opacity: 0.9;
            margin-bottom: 8px;
        }
        .amount-text {
            font-size: 36px;
            font-weight: 800;
            margin-bottom: 4px;
        }
        .period-text {
            font-size: 13px;
            opacity: 0.8;
        }
        .feature-text {
            font-size: 12px;
            opacity: 0.9;
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
        
        /* Locale Switcher - Above card */
        .locale-row {
            display: flex;
            justify-content: flex-end;
            margin-bottom: 12px;
        }
        .locale-switcher {
            position: relative;
        }
        .locale-switcher select {
            appearance: none;
            background: white;
            border: 1px solid var(--border);
            border-radius: 10px;
            padding: 10px 36px 10px 14px;
            font-size: 13px;
            cursor: pointer;
            color: var(--text-dark);
            font-weight: 500;
            min-width: 160px;
            background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2364748b' d='M6 8L2 4h8z'/%3E%3C/svg%3E");
            background-repeat: no-repeat;
            background-position: right 12px center;
            box-shadow: 0 2px 8px rgba(0,0,0,0.08);
            transition: all 0.2s;
        }
        .locale-switcher select:hover {
            border-color: var(--primary-light);
        }
        .locale-switcher select:focus {
            outline: none;
            border-color: var(--primary);
            box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.1);
        }
        
        /* Payment Method Toggle */
        .payment-method-toggle {
            display: flex;
            gap: 8px;
            margin-bottom: 16px;
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
        
        /* Cartão 3D Preto */
        .card-preview {
            width: 100%;
            height: 180px;
            border-radius: 14px;
            position: relative;
            margin-bottom: 20px;
            transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
            transform-style: preserve-3d;
            color: white;
        }
        .card-preview.flipped {
            transform: rotateY(180deg);
        }
        .card-front, .card-back {
            position: absolute;
            width: 100%;
            height: 100%;
            backface-visibility: hidden;
            border-radius: 14px;
            padding: 20px;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
        }
        .card-front {
            background: linear-gradient(135deg, #1e1e1e 0%, #2d2d2d 100%);
            justify-content: space-between;
        }
        .card-back {
            background: linear-gradient(135deg, #1e1e1e 0%, #2d2d2d 100%);
            transform: rotateY(180deg);
            justify-content: center;
            align-items: center;
        }
        .card-preview.visa .card-front { background: linear-gradient(135deg, #1A1F71 0%, #2A3F91 100%); }
        .card-preview.visa .card-back { background: linear-gradient(135deg, #1A1F71 0%, #2A3F91 100%); }
        .card-preview.mastercard .card-front { background: linear-gradient(135deg, #1e1e1e 0%, #2d2d2d 100%); }
        .card-preview.mastercard .card-back { background: linear-gradient(135deg, #1e1e1e 0%, #2d2d2d 100%); }
        .card-preview.amex .card-front { background: linear-gradient(135deg, #0070d1 0%, #00a0f0 100%); }
        .card-preview.amex .card-back { background: linear-gradient(135deg, #0070d1 0%, #00a0f0 100%); }
        .card-preview.elo .card-front { background: linear-gradient(135deg, #0047BB 0%, #FFCB05 100%); }
        .card-preview.elo .card-back { background: linear-gradient(135deg, #0047BB 0%, #FFCB05 100%); }
        
        .cvv-strip {
            width: 100%;
            height: 40px;
            background: #fff;
            margin-top: 20px;
            display: flex;
            align-items: center;
            justify-content: flex-end;
            padding-right: 15px;
            border-radius: 4px;
        }
        .cvv-value {
            color: #1e1e1e;
            font-size: 18px;
            font-weight: 700;
            letter-spacing: 3px;
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
        .card-brand-logo {
            position: absolute;
            top: 20px;
            right: 20px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .card-brand-logo svg, .card-brand-logo img {
            height: 100%;
            width: auto;
        }
        .card-brand-logo .brand-text {
            font-size: 20px;
            font-weight: bold;
            color: white;
            text-shadow: 0 1px 2px rgba(0,0,0,0.3);
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
            grid-template-columns: 1fr 1fr 60px;
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
            border-radius: 10px;
            background: var(--primary);
            color: white;
            font-size: 13px;
            font-weight: 600;
            cursor: pointer;
            transition: background 0.2s;
        }
        .pix-copy-btn:hover {
            background: var(--primary-dark);
        }
        .pix-info {
            margin-top: 12px;
            padding: 10px;
            background: #ecfdf5;
            border-radius: 8px;
            font-size: 11px;
            color: #065f46;
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
        
        .accepted-cards {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            margin-top: 16px;
            padding-top: 16px;
            border-top: 1px solid #e2e8f0;
        }
        .accepted-cards svg {
            width: 36px;
            height: 24px;
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
        locale: 'pt-BR',
        currency: 'BRL',
        currencySymbol: 'R$',
        planLabel: 'PLANO PREMIUM',
        periodLabel: 'por mês',
        payBtnLabel: 'Pagar',
        features: ['Acesso completo', 'Suporte 24h', 'Cancelamento fácil'],
        billingType: '{{ $billingType ?? 'CREDIT_CARD' }}',
        cardNumber: '',
        cardHolder: '',
        cardExpiry: '',
        cardBrand: 'default',
        showCvv: false,
        pixCopied: false,
        localeData: {},
        updateCard() {
            const num = this.cardNumber.replace(/\D/g, '');
            if (num.startsWith('4')) this.cardBrand = 'visa';
            else if (num.match(/^5[1-5]/)) this.cardBrand = 'mastercard';
            else if (num.match(/^3[47]/)) this.cardBrand = 'amex';
            else if (num.match(/^(4011|4312|4389|4514|4573|4576|5041|5066|5067|5090|6277|6362|6363|6504|6505|6507|6509|6516|6550)/)) this.cardBrand = 'elo';
            else this.cardBrand = 'default';
        },
        toggleCvv() {
            this.showCvv = !this.showCvv;
        },
        copyPixCode() {
            navigator.clipboard.writeText('{{ $pixData['payload'] ?? '' }}');
            this.pixCopied = true;
            setTimeout(() => this.pixCopied = false, 2000);
        },
        changeCountry() {
            const data = this.localeData[this.country] || this.localeData.default;
            this.locale = data.locale;
            this.currency = data.currency;
            this.currencySymbol = data.symbol;
            this.planLabel = data.planLabel;
            this.periodLabel = data.periodLabel;
            this.payBtnLabel = data.payBtn;
            this.features = data.features;
        },
        formatPrice(amount) {
            try {
                return new Intl.NumberFormat(this.locale, {style: 'currency', currency: this.currency}).format(amount);
            } catch(e) {
                return this.currencySymbol + ' ' + amount.toFixed(2);
            }
        },
        init() {
            this.localeData = {
                BR: {locale: 'pt-BR', currency: 'BRL', symbol: 'R$', lang: 'pt', planLabel: 'PLANO PREMIUM', periodLabel: 'por mês', features: ['Acesso completo', 'Suporte 24h', 'Cancelamento fácil'], payBtn: 'Pagar'},
                US: {locale: 'en-US', currency: 'USD', symbol: '$', lang: 'en', planLabel: 'PREMIUM PLAN', periodLabel: 'per month', features: ['Full access', '24h Support', 'Easy cancellation'], payBtn: 'Pay'},
                PT: {locale: 'pt-PT', currency: 'EUR', symbol: '€', lang: 'pt', planLabel: 'PLANO PREMIUM', periodLabel: 'por mês', features: ['Acesso completo', 'Suporte 24h', 'Cancelamento fácil'], payBtn: 'Pagar'},
                ES: {locale: 'es-ES', currency: 'EUR', symbol: '€', lang: 'es', planLabel: 'PLAN PREMIUM', periodLabel: 'por mes', features: ['Acceso completo', 'Soporte 24h', 'Cancelación fácil'], payBtn: 'Pagar'},
                FR: {locale: 'fr-FR', currency: 'EUR', symbol: '€', lang: 'fr', planLabel: 'PLAN PREMIUM', periodLabel: 'par mois', features: ['Accès complet', 'Support 24h', 'Annulation facile'], payBtn: 'Payer'},
                DE: {locale: 'de-DE', currency: 'EUR', symbol: '€', lang: 'de', planLabel: 'PREMIUM PLAN', periodLabel: 'pro Monat', features: ['Voller Zugriff', '24h Support', 'Einfache Stornierung'], payBtn: 'Bezahlen'},
                IT: {locale: 'it-IT', currency: 'EUR', symbol: '€', lang: 'it', planLabel: 'PIANO PREMIUM', periodLabel: 'al mese', features: ['Accesso completo', 'Supporto 24h', 'Cancellazione facile'], payBtn: 'Paga'},
                GB: {locale: 'en-GB', currency: 'GBP', symbol: '£', lang: 'en', planLabel: 'PREMIUM PLAN', periodLabel: 'per month', features: ['Full access', '24h Support', 'Easy cancellation'], payBtn: 'Pay'},
                CA: {locale: 'en-CA', currency: 'CAD', symbol: 'C$', lang: 'en', planLabel: 'PREMIUM PLAN', periodLabel: 'per month', features: ['Full access', '24h Support', 'Easy cancellation'], payBtn: 'Pay'},
                MX: {locale: 'es-MX', currency: 'MXN', symbol: 'MX$', lang: 'es', planLabel: 'PLAN PREMIUM', periodLabel: 'por mes', features: ['Acceso completo', 'Soporte 24h', 'Cancelación fácil'], payBtn: 'Pagar'},
                AR: {locale: 'es-AR', currency: 'ARS', symbol: 'ARS$', lang: 'es', planLabel: 'PLAN PREMIUM', periodLabel: 'por mes', features: ['Acceso completo', 'Soporte 24h', 'Cancelación fácil'], payBtn: 'Pagar'},
                JP: {locale: 'ja-JP', currency: 'JPY', symbol: '¥', lang: 'ja', planLabel: 'プレミアムプラン', periodLabel: '月額', features: ['フルアクセス', '24時間サポート', '簡単なキャンセル'], payBtn: '支払う'},
                CN: {locale: 'zh-CN', currency: 'CNY', symbol: '¥', lang: 'zh', planLabel: '高级套餐', periodLabel: '每月', features: ['完全访问', '24小时支持', '轻松取消'], payBtn: '支付'},
                KR: {locale: 'ko-KR', currency: 'KRW', symbol: '₩', lang: 'ko', planLabel: '프리미엄 플랜', periodLabel: '월간', features: ['전액 접근', '24시간 지원', '쉬운 취소'], payBtn: '지불'},
                default: {locale: 'en-US', currency: 'USD', symbol: '$', lang: 'en', planLabel: 'PREMIUM PLAN', periodLabel: 'per month', features: ['Full access', '24h Support', 'Easy cancellation'], payBtn: 'Pay'}
            };
            this.changeCountry();
        },
        countries: [
            {code:'BR',name:'Brasil',flag:'🇧🇷'},{code:'US',name:'Estados Unidos',flag:'🇺🇸'},{code:'PT',name:'Portugal',flag:'🇵🇹'},{code:'ES',name:'Espanha',flag:'🇪🇸'},{code:'FR',name:'França',flag:'🇫🇷'},{code:'DE',name:'Alemanha',flag:'🇩🇪'},{code:'IT',name:'Itália',flag:'🇮🇹'},{code:'GB',name:'Reino Unido',flag:'🇬🇧'},{code:'CA',name:'Canadá',flag:'🇨🇦'},{code:'MX',name:'México',flag:'🇲🇽'},{code:'AR',name:'Argentina',flag:'🇦🇷'},{code:'CO',name:'Colômbia',flag:'🇨🇴'},{code:'CL',name:'Chile',flag:'🇨🇱'},{code:'PE',name:'Peru',flag:'🇵🇪'},{code:'VE',name:'Venezuela',flag:'🇻🇪'},{code:'UY',name:'Uruguai',flag:'🇺🇾'},{code:'PY',name:'Paraguai',flag:'🇵🇾'},{code:'BO',name:'Bolívia',flag:'🇧🇴'},{code:'EC',name:'Equador',flag:'🇪🇨'},{code:'AU',name:'Austrália',flag:'🇦🇺'},{code:'NZ',name:'Nova Zelândia',flag:'🇳🇿'},{code:'JP',name:'Japão',flag:'🇯🇵'},{code:'CN',name:'China',flag:'🇨🇳'},{code:'KR',name:'Coreia do Sul',flag:'🇰🇷'},{code:'IN',name:'Índia',flag:'🇮🇳'},{code:'RU',name:'Rússia',flag:'🇷🇺'},{code:'ZA',name:'África do Sul',flag:'🇿🇦'},{code:'NG',name:'Nigéria',flag:'🇳🇬'},{code:'EG',name:'Egito',flag:'🇪🇬'},{code:'SA',name:'Arábia Saudita',flag:'🇸🇦'},{code:'AE',name:'Emirados Árabes',flag:'🇦🇪'},{code:'IL',name:'Israel',flag:'🇮🇱'},{code:'TR',name:'Turquia',flag:'🇹🇷'},{code:'PL',name:'Polônia',flag:'🇵🇱'},{code:'NL',name:'Holanda',flag:'🇳🇱'},{code:'BE',name:'Bélgica',flag:'🇧🇪'},{code:'CH',name:'Suíça',flag:'🇨🇭'},{code:'AT',name:'Áustria',flag:'🇦🇹'},{code:'SE',name:'Suécia',flag:'🇸🇪'},{code:'NO',name:'Noruega',flag:'🇳🇴'},{code:'DK',name:'Dinamarca',flag:'🇩🇰'},{code:'FI',name:'Finlândia',flag:'🇫🇮'},{code:'IE',name:'Irlanda',flag:'🇮🇪'},{code:'GR',name:'Grécia',flag:'🇬🇷'},{code:'CZ',name:'República Tcheca',flag:'🇨🇿'},{code:'HU',name:'Hungria',flag:'🇭🇺'},{code:'RO',name:'Romênia',flag:'🇷🇴'},{code:'TH',name:'Tailândia',flag:'🇹🇭'},{code:'VN',name:'Vietnã',flag:'🇻🇳'},{code:'ID',name:'Indonésia',flag:'🇮🇩'},{code:'MY',name:'Malásia',flag:'🇲🇾'},{code:'SG',name:'Singapura',flag:'🇸🇬'},{code:'PH',name:'Filipinas',flag:'🇵🇭'},{code:'TW',name:'Taiwan',flag:'🇹🇼'},{code:'HK',name:'Hong Kong',flag:'🇭🇰'},{code:'MA',name:'Marrocos',flag:'🇲🇦'},{code:'DZ',name:'Argélia',flag:'🇩🇿'},{code:'TN',name:'Tunísia',flag:'🇹🇳'},{code:'GH',name:'Gana',flag:'🇬🇭'},{code:'KE',name:'Quênia',flag:'🇰🇪'},{code:'TZ',name:'Tanzânia',flag:'🇹🇿'},{code:'AO',name:'Angola',flag:'🇦🇴'},{code:'MZ',name:'Moçambique',flag:'🇲🇿'},{code:'RW',name:'Ruanda',flag:'🇷🇼'},{code:'UG',name:'Uganda',flag:'🇺🇬'},{code:'ET',name:'Etiópia',flag:'🇪🇹'},{code:'CM',name:'Camarões',flag:'🇨🇲'},{code:'SN',name:'Senegal',flag:'🇸🇳'},{code:'CI',name:'Costa do Marfim',flag:'🇨🇮'},{code:'NG',name:'Nigéria',flag:'🇳🇬'},{code:'CO',name:'Colômbia',flag:'🇨🇴'},{code:'PA',name:'Panamá',flag:'🇵🇦'},{code:'CR',name:'Costa Rica',flag:'🇨🇷'},{code:'GT',name:'Guatemala',flag:'🇬🇹'},{code:'HN',name:'Honduras',flag:'🇭🇳'},{code:'SV',name:'El Salvador',flag:'🇸🇻'},{code:'NI',name:'Nicarágua',flag:'🇳🇮'},{code:'DO',name:'República Dominicana',flag:'🇩🇴'},{code:'JM',name:'Jamaica',flag:'🇯🇲'},{code:'TT',name:'Trinidad e Tobago',flag:'🇹🇹'},{code:'BB',name:'Barbados',flag:'🇧🇧'},{code:'BS',name:'Bahamas',flag:'🇧🇸'},{code:'BZ',name:'Belize',flag:'🇧🇿'},{code:'PY',name:'Paraguai',flag:'🇵🇾'},{code:'UY',name:'Uruguai',flag:'🇺🇾'},{code:'SR',name:'Suriname',flag:'🇸🇷'},{code:'GY',name:'Guiana',flag:'🇬🇾'}
        ]
    }"
>
    <div class="checkout-container">
        <!-- Card Valor -->
        <div class="value-card">
            <div class="value-card-logo">
                <img src="https://basileia.global/wp-content/uploads/2024/01/Basileia-1.png" alt="Basileia" onerror="this.style.display='none'">
            </div>
            <div class="value-card-plan" x-text="planLabel"></div>
            <div class="value-card-amount" x-text="formatPrice({{ $transaction->amount }})"></div>
            <div class="value-card-period" x-text="periodLabel"></div>
            <div class="value-card-features">
                <template x-for="feature in features" :key="feature">
                    <div class="value-card-feature">
                        <i class="fas fa-check"></i> <span x-text="feature"></span>
                    </div>
                </template>
            </div>
        </div>
        
        <!-- Card Pagamento -->
        <div class="payment-card">
            <div class="locale-row">
                <div class="locale-switcher">
                    <select x-model="country" @change="changeCountry()">
                        <template x-for="c in countries" :key="c.code">
                            <option :value="c.code" x-text="c.flag + ' ' + c.name"></option>
                        </template>
                    </select>
                </div>
            </div>
            
            <!-- Payment Method Toggle -->
            <div class="payment-method-toggle">
                <button type="button" class="payment-method-btn" :class="{ 'active': billingType === 'PIX' }" @click="billingType = 'PIX'">
                    <i class="fas fa-qrcode"></i> PIX
                </button>
                <button type="button" class="payment-method-btn" :class="{ 'active': billingType === 'CREDIT_CARD' }" @click="billingType = 'CREDIT_CARD'">
                    <i class="fas fa-credit-card"></i> Cartão
                </button>
            </div>
            
            <!-- Cartão 3D -->
            <div class="card-preview" :class="[cardBrand, showCvv ? 'flipped' : '']">
                <div class="card-front">
                    <div class="card-chip"></div>
                    <div class="card-brand-logo">
                        <template x-if="cardBrand === 'visa'">
                            <svg viewBox="0 0 48 32" height="32"><rect width="48" height="32" rx="4" fill="#fff"/><text x="24" y="22" font-size="16" font-weight="bold" fill="#1A1F71" text-anchor="middle">VISA</text></svg>
                        </template>
                        <template x-if="cardBrand === 'mastercard'">
                            <svg viewBox="0 0 48 32" height="32"><circle cx="18" cy="16" r="10" fill="#EB001B"/><circle cx="30" cy="16" r="10" fill="#F79E1B"/><path d="M24 9a10 10 0 0 1 0 14 10 10 0 0 1 0-14z" fill="#FF5F00"/></svg>
                        </template>
                        <template x-if="cardBrand === 'amex'">
                            <svg viewBox="0 0 48 32" height="32"><rect width="48" height="32" rx="4" fill="#006FCF"/><text x="24" y="20" font-size="12" fill="#fff" text-anchor="middle" font-weight="bold">AMEX</text></svg>
                        </template>
                        <template x-if="cardBrand === 'elo'">
                            <svg viewBox="0 0 48 32" height="32"><rect width="48" height="32" rx="4" fill="#FFCB05"/><text x="24" y="20" font-size="14" fill="#0047BB" text-anchor="middle" font-weight="bold">ELO</text></svg>
                        </template>
                        <template x-if="cardBrand === 'default'">
                            <span class="brand-text">💳</span>
                        </template>
                    </div>
                    <div class="card-number" x-text="cardNumber || '•••• •••• •••• ••••'"></div>
                    <div class="card-details">
                        <div class="card-holder-name" x-text="cardHolder || 'NOME DO TITULAR'"></div>
                        <div x-text="cardExpiry || '••/••'"></div>
                    </div>
                </div>
                <div class="card-back">
                    <div class="cvv-strip">
                        <div class="cvv-value" x-text="$refs.cvvInput?.value || '•••'"></div>
                    </div>
                </div>
            </div>
            
            <!-- Payment Form - Credit Card -->
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
                    <input type="text" name="card_number" class="form-input" 
                        placeholder="0000 0000 0000 0000" maxlength="19" required
                        x-model="cardNumber"
                        @input="cardNumber = $event.target.value.replace(/\s+/g, '').replace(/(\d{4})/g, '$1 ').trim(); updateCard()">
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Validade</label>
                        <input type="text" name="card_expiry" class="form-input" placeholder="MM/AA" maxlength="5" required
                            x-model="cardExpiry"
                            @input="cardExpiry = $event.target.value.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1/$2')">
                    </div>
                    <div class="form-group" style="grid-column: span 2;">
                        <label class="form-label">CVC</label>
                        <input type="text" name="card_cvv" class="form-input" placeholder="123" maxlength="4" required
                            x-ref="cvvInput"
                            @focus="showCvv = true"
                            @blur="showCvv = false">
                    </div>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Nome do Titular</label>
                    <input type="text" name="card_holder_name" class="form-input" placeholder="NOME COMPLETO" required
                        x-model="cardHolder">
                </div>
                
                <button type="submit" class="cta-button">
                    <span x-text="'Pagar ' + formatPrice({{ $transaction->amount }})"></span>
                </button>
            </form>
            </template>
            
            <!-- PIX Section -->
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
            
            <div class="accepted-cards">
                <svg viewBox="0 0 40 28" title="Visa"><rect width="40" height="28" rx="3" fill="#fff"/><text x="20" y="19" font-size="10" font-weight="bold" fill="#1A1F71" text-anchor="middle">VISA</text></svg>
                <svg viewBox="0 0 40 28" title="Mastercard"><circle cx="15" cy="14" r="8" fill="#EB001B"/><circle cx="25" cy="14" r="8" fill="#F79E1B"/><path d="M20 8a8 8 0 0 1 0 12 8 8 0 0 1 0-12z" fill="#FF5F00"/></svg>
                <svg viewBox="0 0 40 28" title="Elo"><rect width="40" height="28" rx="3" fill="#FFCB05"/><text x="20" y="19" font-size="10" fill="#0047BB" text-anchor="middle" font-weight="bold">ELO</text></svg>
                <svg viewBox="0 0 40 28" title="Hipercard"><rect width="40" height="28" rx="3" fill="#fff"/><text x="20" y="19" font-size="8" fill="#ef4444" text-anchor="middle" font-weight="bold">HIPER</text></svg>
            </div>
            
            <div class="security-footer">
                <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/></svg>
                Pagamento 100% Seguro
            </div>
        </div>
    </div>
</body>
</html>
