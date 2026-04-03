<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>{{ $transaction->description ?? 'Pagamento' }} - Basileia</title>
    <script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js"></script>
    <script src="/js/card-engine.js"></script>
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
        .brand-logo img { width: 48px; height: 48px; object-fit: contain; }
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
            font-size: 48px;
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
            gap: 22px;
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
        .brand-icon-img { height: 26px; width: auto; }
        .right-panel {
            background: #fbf8fc;
            padding: 36px 48px 24px;
            display: flex;
            flex-direction: column;
            position: relative;
        }
        .locale-switcher {
            position: absolute;
            right: 48px;
            top: 36px;
            z-index: 5;
        }
        .locale-switcher select {
            height: 36px;
            padding: 0 12px;
            border: 1px solid #ddd7e8;
            border-radius: 8px;
            background: #fff;
            color: #3f3558;
            font-size: 13px;
            font-weight: 500;
            cursor: pointer;
            font-family: 'Inter', sans-serif;
            max-width: 180px;
        }
        .locale-switcher select:focus { outline: none; border-color: #7b2ff7; }
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
        .form-helper { color: #9d94ae; font-size: 12px; margin-top: 4px; margin-bottom: 10px; }
        .form-error { color: #ef4444; font-size: 12px; margin-top: 4px; margin-bottom: 10px; display: none; }
        .form-error.visible { display: block; }
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
        .footer-note {
            position: absolute;
            left: 50%;
            bottom: 16px;
            transform: translateX(-50%);
            color: #9b8fb5;
            font-size: 12px;
            white-space: nowrap;
        }

        /* ===== 3D CARD ===== */
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
            -webkit-backface-visibility: hidden;
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
        .card-back {
            transform: rotateY(180deg);
            display: flex;
            flex-direction: column;
            justify-content: center;
        }
        .card-back-bg {
            position: absolute;
            top: 0; left: 0; right: 0; bottom: 0;
        }
        .card-back-magnetic {
            height: 45px;
            background: rgba(0,0,0,0.6);
            margin-top: 30px;
        }
        .card-back-strip {
            height: 36px;
            background: rgba(255,255,255,0.9);
            margin: 16px 20px;
            border-radius: 6px;
            display: flex;
            align-items: center;
            justify-content: flex-end;
            padding: 0 16px;
            position: relative;
        }
        .card-back-strip .cvc-display {
            font-family: 'Share Tech Mono', monospace;
            font-size: 18px;
            color: #333;
            letter-spacing: 3px;
            font-weight: 700;
        }
        .card-back-strip .cvc-highlight {
            position: absolute;
            right: 10px;
            top: 50%;
            transform: translateY(-50%);
            width: 50px;
            height: 28px;
            border: 2px dashed rgba(255,255,255,0.8);
            border-radius: 4px;
            pointer-events: none;
            animation: cvcPulse 1.5s ease-in-out infinite;
        }
        @keyframes cvcPulse {
            0%, 100% { border-color: rgba(255,255,255,0.5); }
            50% { border-color: rgba(255,255,255,1); box-shadow: 0 0 10px rgba(255,255,255,0.4); }
        }
        .card-back-info {
            padding: 0 20px;
            font-size: 9px;
            color: rgba(255,255,255,0.7);
            line-height: 1.5;
        }
        .card-top-row {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
        }
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
        .card-bottom-row {
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
        }
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

        /* Brand colors */
        .brand-visa { background: linear-gradient(135deg, #1a1f71, #2b3990, #1a1f71); }
        .brand-mastercard { background: linear-gradient(135deg, #eb001b, #f79e1b); }
        .brand-amex { background: linear-gradient(135deg, #006fcf, #00a1e0); }
        .brand-elo { background: linear-gradient(135deg, #0047bb, #0066cc); }
        .brand-hipercard { background: linear-gradient(135deg, #822124, #a0292d); }
        .brand-diners { background: linear-gradient(135deg, #004a97, #0066cc); }
        .brand-discover { background: linear-gradient(135deg, #ff6000, #ff8800); }
        .brand-jcb { background: linear-gradient(135deg, #0e4c96, #1a6bc4); }
        .brand-cabal { background: linear-gradient(135deg, #003366, #005599); }
        .brand-banescard { background: linear-gradient(135deg, #006633, #009944); }
        .brand-default { background: linear-gradient(135deg, #2d2d2d, #4a4a4a); }

        .card-scene:hover .card-inner { transform: rotateY(5deg) rotateX(-3deg); }
        .card-scene:hover .card-inner.is-flipped { transform: rotateY(185deg) rotateX(-3deg); }

        /* Validation badge */
        .validation-badge {
            display: inline-flex;
            align-items: center;
            gap: 4px;
            padding: 2px 8px;
            border-radius: 4px;
            font-size: 11px;
            font-weight: 600;
            margin-left: 8px;
            vertical-align: middle;
        }
        .validation-badge.valid { background: #dcfce7; color: #166534; }
        .validation-badge.invalid { background: #fee2e2; color: #991b1b; }
        .validation-badge.partial { background: #fef3c7; color: #92400e; }

        /* Loading overlay */
        .loading-overlay {
            position: absolute;
            top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(255,255,255,0.9);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10;
            border-radius: 28px;
        }
        .spinner {
            width: 40px;
            height: 40px;
            border: 4px solid #e1dbe9;
            border-top-color: #7b2ff7;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        @media (max-width: 768px) {
            .main-card {
                grid-template-columns: 1fr;
                width: 100%;
                min-height: auto;
            }
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
        country: 'BR',
        cfg: null,
        cardNumber: '',
        cardExpiry: '',
        cardCvv: '',
        cardHolder: '',
        detectedBrand: 'default',
        cardDetection: null,
        isFlipped: false,
        isProcessing: false,
        cardToken: null,
        validationState: { number: '', expiry: '', cvv: '', holder: '' },
        countries: [
            {code:'BR',name:'Brasil',flag:'🇧🇷'},{code:'US',name:'United States',flag:'🇺🇸'},
            {code:'PT',name:'Portugal',flag:'🇵🇹'},{code:'ES',name:'España',flag:'🇪'},
            {code:'GB',name:'United Kingdom',flag:'🇬🇧'},{code:'FR',name:'France',flag:'🇫🇷'},
            {code:'DE',name:'Deutschland',flag:'🇩'},{code:'IT',name:'Italia',flag:'🇮🇹'},
            {code:'MX',name:'México',flag:'🇲'},{code:'AR',name:'Argentina',flag:'🇦🇷'},
            {code:'CL',name:'Chile',flag:'🇨🇱'},{code:'CO',name:'Colombia',flag:'🇨🇴'},
            {code:'PE',name:'Perú',flag:'🇵🇪'},{code:'EC',name:'Ecuador',flag:'🇪🇨'},
            {code:'PY',name:'Paraguay',flag:'🇵🇾'},{code:'UY',name:'Uruguay',flag:'🇺🇾'},
            {code:'BO',name:'Bolivia',flag:'🇧🇴'},{code:'VE',name:'Venezuela',flag:'🇻🇪'},
            {code:'CA',name:'Canada',flag:'🇨🇦'},{code:'AU',name:'Australia',flag:'🇦🇺'},
            {code:'JP',name:'Japan',flag:'🇯🇵'},{code:'CN',name:'China',flag:'🇨🇳'},
            {code:'KR',name:'South Korea',flag:'🇰🇷'},{code:'IN',name:'India',flag:'🇮'},
            {code:'ZA',name:'South Africa',flag:'🇿🇦'},{code:'NG',name:'Nigeria',flag:'🇳'},
            {code:'KE',name:'Kenya',flag:'🇰🇪'},{code:'GH',name:'Ghana',flag:'🇬'},
            {code:'AO',name:'Angola',flag:'🇦🇴'},{code:'MZ',name:'Moçambique',flag:'🇲'},
            {code:'RW',name:'Rwanda',flag:'🇷🇼'},{code:'TZ',name:'Tanzania',flag:'🇹🇿'},
            {code:'NL',name:'Nederland',flag:'🇳'},{code:'BE',name:'België',flag:'🇧'},
            {code:'CH',name:'Schweiz',flag:'🇨🇭'},{code:'AT',name:'Österreich',flag:'🇦🇹'},
            {code:'SE',name:'Sverige',flag:'🇸🇪'},{code:'NO',name:'Norge',flag:'🇳🇴'},
            {code:'DK',name:'Danmark',flag:'🇩🇰'},{code:'FI',name:'Suomi',flag:'🇫'},
            {code:'PL',name:'Polska',flag:'🇵🇱'},{code:'CZ',name:'Česko',flag:'🇨🇿'},
            {code:'HU',name:'Magyarország',flag:'🇭🇺'},{code:'RO',name:'România',flag:'🇷🇴'},
            {code:'GR',name:'Ελλάδα',flag:'🇬🇷'},{code:'TR',name:'Türkiye',flag:'🇹🇷'},
            {code:'RU',name:'Россия',flag:'🇷🇺'},{code:'UA',name:'Україна',flag:'🇺🇦'},
            {code:'IL',name:'ישראל',flag:'🇮🇱'},{code:'SA',name:'المملكة العربية السعودية',flag:'🇸'},
            {code:'AE',name:'الإمارات',flag:'🇦🇪'},{code:'EG',name:'مصر',flag:'🇪🇬'},
            {code:'TH',name:'ประเทศไทย',flag:'🇹🇭'},{code:'VN',name:'Việt Nam',flag:'🇻🇳'},
            {code:'PH',name:'Philippines',flag:'🇵🇭'},{code:'ID',name:'Indonesia',flag:'🇮'},
            {code:'MY',name:'Malaysia',flag:'🇲🇾'},{code:'SG',name:'Singapore',flag:'🇸🇬'},
            {code:'NZ',name:'New Zealand',flag:'🇳'}
        ],
        localeData: {},
        init() {
            const defaults = {
                billingLabel: {pt:'COBRANÇA MENSAL',en:'MONTHLY BILLING',es:'FACTURACIÓN MENSUAL',fr:'FACTURATION MENSUELLE',de:'MONATLICHE RECHNUNG'},
                btnPrefix: {pt:'Assinar Plano por',en:'Subscribe for',es:'Suscribir por',fr:'S\'abonner pour',de:'Abonnieren für'},
                emailLabel: {pt:'E-MAIL DE ACESSO AO PAINEL',en:'ACCESS EMAIL',es:'EMAIL DE ACCESO',fr:'EMAIL D\'ACCÈS',de:'ZUGANGS-E-MAIL'},
                emailHelper: {pt:'Este e-mail receberá suas credenciais de login.',en:'This email will receive your login credentials.',es:'Este correo recibirá sus credenciales.',fr:'Cet e-mail recevra vos identifiants.',de:'Diese E-Mail erhält Ihre Anmeldedaten.'},
                cardLabel: {pt:'NÚMERO DO CARTÃO',en:'CARD NUMBER',es:'NÚMERO DE TARJETA',fr:'NUMÉRO DE CARTE',de:'KARTENNUMMER'},
                expiryLabel: {pt:'EXPIRAÇÃO',en:'EXPIRY',es:'VENCIMIENTO',fr:'EXPIRATION',de:'ABLAUF'},
                cvcLabel: {pt:'CVC',en:'CVC',es:'CVC',fr:'CVC',de:'CVC'},
                nameLabel: {pt:'NOME COMPLETO (ESCRITO NO CARTÃO)',en:'FULL NAME (AS ON CARD)',es:'NOMBRE COMPLETO (COMO EN LA TARJETA)',fr:'NOM COMPLET (SUR LA CARTE)',de:'VOLLSTÄNDIGER NAME (AUF DER KARTE)'},
                payTitle: {pt:'Pagamento Seguro',en:'Secure Payment',es:'Pago Seguro',fr:'Paiement Sécurisé',de:'Sichere Zahlung'},
                viaLabel: {pt:'PAGAMENTO VIA:',en:'PAYMENT METHOD:',es:'PAGO VIA:',fr:'PAIEMENT VIA:',de:'ZAHLUNGSMETHODE:'},
                chipLabel: {pt:'CARTÃO DE CRÉDITO',en:'CREDIT CARD',es:'TARJETA DE CRÉDITO',fr:'CARTE DE CRÉDIT',de:'KREDITKARTE'},
                secureText: {pt:'Pagamento 100% Seguro',en:'100% Secure Payment',es:'Pago 100% Seguro',fr:'Paiement 100% Sécurisé',de:'100% Sichere Zahlung'},
                secureLeft: {pt:'Pagamento 100% Seguro',en:'100% Secure Payment',es:'Pago 100% Seguro',fr:'Paiement 100% Sécurisé',de:'100% Sichere Zahlung'},
                secureLeftDesc: {pt:'Seus dados são protegidos por criptografia SSL.',en:'Your data is protected with SSL encryption.',es:'Sus datos están protegidos con cifrado SSL.',fr:'Vos données sont protégées par cryptage SSL.',de:'Ihre Daten sind durch SSL-Verschlüsselung geschützt.'},
                badge: {pt:'PLANO PROFISSIONAL ATIVADO',en:'PROFESSIONAL PLAN ACTIVATED',es:'PLAN PROFESIONAL ACTIVADO',fr:'PLAN PROFESSIONNEL ACTIVÉ',de:'PROFI-PLAN AKTIVIERT'},
                planName: {pt:'Plano Mensal',en:'Monthly Plan',es:'Plan Mensual',fr:'Plan Mensuel',de:'Monatsplan'},
                docLabel: {pt:'DOCUMENTO DO PAGADOR (CPF OU CNPJ)',en:'PAYER DOCUMENT',es:'DOCUMENTO DEL PAGADOR',fr:'DOCUMENT DU PAYEUR',de:'ZAHLERDOKUMENT'}
            };
            const featureDefaults = {
                pt:[{t:'Gestão com IA Integrada',d:'Aplicação para solicitações da igreja.'},{t:'Automação de Cultos',d:'Lembretes e avisos 100% automáticos.'},{t:'Células e Eventos',d:'Controle total de presença, cursos e células.'}],
                en:[{t:'AI-Integrated Management',d:'Application for church requests.'},{t:'Service Automation',d:'Reminders and alerts 100% automatic.'},{t:'Cells & Events',d:'Full control of attendance, courses and cells.'}],
                es:[{t:'Gestión con IA Integrada',d:'Aplicación para solicitudes de la iglesia.'},{t:'Automatización de Cultos',d:'Recordatorios y avisos 100% automáticos.'},{t:'Células y Eventos',d:'Control total de asistencia, cursos y células.'}],
                fr:[{t:'Gestion avec IA Intégrée',d:'Application pour les demandes de l\'église.'},{t:'Automatisation des Cultes',d:'Rappels et alertes 100% automatiques.'},{t:'Cellules et Événements',d:'Contrôle total des présences, cours et cellules.'}],
                de:[{t:'KI-Integrierte Verwaltung',d:'Anwendung für Kirchenanfragen.'},{t:'Gottesdienst-Automatisierung',d:'Erinnerungen und Warnungen 100% automatisch.'},{t:'Zellen & Veranstaltungen',d:'Volle Kontrolle über Anwesenheit, Kurse und Zellen.'}]
            };
            const priceTable = {
                BR:{amount:197.99,currency:'BRL',symbol:'R$',lang:'pt',showDoc:true,docPlaceholder:'000.000.000-00',docMax:18},
                US:{amount:39.90,currency:'USD',symbol:'US$',lang:'en',showDoc:false,docPlaceholder:'',docMax:0},
                PT:{amount:36.90,currency:'EUR',symbol:'€',lang:'pt',showDoc:true,docPlaceholder:'NIF',docMax:12},
                ES:{amount:36.90,currency:'EUR',symbol:'€',lang:'es',showDoc:true,docPlaceholder:'DNI/NIE',docMax:12},
                GB:{amount:29.90,currency:'GBP',symbol:'£',lang:'en',showDoc:false,docPlaceholder:'',docMax:0},
                FR:{amount:36.90,currency:'EUR',symbol:'€',lang:'fr',showDoc:false,docPlaceholder:'',docMax:0},
                DE:{amount:36.90,currency:'EUR',symbol:'€',lang:'de',showDoc:false,docPlaceholder:'',docMax:0},
                IT:{amount:36.90,currency:'EUR',symbol:'€',lang:'en',showDoc:true,docPlaceholder:'Codice Fiscale',docMax:16},
                MX:{amount:499,currency:'MXN',symbol:'MX$',lang:'es',showDoc:true,docPlaceholder:'RFC',docMax:13},
                AR:{amount:24990,currency:'ARS',symbol:'ARS$',lang:'es',showDoc:true,docPlaceholder:'CUIT/CUIL',docMax:13},
                CL:{amount:24990,currency:'CLP',symbol:'$',lang:'es',showDoc:true,docPlaceholder:'RUT',docMax:12},
                CO:{amount:119900,currency:'COP',symbol:'$',lang:'es',showDoc:true,docPlaceholder:'Cédula',docMax:12},
                PE:{amount:99,currency:'PEN',symbol:'S/',lang:'es',showDoc:true,docPlaceholder:'DNI/CE',docMax:12},
                EC:{amount:29.90,currency:'USD',symbol:'$',lang:'es',showDoc:true,docPlaceholder:'Cédula',docMax:10},
                PY:{amount:199000,currency:'PYG',symbol:'₲',lang:'es',showDoc:true,docPlaceholder:'CI',docMax:10},
                UY:{amount:1290,currency:'UYU',symbol:'$',lang:'es',showDoc:true,docPlaceholder:'CI',docMax:10},
                BO:{amount:199,currency:'BOB',symbol:'Bs',lang:'es',showDoc:true,docPlaceholder:'CI',docMax:10},
                VE:{amount:14.90,currency:'USD',symbol:'$',lang:'es',showDoc:true,docPlaceholder:'Cédula',docMax:10},
                CA:{amount:49.90,currency:'CAD',symbol:'C$',lang:'en',showDoc:false,docPlaceholder:'',docMax:0},
                AU:{amount:49.90,currency:'AUD',symbol:'A$',lang:'en',showDoc:false,docPlaceholder:'',docMax:0},
                JP:{amount:4990,currency:'JPY',symbol:'¥',lang:'en',showDoc:false,docPlaceholder:'',docMax:0},
                CN:{amount:199,currency:'CNY',symbol:'¥',lang:'en',showDoc:false,docPlaceholder:'',docMax:0},
                KR:{amount:39900,currency:'KRW',symbol:'₩',lang:'en',showDoc:false,docPlaceholder:'',docMax:0},
                IN:{amount:2499,currency:'INR',symbol:'₹',lang:'en',showDoc:true,docPlaceholder:'PAN/Aadhaar',docMax:14},
                ZA:{amount:499,currency:'ZAR',symbol:'R',lang:'en',showDoc:true,docPlaceholder:'ID Number',docMax:13},
                NG:{amount:29900,currency:'NGN',symbol:'₦',lang:'en',showDoc:true,docPlaceholder:'NIN/BVN',docMax:11},
                KE:{amount:3990,currency:'KES',symbol:'KSh',lang:'en',showDoc:true,docPlaceholder:'ID Number',docMax:10},
                GH:{amount:399,currency:'GHS',symbol:'GH₵',lang:'en',showDoc:true,docPlaceholder:'Ghana Card',docMax:15},
                AO:{amount:19900,currency:'AOA',symbol:'Kz',lang:'pt',showDoc:true,docPlaceholder:'BI',docMax:14},
                MZ:{amount:1990,currency:'MZN',symbol:'MT',lang:'pt',showDoc:true,docPlaceholder:'BI',docMax:14},
                RW:{amount:34900,currency:'RWF',symbol:'FRw',lang:'en',showDoc:true,docPlaceholder:'ID Number',docMax:16},
                TZ:{amount:74900,currency:'TZS',symbol:'TSh',lang:'en',showDoc:true,docPlaceholder:'ID Number',docMax:10},
                NL:{amount:36.90,currency:'EUR',symbol:'€',lang:'en',showDoc:false,docPlaceholder:'',docMax:0},
                BE:{amount:36.90,currency:'EUR',symbol:'€',lang:'fr',showDoc:false,docPlaceholder:'',docMax:0},
                CH:{amount:34.90,currency:'CHF',symbol:'CHF',lang:'de',showDoc:false,docPlaceholder:'',docMax:0},
                AT:{amount:36.90,currency:'EUR',symbol:'€',lang:'de',showDoc:false,docPlaceholder:'',docMax:0},
                SE:{amount:349,currency:'SEK',symbol:'kr',lang:'en',showDoc:false,docPlaceholder:'',docMax:0},
                NO:{amount:349,currency:'NOK',symbol:'kr',lang:'en',showDoc:false,docPlaceholder:'',docMax:0},
                DK:{amount:249,currency:'DKK',symbol:'kr',lang:'en',showDoc:false,docPlaceholder:'',docMax:0},
                FI:{amount:36.90,currency:'EUR',symbol:'€',lang:'en',showDoc:false,docPlaceholder:'',docMax:0},
                PL:{amount:149.90,currency:'PLN',symbol:'zł',lang:'en',showDoc:true,docPlaceholder:'PESEL',docMax:11},
                CZ:{amount:799,currency:'CZK',symbol:'Kč',lang:'en',showDoc:false,docPlaceholder:'',docMax:0},
                HU:{amount:12990,currency:'HUF',symbol:'Ft',lang:'en',showDoc:false,docPlaceholder:'',docMax:0},
                RO:{amount:169.90,currency:'RON',symbol:'lei',lang:'en',showDoc:true,docPlaceholder:'CNP',docMax:13},
                GR:{amount:36.90,currency:'EUR',symbol:'€',lang:'en',showDoc:true,docPlaceholder:'AFM',docMax:10},
                TR:{amount:1299,currency:'TRY',symbol:'₺',lang:'en',showDoc:true,docPlaceholder:'TC Kimlik',docMax:11},
                RU:{amount:2990,currency:'RUB',symbol:'₽',lang:'en',showDoc:false,docPlaceholder:'',docMax:0},
                UA:{amount:1199,currency:'UAH',symbol:'₴',lang:'en',showDoc:false,docPlaceholder:'',docMax:0},
                IL:{amount:149.90,currency:'ILS',symbol:'₪',lang:'en',showDoc:true,docPlaceholder:'ID Number',docMax:9},
                SA:{amount:149.90,currency:'SAR',symbol:'ر.س',lang:'en',showDoc:false,docPlaceholder:'',docMax:0},
                AE:{amount:149.90,currency:'AED',symbol:'د.إ',lang:'en',showDoc:false,docPlaceholder:'',docMax:0},
                EG:{amount:1499,currency:'EGP',symbol:'ج.م',lang:'en',showDoc:true,docPlaceholder:'National ID',docMax:14},
                TH:{amount:1290,currency:'THB',symbol:'฿',lang:'en',showDoc:false,docPlaceholder:'',docMax:0},
                VN:{amount:799000,currency:'VND',symbol:'₫',lang:'en',showDoc:false,docPlaceholder:'',docMax:0},
                PH:{amount:1990,currency:'PHP',symbol:'₱',lang:'en',showDoc:false,docPlaceholder:'',docMax:0},
                ID:{amount:449000,currency:'IDR',symbol:'Rp',lang:'en',showDoc:false,docPlaceholder:'',docMax:0},
                MY:{amount:149.90,currency:'MYR',symbol:'RM',lang:'en',showDoc:false,docPlaceholder:'',docMax:0},
                SG:{amount:49.90,currency:'SGD',symbol:'S$',lang:'en',showDoc:false,docPlaceholder:'',docMax:0},
                NZ:{amount:59.90,currency:'NZD',symbol:'NZ$',lang:'en',showDoc:false,docPlaceholder:'',docMax:0}
            };
            this.localeData = {defaults,featureDefaults,priceTable};
            this.detectBrowserLanguage();
            this.buildConfig();
            document.documentElement.lang = this.cfg.locale;
        },
        switchCountry(code) {
            this.country = code;
            this.buildConfig();
            document.documentElement.lang = this.cfg.locale;
        },
        detectBrowserLanguage() {
            try {
                const lang = navigator.language || navigator.userLanguage || 'pt-BR';
                const langCode = lang.split('-')[0].toLowerCase();
                const countryCode = (lang.split('-')[1] || '').toUpperCase();
                const langToCountry = {
                    pt: ['BR','PT','AO','MZ'], en: ['US','GB','CA','AU','NZ','SG','PH'],
                    es: ['ES','MX','AR','CL','CO','PE','EC','PY','UY','BO','VE'],
                    fr: ['FR','BE'], de: ['DE','AT','CH'], it: ['IT'], ja: ['JP'],
                    ko: ['KR'], zh: ['CN'], nl: ['NL'], sv: ['SE'], nb: ['NO'],
                    da: ['DK'], fi: ['FI'], pl: ['PL'], cs: ['CZ'], hu: ['HU'],
                    ro: ['RO'], el: ['GR'], tr: ['TR'], ru: ['RU'], uk: ['UA'],
                    he: ['IL'], ar: ['SA','AE','EG'], th: ['TH'], vi: ['VN'],
                    id: ['ID'], hi: ['IN'], sw: ['KE','TZ','RW'],
                };
                if (countryCode && this.countries.find(c => c.code === countryCode)) {
                    this.country = countryCode;
                } else if (langToCountry[langCode] && langToCountry[langCode][0]) {
                    this.country = langToCountry[langCode][0];
                }
            } catch(e) { this.country = 'BR'; }
        },
        buildConfig() {
            const p = this.localeData.priceTable[this.country] || this.localeData.priceTable.BR;
            const lang = p.lang || 'pt';
            const d = this.localeData.defaults;
            const f = this.localeData.featureDefaults[lang] || this.localeData.featureDefaults.pt;
            this.cfg = {
                locale: this.getLocale(this.country, lang),
                currency: p.currency, symbol: p.symbol, amount: p.amount,
                billingLabel: d.billingLabel[lang] || d.billingLabel.pt,
                btnPrefix: d.btnPrefix[lang] || d.btnPrefix.pt,
                emailLabel: d.emailLabel[lang] || d.emailLabel.pt,
                emailHelper: d.emailHelper[lang] || d.emailHelper.pt,
                cardLabel: d.cardLabel[lang] || d.cardLabel.pt,
                expiryLabel: d.expiryLabel[lang] || d.expiryLabel.pt,
                cvcLabel: d.cvcLabel[lang] || d.cvcLabel.pt,
                nameLabel: d.nameLabel[lang] || d.nameLabel.pt,
                payTitle: d.payTitle[lang] || d.payTitle.pt,
                viaLabel: d.viaLabel[lang] || d.viaLabel.pt,
                chipLabel: d.chipLabel[lang] || d.chipLabel.pt,
                secureText: d.secureText[lang] || d.secureText.pt,
                secureLeft: d.secureLeft[lang] || d.secureLeft.pt,
                secureLeftDesc: d.secureLeftDesc[lang] || d.secureLeftDesc.pt,
                badge: d.badge[lang] || d.badge.pt,
                planName: d.planName[lang] || d.planName.pt,
                docLabel: d.docLabel[lang] || d.docLabel.pt,
                showDoc: p.showDoc, docPlaceholder: p.docPlaceholder, docMax: p.docMax,
                features: f
            };
        },
        getLocale(code, lang) {
            const map = {BR:'pt-BR',US:'en-US',PT:'pt-PT',ES:'es-ES',GB:'en-GB',FR:'fr-FR',DE:'de-DE',IT:'it-IT',MX:'es-MX',AR:'es-AR',CL:'es-CL',CO:'es-CO',PE:'es-PE',EC:'es-EC',PY:'es-PY',UY:'es-UY',BO:'es-BO',VE:'es-VE',CA:'en-CA',AU:'en-AU',JP:'ja-JP',CN:'zh-CN',KR:'ko-KR',IN:'en-IN',ZA:'en-ZA',NG:'en-NG',KE:'en-KE',GH:'en-GH',AO:'pt-AO',MZ:'pt-MZ',RW:'en-RW',TZ:'en-TZ',NL:'nl-NL',BE:'fr-BE',CH:'de-CH',AT:'de-AT',SE:'sv-SE',NO:'nb-NO',DK:'da-DK',FI:'fi-FI',PL:'pl-PL',CZ:'cs-CZ',HU:'hu-HU',RO:'ro-RO',GR:'el-GR',TR:'tr-TR',RU:'ru-RU',UA:'uk-UA',IL:'he-IL',SA:'ar-SA',AE:'ar-AE',EG:'ar-EG',TH:'th-TH',VN:'vi-VN',PH:'en-PH',ID:'id-ID',MY:'en-MY',SG:'en-SG',NZ:'en-NZ'};
            return map[code] || 'en-US';
        },
        fmt() {
            try { return new Intl.NumberFormat(this.cfg.locale, {style:'currency',currency:this.cfg.currency}).format(this.cfg.amount); }
            catch(e) { return this.cfg.symbol + ' ' + this.cfg.amount.toFixed(2); }
        },
        fmtDec() {
            try { return this.cfg.amount.toLocaleString(this.cfg.locale, {minimumFractionDigits:2, maximumFractionDigits:2}); }
            catch(e) { return this.cfg.amount.toFixed(2).replace('.',','); }
        },
        formatCardNumber(value) {
            const digits = value.replace(/\D/g, '').substring(0, 19);
            const groups = digits.match(/.{1,4}/g) || [];
            return groups.join(' ');
        },
        getDisplayNumber() {
            if (!this.cardNumber) return '•••• •••• •••• ••••';
            const formatted = this.formatCardNumber(this.cardNumber);
            const padded = formatted.padEnd(19, '•');
            return padded;
        },
        getDisplayExpiry() {
            if (!this.cardExpiry) return 'MM/AA';
            return this.cardExpiry;
        },
        getDisplayHolder() {
            if (!this.cardHolder) return 'FULL NAME';
            return this.cardHolder.toUpperCase();
        },
        getDisplayCvv() {
            if (!this.cardCvv) return '•••';
            return this.cardCvv;
        },
        handleCardNumberInput(e) {
            const raw = e.target.value.replace(/\D/g, '').substring(0, 19);
            this.cardNumber = raw;
            e.target.value = this.formatCardNumber(raw);
            if (window.CardEngine) {
                this.cardDetection = window.CardEngine.detectCard(raw);
                this.detectedBrand = this.cardDetection.brand || 'default';
                if (this.cardDetection.brand === 'unknown') {
                    this.validationState.number = 'invalid';
                } else if (this.cardDetection.valid) {
                    this.validationState.number = 'valid';
                } else if (raw.length >= 6) {
                    this.validationState.number = 'partial';
                } else {
                    this.validationState.number = '';
                }
            } else {
                this.detectedBrand = this.detectBrandFallback(raw);
            }
        },
        detectBrandFallback(number) {
            const digits = number.replace(/\D/g, '');
            if (/^4/.test(digits)) return 'visa';
            if (/^5[1-5]/.test(digits) || /^2[2-7]/.test(digits)) return 'mastercard';
            if (/^3[47]/.test(digits)) return 'amex';
            if (/^(636368|438935|504175|451416|636297|5067|4576|4011)/.test(digits)) return 'elo';
            if (/^(606282|3841)/.test(digits)) return 'hipercard';
            if (/^3(0[0-5]|[68])/.test(digits)) return 'diners';
            if (/^6(?:011|5)/.test(digits)) return 'discover';
            if (/^(?:2131|1800|35)/.test(digits)) return 'jcb';
            return 'default';
        },
        handleExpiryInput(e) {
            let raw = e.target.value.replace(/\D/g, '').substring(0, 4);
            if (raw.length >= 2) {
                let month = parseInt(raw.substring(0, 2));
                if (month > 12) month = 12;
                if (month < 1 && raw.substring(0, 2) !== '0') month = 1;
                raw = String(month).padStart(2, '0') + raw.substring(2);
                raw = raw.substring(0, 2) + '/' + raw.substring(2);
            }
            this.cardExpiry = raw;
            e.target.value = raw;
            if (raw.length === 5) {
                const [m, y] = raw.split('/');
                const now = new Date();
                const expYear = 2000 + parseInt(y);
                const expMonth = parseInt(m);
                if (expMonth < 1 || expMonth > 12) {
                    this.validationState.expiry = 'invalid';
                } else if (expYear < now.getFullYear() || (expYear === now.getFullYear() && expMonth < now.getMonth() + 1)) {
                    this.validationState.expiry = 'invalid';
                } else {
                    this.validationState.expiry = 'valid';
                }
            } else {
                this.validationState.expiry = '';
            }
        },
        handleCvvInput(e) {
            const maxLen = this.cardDetection?.cvvLength || 3;
            const raw = e.target.value.replace(/\D/g, '').substring(0, maxLen);
            this.cardCvv = raw;
            e.target.value = raw;
            if (raw.length === maxLen) {
                this.validationState.cvv = 'valid';
            } else if (raw.length > 0) {
                this.validationState.cvv = 'partial';
            } else {
                this.validationState.cvv = '';
            }
        },
        handleHolderInput(e) {
            this.cardHolder = e.target.value.replace(/[^a-zA-Z\s]/g, '');
            if (this.cardHolder.trim().length >= 3) {
                this.validationState.holder = 'valid';
            } else {
                this.validationState.holder = '';
            }
        },
        flipCard() { this.isFlipped = !this.isFlipped; },
        focusCvv() { this.isFlipped = true; },
        blurCvv() { this.isFlipped = false; },
        getValidationClass(field) {
            const state = this.validationState[field];
            if (state === 'valid') return 'input-valid';
            if (state === 'invalid') return 'input-error';
            return '';
        },
        getValidationBadge(field) {
            const state = this.validationState[field];
            if (state === 'valid') return '<span class=\"validation-badge valid\">✓ Válido</span>';
            if (state === 'invalid') return '<span class=\"validation-badge invalid\">✗ Inválido</span>';
            if (state === 'partial') return '<span class=\"validation-badge partial\">⏳ Verificando</span>';
            return '';
        },
        isFormValid() {
            return this.validationState.number === 'valid' &&
                   this.validationState.expiry === 'valid' &&
                   this.validationState.cvv === 'valid' &&
                   this.validationState.holder === 'valid' &&
                   this.cardCvv.length > 0;
        },
        async handleSubmit(e) {
            e.preventDefault();
            if (!this.isFormValid() || this.isProcessing) return;

            this.isProcessing = true;

            try {
                const tokenResult = await window.CardEngine.tokenizeCard({
                    card_number: this.cardNumber,
                    card_holder_name: this.cardHolder,
                    card_expiry: this.cardExpiry,
                    card_cvv: this.cardCvv,
                });

                if (tokenResult.success) {
                    this.cardToken = tokenResult.token;
                    const form = e.target;
                    const tokenInput = document.createElement('input');
                    tokenInput.type = 'hidden';
                    tokenInput.name = 'card_token';
                    tokenInput.value = tokenResult.token.id;
                    form.appendChild(tokenInput);

                    const brandInput = document.createElement('input');
                    brandInput.type = 'hidden';
                    brandInput.name = 'card_brand';
                    brandInput.value = tokenResult.token.brand;
                    form.appendChild(brandInput);

                    const last4Input = document.createElement('input');
                    last4Input.type = 'hidden';
                    last4Input.name = 'card_last4';
                    last4Input.value = tokenResult.token.last4;
                    form.appendChild(last4Input);

                    form.submit();
                } else {
                    alert(tokenResult.error || 'Erro ao processar cartão');
                    this.isProcessing = false;
                }
            } catch (err) {
                console.error('Tokenization error:', err);
                const form = e.target;
                form.submit();
            }
        }
    }"
>
    <section class="main-card">
        <div class="left-panel">
            <div class="brand">
                <div class="brand-logo">
                    <img src="/img/basileia-logo.png" alt="Basileia" onerror="this.parentElement.innerHTML='<span style=color:#7c2ef0;font-size:26px;font-weight:800>B</span>'">
                </div>
                <div class="brand-text">Basileia</div>
            </div>
            <div class="plan-badge" x-text="cfg.badge"></div>
            <h1 class="plan-title" x-text="cfg.planName"></h1>
            <div class="price-row">
                <span class="price-currency" x-text="cfg.symbol"></span>
                <span class="price-value" x-text="fmtDec()"></span>
                <span class="price-period" x-text="cfg.billingLabel"></span>
            </div>
            <div class="features">
                <template x-for="f in cfg.features" :key="f.t">
                    <div class="feature-item">
                        <div class="feature-icon">✓</div>
                        <div>
                            <div class="feature-title" x-text="f.t"></div>
                            <div class="feature-desc" x-text="f.d"></div>
                        </div>
                    </div>
                </template>
            </div>
            <div class="left-bottom">
                <div class="left-security-title" x-text="cfg.secureLeft"></div>
                <div class="left-security-desc" x-text="cfg.secureLeftDesc"></div>
                <div class="card-brands">
                    <svg class="brand-icon-img" viewBox="0 0 80 30"><rect width="80" height="30" rx="4" fill="#fff"/><text x="40" y="21" font-size="16" font-weight="bold" fill="#1A1F71" text-anchor="middle" font-family="Inter,sans-serif">VISA</text></svg>
                    <svg class="brand-icon-img" viewBox="0 0 80 30"><rect width="80" height="30" rx="4" fill="#fff"/><circle cx="30" cy="15" r="10" fill="#EB001B"/><circle cx="50" cy="15" r="10" fill="#F79E1B"/><path d="M40 7.5a10 10 0 0 1 0 15 10 10 0 0 1 0-15z" fill="#FF5F00"/></svg>
                    <svg class="brand-icon-img" viewBox="0 0 80 30"><rect width="80" height="30" rx="4" fill="#006FCF"/><text x="40" y="19" font-size="11" fill="#fff" text-anchor="middle" font-weight="bold" font-family="Inter,sans-serif">AMEX</text></svg>
                    <svg class="brand-icon-img" viewBox="0 0 60 30"><rect width="60" height="30" rx="4" fill="#FFCB05"/><text x="30" y="20" font-size="14" fill="#0047BB" text-anchor="middle" font-weight="bold" font-family="Inter,sans-serif">ELO</text></svg>
                </div>
            </div>
        </div>

        <div class="right-panel">
            <div class="locale-switcher">
                <select @change="switchCountry($event.target.value)" x-model="country">
                    <template x-for="c in countries" :key="c.code">
                        <option :value="c.code" x-text="c.flag + ' ' + c.name"></option>
                    </template>
                </select>
            </div>
            <h2 class="form-title" x-text="cfg.payTitle"></h2>
            <div class="payment-via">
                <span class="payment-label" x-text="cfg.viaLabel"></span>
                <span class="payment-chip" x-text="cfg.chipLabel"></span>
            </div>

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
                                        <path d="M8.5 16.5a5 5 0 0 1 0-9"/>
                                        <path d="M12 19a8 8 0 0 0 0-14"/>
                                        <path d="M15.5 21.5a11 11 0 0 0 0-19"/>
                                    </svg>
                                </div>
                            </div>
                            <div class="card-brand-logo">
                                <template x-if="detectedBrand === 'visa'">
                                    <svg viewBox="0 0 80 30"><text x="40" y="22" font-size="18" font-weight="bold" fill="#fff" text-anchor="middle" font-family="Inter,sans-serif" font-style="italic">VISA</text></svg>
                                </template>
                                <template x-if="detectedBrand === 'mastercard'">
                                    <svg viewBox="0 0 80 30">
                                        <circle cx="30" cy="15" r="10" fill="#EB001B" opacity="0.9"/>
                                        <circle cx="50" cy="15" r="10" fill="#F79E1B" opacity="0.9"/>
                                        <path d="M40 7.5a10 10 0 0 1 0 15 10 10 0 0 1 0-15z" fill="#FF5F00" opacity="0.8"/>
                                    </svg>
                                </template>
                                <template x-if="detectedBrand === 'amex'">
                                    <svg viewBox="0 0 80 30"><text x="40" y="20" font-size="13" font-weight="bold" fill="#fff" text-anchor="middle" font-family="Inter,sans-serif">AMEX</text></svg>
                                </template>
                                <template x-if="detectedBrand === 'elo'">
                                    <svg viewBox="0 0 80 30"><text x="40" y="20" font-size="16" font-weight="bold" fill="#fff" text-anchor="middle" font-family="Inter,sans-serif">ELO</text></svg>
                                </template>
                                <template x-if="detectedBrand === 'hipercard'">
                                    <svg viewBox="0 0 80 30"><text x="40" y="20" font-size="10" font-weight="bold" fill="#fff" text-anchor="middle" font-family="Inter,sans-serif">HIPER</text></svg>
                                </template>
                                <template x-if="detectedBrand === 'diners'">
                                    <svg viewBox="0 0 80 30"><text x="40" y="20" font-size="10" font-weight="bold" fill="#fff" text-anchor="middle" font-family="Inter,sans-serif">DINERS</text></svg>
                                </template>
                                <template x-if="detectedBrand === 'discover'">
                                    <svg viewBox="0 0 80 30"><text x="40" y="20" font-size="11" font-weight="bold" fill="#fff" text-anchor="middle" font-family="Inter,sans-serif">DISCOVER</text></svg>
                                </template>
                                <template x-if="detectedBrand === 'jcb'">
                                    <svg viewBox="0 0 80 30"><text x="40" y="20" font-size="14" font-weight="bold" fill="#fff" text-anchor="middle" font-family="Inter,sans-serif">JCB</text></svg>
                                </template>
                                <template x-if="detectedBrand === 'cabal'">
                                    <svg viewBox="0 0 80 30"><text x="40" y="20" font-size="12" font-weight="bold" fill="#fff" text-anchor="middle" font-family="Inter,sans-serif">CABAL</text></svg>
                                </template>
                                <template x-if="detectedBrand === 'banescard'">
                                    <svg viewBox="0 0 80 30"><text x="40" y="20" font-size="9" font-weight="bold" fill="#fff" text-anchor="middle" font-family="Inter,sans-serif">BANES</text></svg>
                                </template>
                                <template x-if="detectedBrand === 'default'">
                                    <svg viewBox="0 0 80 30"><text x="40" y="20" font-size="12" font-weight="bold" fill="rgba(255,255,255,0.5)" text-anchor="middle" font-family="Inter,sans-serif">CARD</text></svg>
                                </template>
                            </div>
                        </div>
                        <div class="card-number-display" x-text="getDisplayNumber()"></div>
                        <div class="card-bottom-row">
                            <div>
                                <div class="card-holder-label">CARD HOLDER</div>
                                <div class="card-holder-display" x-text="getDisplayHolder()"></div>
                            </div>
                            <div class="card-expiry-display">
                                <div class="card-expiry-label">EXPIRES</div>
                                <div class="card-expiry-value" x-text="getDisplayExpiry()"></div>
                            </div>
                        </div>
                    </div>
                    <div class="card-face card-back">
                        <div class="card-back-bg" :class="'brand-' + detectedBrand"></div>
                        <div class="card-back-magnetic"></div>
                        <div class="card-back-strip">
                            <span class="cvc-display" x-text="getDisplayCvv()"></span>
                            <div class="cvc-highlight"></div>
                        </div>
                        <div class="card-back-info">
                            Este cartão é propriedade do emissor. Uso sujeito ao contrato. Em caso de perda, ligue para o SAC.
                        </div>
                    </div>
                </div>
            </div>

            <form method="POST" action="{{ route('checkout.process', $transaction->uuid) }}" @submit.prevent="handleSubmit($event)">
                @csrf
                <input type="hidden" name="payment_method" value="credit_card">
                <div class="form-group">
                    <label class="form-label" x-text="cfg.emailLabel"></label>
                    <input type="email" name="email" class="form-input" value="{{ $transaction->customer_email ?? '' }}" placeholder="email@example.com" required>
                    <div class="form-helper" x-text="cfg.emailHelper"></div>
                </div>
                <div class="form-group">
                    <label class="form-label" x-text="cfg.cardLabel"></label>
                    <input type="text" name="card_number" class="form-input" :class="getValidationClass('number')" maxlength="19" placeholder="0000 0000 0000 0000" required
                        @input="handleCardNumberInput($event)">
                    <div class="form-error" :class="{ visible: validationState.number === 'invalid' }">
                        <span x-show="cardDetection && cardDetection.reason === 'luhn_failed'">Número do cartão inválido (falha na verificação)</span>
                        <span x-show="cardDetection && cardDetection.reason === 'invalid_length'">Tamanho do número incorreto para esta bandeira</span>
                        <span x-show="cardDetection && cardDetection.reason === 'brand_not_found'">Bandeira não identificada</span>
                    </div>
                </div>
                <div class="form-row">
                    <div>
                        <label class="form-label" x-text="cfg.expiryLabel"></label>
                        <input type="text" name="card_expiry" class="form-input" :class="getValidationClass('expiry')" maxlength="5" placeholder="MM/AA" required
                            @input="handleExpiryInput($event)">
                        <div class="form-error" :class="{ visible: validationState.expiry === 'invalid' }">Data de expiração inválida ou cartão expirado</div>
                    </div>
                    <div>
                        <label class="form-label" x-text="cfg.cvcLabel"></label>
                        <input type="text" name="card_cvv" class="form-input" :class="getValidationClass('cvv')" :maxlength="cardDetection?.cvvLength || 3" placeholder="123" required
                            @input="handleCvvInput($event)"
                            @focus="focusCvv()"
                            @blur="blurCvv()">
                    </div>
                </div>
                <div class="form-group" style="margin-top:6px;">
                    <label class="form-label" x-text="cfg.nameLabel"></label>
                    <input type="text" name="card_holder_name" class="form-input" :class="getValidationClass('holder')" placeholder="FULL NAME" required
                        @input="handleHolderInput($event)"
                        style="text-transform:uppercase;">
                </div>
                <div class="form-group" x-show="cfg.showDoc">
                    <label class="form-label" x-text="cfg.docLabel"></label>
                    <input type="text" name="cpf_cnpj" class="form-input" :maxlength="cfg.docMax" :placeholder="cfg.docPlaceholder" required>
                </div>
                <button type="submit" class="cta-button" :disabled="!isFormValid() || isProcessing">
                    <span x-show="!isProcessing" x-text="cfg.btnPrefix + ' ' + fmt()"></span>
                    <span x-show="isProcessing">Processando...</span>
                </button>
            </form>
            <div class="security-footer">
                <svg width="15" height="15" fill="none" stroke="#3ca95c" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
                <span x-text="cfg.secureText"></span>
            </div>
        </div>
        <div class="footer-note">© 2024 Basileia Vendas - Enterprise Cloud Operations</div>
    </section>
</body>
</html>
