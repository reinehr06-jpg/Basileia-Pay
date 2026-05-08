{{-- resources/views/checkout/index.blade.php --}}
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>{{ $plano ?? $transaction->description }} - Checkout</title>
    <script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js"></script>
    <script src="https://unpkg.com/lucide@latest/dist/umd/lucide.min.js"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Share+Tech+Mono&display=swap" rel="stylesheet">
    <style>
        *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

        html, body {
            height: 100%;
            font-family: 'Inter', sans-serif;
            background: #0d0d1a;
            overflow-x: hidden;
        }

        /* ─── MESH GRADIENT BACKGROUND ─────────────────────── */
        .mesh-bg {
            position: fixed;
            inset: 0;
            z-index: 0;
            background: #0d0d1a;
            overflow: hidden;
        }
        .mesh-bg::before {
            content: '';
            position: absolute;
            width: 600px; height: 600px;
            top: -200px; left: -200px;
            background: radial-gradient(circle, rgba(99,102,241,0.35) 0%, transparent 70%);
            border-radius: 50%;
            animation: floatA 12s ease-in-out infinite;
        }
        .mesh-bg::after {
            content: '';
            position: absolute;
            width: 500px; height: 500px;
            bottom: -150px; right: -150px;
            background: radial-gradient(circle, rgba(236,72,153,0.3) 0%, transparent 70%);
            border-radius: 50%;
            animation: floatB 15s ease-in-out infinite;
        }
        .mesh-ball-mid {
            position: absolute;
            width: 400px; height: 400px;
            top: 40%; left: 50%;
            transform: translate(-50%, -50%);
            background: radial-gradient(circle, rgba(139,92,246,0.2) 0%, transparent 70%);
            border-radius: 50%;
            animation: floatC 10s ease-in-out infinite;
        }
        @keyframes floatA { 0%,100%{transform:translate(0,0)} 50%{transform:translate(40px,60px)} }
        @keyframes floatB { 0%,100%{transform:translate(0,0)} 50%{transform:translate(-50px,-40px)} }
        @keyframes floatC { 0%,100%{transform:translate(-50%,-50%) scale(1)} 50%{transform:translate(-50%,-50%) scale(1.2)} }

        /* ─── TOP BAR ────────────────────────────────────────── */
        .top-bar {
            position: relative;
            z-index: 10;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 16px 32px;
            background: rgba(255,255,255,0.04);
            backdrop-filter: blur(12px);
            border-bottom: 1px solid rgba(255,255,255,0.08);
        }
        .top-bar-brand {
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .top-bar-logo {
            width: 36px; height: 36px;
            background: white;
            border-radius: 8px;
            display: flex; align-items: center; justify-content: center;
            overflow: hidden;
        }
        .top-bar-logo img { width: 100%; height: 100%; object-fit: contain; }
        .top-bar-name { color: white; font-weight: 700; font-size: 16px; }
        .top-bar-right { display: flex; align-items: center; gap: 16px; }
        .top-bar-secure {
            display: flex; align-items: center; gap: 6px;
            color: rgba(255,255,255,0.6); font-size: 12px; font-weight: 500;
        }

        /* Country selector */
        .country-selector { position: relative; }
        .country-btn {
            display: flex; align-items: center; gap: 8px;
            background: rgba(255,255,255,0.08);
            border: 1px solid rgba(255,255,255,0.15);
            border-radius: 10px;
            padding: 8px 14px;
            color: white; font-size: 13px; font-weight: 500;
            cursor: pointer;
            transition: background 0.2s;
        }
        .country-btn:hover { background: rgba(255,255,255,0.14); }
        .country-dropdown {
            position: absolute;
            top: calc(100% + 8px);
            right: 0;
            background: #1e1b2e;
            border: 1px solid rgba(255,255,255,0.12);
            border-radius: 14px;
            width: 200px;
            max-height: 280px;
            overflow-y: auto;
            z-index: 1000;
            box-shadow: 0 20px 40px rgba(0,0,0,0.4);
            padding: 6px;
        }
        .country-dropdown::-webkit-scrollbar { width: 4px; }
        .country-dropdown::-webkit-scrollbar-track { background: transparent; }
        .country-dropdown::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 2px; }
        .country-option {
            display: flex; align-items: center; gap: 10px;
            padding: 9px 12px;
            border-radius: 8px;
            cursor: pointer;
            color: rgba(255,255,255,0.85); font-size: 13px;
            transition: background 0.15s;
        }
        .country-option:hover { background: rgba(255,255,255,0.08); }
        .country-option.active { background: rgba(139,92,246,0.2); color: white; }

        /* ─── MAIN WRAPPER ──────────────────────────────────── */
        .page-body {
            position: relative;
            z-index: 1;
            min-height: calc(100vh - 69px);
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 40px 20px;
        }
        .checkout-wrapper {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 32px;
            max-width: 960px;
            width: 100%;
        }

        /* ─── LEFT CARD (INFO) ──────────────────────────────── */
        .info-card {
            background: rgba(255,255,255,0.04);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 24px;
            padding: 40px 36px;
            color: white;
            display: flex;
            flex-direction: column;
            gap: 28px;
        }
        .info-logo-wrap {
            width: 64px; height: 64px;
            background: white;
            border-radius: 14px;
            overflow: hidden;
            display: flex; align-items: center; justify-content: center;
            box-shadow: 0 8px 24px rgba(0,0,0,0.3);
        }
        .info-logo-wrap img { width: 100%; object-fit: contain; }
        .info-badge {
            display: inline-block;
            background: rgba(139,92,246,0.25);
            border: 1px solid rgba(139,92,246,0.4);
            color: #c4b5fd;
            font-size: 11px;
            font-weight: 700;
            letter-spacing: 1.5px;
            text-transform: uppercase;
            padding: 5px 14px;
            border-radius: 999px;
        }
        .info-plan { font-size: 36px; font-weight: 800; line-height: 1.1; }
        .info-price { display: flex; align-items: baseline; gap: 4px; }
        .info-price-sym { font-size: 20px; font-weight: 500; opacity: 0.7; margin-top: 4px; }
        .info-price-val { font-size: 52px; font-weight: 800; line-height: 1; }
        .info-price-per { font-size: 14px; opacity: 0.6; text-transform: uppercase; letter-spacing: 0.5px; }
        .info-divider { height: 1px; background: rgba(255,255,255,0.08); }
        .info-features { display: flex; flex-direction: column; gap: 14px; }
        .info-feature { display: flex; align-items: flex-start; gap: 12px; }
        .info-feature-check {
            width: 22px; height: 22px; min-width: 22px;
            background: rgba(34,197,94,0.2);
            border-radius: 50%;
            display: flex; align-items: center; justify-content: center;
            margin-top: 1px;
        }
        .info-feature-check svg { color: #4ade80; }
        .info-feature-text { font-size: 14px; line-height: 1.5; }
        .info-feature-title { font-weight: 600; }
        .info-feature-desc { opacity: 0.6; font-size: 12px; }
        .info-footer {
            display: flex; align-items: center; gap: 8px;
            font-size: 12px; color: rgba(255,255,255,0.4);
            margin-top: auto;
        }

        /* ─── RIGHT CARD (PAYMENT) ──────────────────────────── */
        .payment-card {
            background: white;
            border-radius: 24px;
            padding: 36px 32px;
            display: flex;
            flex-direction: column;
            gap: 0;
            box-shadow: 0 32px 64px rgba(0,0,0,0.4);
        }
        .payment-header { margin-bottom: 24px; }
        .payment-title { font-size: 22px; font-weight: 800; color: #0f0a1e; }
        .payment-subtitle { font-size: 13px; color: #64748b; margin-top: 4px; }

        /* ─── 3D CREDIT CARD ───────────────────────────────── */
        .card-3d-scene {
            width: 100%;
            height: 185px;
            perspective: 1200px;
            margin-bottom: 24px;
            cursor: pointer;
        }
        .card-3d-inner {
            position: relative;
            width: 100%;
            height: 100%;
            transform-style: preserve-3d;
            transition: transform 0.7s cubic-bezier(0.4, 0.2, 0.2, 1);
            filter: drop-shadow(0 20px 40px rgba(99,60,220,0.4));
        }
        .card-3d-inner.flipped { transform: rotateY(180deg); }
        .card-3d-face {
            position: absolute;
            width: 100%; height: 100%;
            backface-visibility: hidden;
            border-radius: 18px;
            overflow: hidden;
        }
        /* Gradiente azul → rosa suave e leve */
        .card-3d-front {
            background: linear-gradient(135deg,
                #4f46e5 0%,
                #6d28d9 35%,
                #9333ea 65%,
                #db2777 100%
            );
            padding: 22px 24px;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            color: white;
            position: relative;
        }
        .card-3d-front::before {
            content: '';
            position: absolute;
            top: -40%; right: -20%;
            width: 300px; height: 300px;
            background: radial-gradient(circle, rgba(255,255,255,0.12) 0%, transparent 60%);
            border-radius: 50%;
            pointer-events: none;
        }
        .card-3d-front::after {
            content: '';
            position: absolute;
            bottom: -30%; left: -10%;
            width: 200px; height: 200px;
            background: radial-gradient(circle, rgba(219,39,119,0.2) 0%, transparent 60%);
            border-radius: 50%;
            pointer-events: none;
        }
        .card-3d-back {
            transform: rotateY(180deg);
            background: linear-gradient(135deg, #3730a3 0%, #5b21b6 50%, #7e22ce 100%);
            display: flex;
            flex-direction: column;
            justify-content: center;
        }
        .card-chip {
            width: 42px; height: 32px;
            background: linear-gradient(135deg, #f0c040 0%, #d4a017 100%);
            border-radius: 6px;
            position: relative;
            z-index: 1;
        }
        .card-chip::after {
            content: '';
            position: absolute;
            top: 50%; left: 50%;
            transform: translate(-50%,-50%);
            width: 60%; height: 40%;
            border: 1.5px solid rgba(0,0,0,0.2);
            border-radius: 3px;
        }
        .card-top-row {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            position: relative; z-index: 1;
        }
        .card-number-display {
            font-family: 'Share Tech Mono', monospace;
            font-size: 19px;
            letter-spacing: 3px;
            color: white;
            text-shadow: 0 2px 8px rgba(0,0,0,0.3);
            position: relative; z-index: 1;
        }
        .card-bottom-row {
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            position: relative; z-index: 1;
        }
        .card-field-label { font-size: 9px; opacity: 0.65; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 3px; }
        .card-field-value { font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
        .card-brand-area { display: flex; align-items: center; }
        /* Back */
        .card-mag-strip { height: 42px; background: rgba(0,0,0,0.7); margin-top: 20px; }
        .card-sig-strip {
            margin: 12px 20px;
            height: 36px;
            background: white;
            border-radius: 4px;
            display: flex; align-items: center; justify-content: flex-end;
            padding-right: 14px;
        }
        .card-cvv-val {
            font-family: 'Share Tech Mono', monospace;
            font-size: 18px;
            color: #1e1e1e;
            letter-spacing: 3px;
            font-weight: 700;
        }

        /* ─── FORM ELEMENTS ─────────────────────────────────── */
        .form-group { margin-bottom: 13px; }
        .form-label {
            display: block;
            font-size: 11px;
            font-weight: 700;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 0.8px;
            margin-bottom: 5px;
        }
        .form-input {
            width: 100%;
            height: 44px;
            background: #f8fafc;
            border: 1.5px solid #e2e8f0;
            border-radius: 10px;
            padding: 0 14px;
            font-size: 14px;
            font-family: 'Inter', sans-serif;
            color: #1e293b;
            transition: border-color 0.2s, box-shadow 0.2s;
        }
        .form-input:focus {
            outline: none;
            border-color: #8b5cf6;
            box-shadow: 0 0 0 3px rgba(139,92,246,0.12);
        }
        .form-input::placeholder { color: #b8c0cc; }
        /* Select parcelas — dropdown nativo, sem problema de z-index */
        select.form-input {
            appearance: none;
            -webkit-appearance: none;
            cursor: pointer;
            background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath fill='%2364748b' d='M1 1l5 5 5-5'/%3E%3C/svg%3E");
            background-repeat: no-repeat;
            background-position: right 12px center;
            background-color: #f8fafc;
            padding-right: 34px;
        }
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

        /* ─── BUTTONS ───────────────────────────────────────── */
        .btn-pay {
            width: 100%;
            height: 50px;
            border: none;
            border-radius: 12px;
            background: linear-gradient(90deg, #6d28d9, #db2777);
            color: white;
            font-size: 15px;
            font-weight: 700;
            font-family: 'Inter', sans-serif;
            cursor: pointer;
            margin-top: 16px;
            display: flex; align-items: center; justify-content: center; gap: 8px;
            transition: opacity 0.2s, transform 0.2s, box-shadow 0.2s;
            box-shadow: 0 8px 24px rgba(109,40,217,0.35);
            position: relative;
            overflow: hidden;
        }
        .btn-pay::before {
            content: '';
            position: absolute;
            inset: 0;
            background: linear-gradient(90deg, rgba(255,255,255,0.08), transparent);
        }
        .btn-pay:hover { transform: translateY(-2px); box-shadow: 0 12px 30px rgba(109,40,217,0.45); }
        .btn-pay:disabled { opacity: 0.65; cursor: not-allowed; transform: none; }
        .btn-back {
            width: 100%;
            height: 40px;
            background: transparent;
            border: 1.5px solid #e2e8f0;
            border-radius: 10px;
            color: #64748b;
            font-size: 13px;
            font-weight: 600;
            font-family: 'Inter', sans-serif;
            cursor: pointer;
            margin-top: 8px;
            transition: background 0.2s, border-color 0.2s;
        }
        .btn-back:hover { background: #f8fafc; border-color: #8b5cf6; }

        /* ─── SPINNER ───────────────────────────────────────── */
        .spinner {
            width: 18px; height: 18px;
            border: 2.5px solid rgba(255,255,255,0.3);
            border-top-color: white;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* ─── SECURITY FOOTER ───────────────────────────────── */
        .security-row {
            display: flex; align-items: center; justify-content: center; gap: 6px;
            font-size: 11px; color: #94a3b8; margin-top: 14px;
        }

        /* ─── MOBILE ─────────────────────────────────────────── */
        @media (max-width: 800px) {
            .checkout-wrapper { grid-template-columns: 1fr; max-width: 480px; }
            .info-card { padding: 28px 24px; }
            .info-plan { font-size: 28px; }
            .info-price-val { font-size: 40px; }
            .payment-card { padding: 28px 24px; }
            .top-bar { padding: 12px 20px; }
        }

        [x-cloak] { display: none !important; }
    </style>
</head>
<body x-data="{
    /* ── State ── */
    step: 1,
    loading: false,
    isFlipped: false,
    showDropdown: false,

    /* ── Card data ── */
    cardNumber: '',
    cardExpiry: '',
    cardCvv: '',
    cardHolder: '',
    installments: 1,

    /* ── Config ── */
    maxInstallments: {{ $transaction->max_installments ?? 12 }},
    amount: {{ $transaction->amount ?? 0 }},

    /* ── i18n / locale ── */
    locale: 'pt-BR',
    currency: 'BRL',
    currencySymbol: 'R$',
    currentLocale: 'pt-BR',

    /* ── Countries ── */
    currentCountry: { code: 'BR', flag: '🇧🇷', name: 'Brasil', lang: 'pt-BR', currency: 'BRL', symbol: 'R$' },
    countries: [
        { code: 'BR', flag: '🇧🇷', name: 'Brasil',          lang: 'pt-BR', currency: 'BRL', symbol: 'R$' },
        { code: 'US', flag: '🇺🇸', name: 'USA',             lang: 'en-US', currency: 'USD', symbol: '$'  },
        { code: 'PT', flag: '🇵🇹', name: 'Portugal',        lang: 'pt-PT', currency: 'EUR', symbol: '€'  },
        { code: 'ES', flag: '🇪🇸', name: 'España',          lang: 'es-ES', currency: 'EUR', symbol: '€'  },
        { code: 'FR', flag: '🇫🇷', name: 'France',          lang: 'fr-FR', currency: 'EUR', symbol: '€'  },
        { code: 'DE', flag: '🇩🇪', name: 'Deutschland',     lang: 'de-DE', currency: 'EUR', symbol: '€'  },
        { code: 'IT', flag: '🇮🇹', name: 'Italia',          lang: 'it-IT', currency: 'EUR', symbol: '€'  },
        { code: 'GB', flag: '🇬🇧', name: 'United Kingdom',  lang: 'en-GB', currency: 'GBP', symbol: '£'  },
        { code: 'JP', flag: '🇯🇵', name: '日本',             lang: 'ja-JP', currency: 'JPY', symbol: '¥'  },
        { code: 'MX', flag: '🇲🇽', name: 'México',          lang: 'es-MX', currency: 'MXN', symbol: '$'  },
        { code: 'AR', flag: '🇦🇷', name: 'Argentina',       lang: 'es-AR', currency: 'ARS', symbol: '$'  },
        { code: 'CO', flag: '🇨🇴', name: 'Colombia',        lang: 'es-CO', currency: 'COP', symbol: '$'  },
        { code: 'CL', flag: '🇨🇱', name: 'Chile',           lang: 'es-CL', currency: 'CLP', symbol: '$'  },
        { code: 'CA', flag: '🇨🇦', name: 'Canada',          lang: 'en-CA', currency: 'CAD', symbol: '$'  },
        { code: 'AU', flag: '🇦🇺', name: 'Australia',       lang: 'en-AU', currency: 'AUD', symbol: '$'  },
        { code: 'CH', flag: '🇨🇭', name: 'Switzerland',     lang: 'de-CH', currency: 'CHF', symbol: 'Fr' },
        { code: 'AO', flag: '🇦🇴', name: 'Angola',          lang: 'pt-AO', currency: 'AOA', symbol: 'Kz' },
        { code: 'MZ', flag: '🇲🇿', name: 'Moçambique',      lang: 'pt-MZ', currency: 'MZN', symbol: 'MT' },
    ],

    /* ── Methods ── */
    setCountry(c) {
        this.currentCountry = c;
        this.currencySymbol = c.symbol;
        this.locale = c.lang;
        this.showDropdown = false;
    },
    formatPrice(val) {
        try {
            return new Intl.NumberFormat(this.locale, {
                style: 'currency', currency: this.currentCountry.currency,
                minimumFractionDigits: 2, maximumFractionDigits: 2
            }).format(val);
        } catch(e) {
            return this.currencySymbol + ' ' + Number(val).toFixed(2).replace('.', ',');
        }
    },
    installmentLabel(n) {
        let val = (this.amount / n).toFixed(2).replace('.', ',');
        return n + 'x de ' + this.currencySymbol + ' ' + val + (n === 1 ? ' (à vista)' : ' sem juros');
    },
    formatCardNum(v) {
        return v ? v.replace(/(.{4})/g, '$1 ').trim() : '**** **** **** ****';
    },
    updateCardNumber(e) {
        let raw = e.target.value.replace(/\D/g, '').substring(0, 16);
        this.cardNumber = raw;
        e.target.value = raw.replace(/(.{4})/g, '$1 ').trim();
    },
    updateExpiry(e) {
        let raw = e.target.value.replace(/\D/g, '').substring(0, 4);
        if (raw.length > 2) raw = raw.substring(0, 2) + '/' + raw.substring(2);
        this.cardExpiry = raw;
        e.target.value = raw;
    },
    getCardBrand() {
        let n = this.cardNumber;
        if (n.startsWith('4')) return 'visa';
        if (/^5[1-5]/.test(n)) return 'mastercard';
        if (/^3[47]/.test(n)) return 'amex';
        return 'generic';
    },
    proceed() {
        if (!this.cardNumber || !this.cardExpiry || !this.cardCvv || !this.cardHolder) {
            alert('Preencha todos os dados do cartão.');
            return;
        }
        this.step = 2;
        this.isFlipped = false;
    },
    init() {
        this.$nextTick(() => { if (window.lucide) lucide.createIcons(); });
    }
}"
@click.away="showDropdown = false">

<!-- Mesh BG -->
<div class="mesh-bg"><div class="mesh-ball-mid"></div></div>

<!-- ═══════════════════════════════════════════ TOP BAR -->
<header class="top-bar">
    <div class="top-bar-brand">
        <div class="top-bar-logo">
            <img src="{{ asset('img/basileia-logo.png') }}"
                 alt="Basileia"
                 onerror="this.parentElement.innerHTML='<span style=\'color:#7c3aed;font-weight:900;font-size:18px\'>B</span>'">
        </div>
        <span class="top-bar-name">Basileia</span>
    </div>

    <div class="top-bar-right">
        <div class="top-bar-secure">
            <svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/></svg>
            Checkout Seguro
        </div>

        <!-- Country selector -->
        <div class="country-selector">
            <button type="button" class="country-btn" @click.stop="showDropdown = !showDropdown">
                <span x-text="currentCountry.flag"></span>
                <span x-text="currentCountry.code" style="font-weight:700"></span>
                <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"
                     :style="showDropdown ? 'transform:rotate(180deg)' : ''"
                     style="transition:transform 0.2s">
                    <path d="M6 9l6 6 6-6"/>
                </svg>
            </button>
            <div class="country-dropdown" x-show="showDropdown" x-cloak @click.stop>
                <template x-for="c in countries" :key="c.code">
                    <div class="country-option"
                         :class="{'active': currentCountry.code === c.code}"
                         @click="setCountry(c)">
                        <span x-text="c.flag"></span>
                        <span x-text="c.name"></span>
                    </div>
                </template>
            </div>
        </div>
    </div>
</header>

<!-- ═══════════════════════════════════════════ PAGE BODY -->
<div class="page-body">
    <div class="checkout-wrapper">

        <!-- ═══ LEFT: INFO CARD ═══ -->
        <div class="info-card">
            <div>
                <div class="info-logo-wrap">
                    <img src="{{ asset('img/basileia-logo.png') }}" alt="Basileia"
                         onerror="this.style.display='none'">
                </div>
            </div>

            <div>
                <div class="info-badge">{{ strtoupper($ciclo ?? 'mensal') }}</div>
                <h1 class="info-plan" style="margin-top:10px">{{ $plano ?? $transaction->description }}</h1>
            </div>

            <div class="info-price">
                <span class="info-price-sym" x-text="currencySymbol"></span>
                <span class="info-price-val">{{ number_format($transaction->amount, 2, ',', '.') }}</span>
                <span class="info-price-per">{{ ($ciclo ?? 'mensal') === 'anual' ? '/ano' : '/mês' }}</span>
            </div>

            <div class="info-divider"></div>

            <div class="info-features">
                <div class="info-feature">
                    <div class="info-feature-check">
                        <svg width="11" height="11" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg>
                    </div>
                    <div class="info-feature-text">
                        <div class="info-feature-title">Acesso imediato ao painel</div>
                        <div class="info-feature-desc">Credenciais enviadas no seu e-mail.</div>
                    </div>
                </div>
                <div class="info-feature">
                    <div class="info-feature-check">
                        <svg width="11" height="11" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg>
                    </div>
                    <div class="info-feature-text">
                        <div class="info-feature-title">Assistente IA no WhatsApp</div>
                        <div class="info-feature-desc">Atenda membros 24h com inteligência artificial.</div>
                    </div>
                </div>
                <div class="info-feature">
                    <div class="info-feature-check">
                        <svg width="11" height="11" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg>
                    </div>
                    <div class="info-feature-text">
                        <div class="info-feature-title">Gestão completa de membros</div>
                        <div class="info-feature-desc">Cadastros, trilha de crescimento e árvore genealógica.</div>
                    </div>
                </div>
                <div class="info-feature">
                    <div class="info-feature-check">
                        <svg width="11" height="11" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg>
                    </div>
                    <div class="info-feature-text">
                        <div class="info-feature-title">Renovação automática</div>
                        <div class="info-feature-desc">Sem surpresas. Cancele quando quiser.</div>
                    </div>
                </div>
            </div>

            <div class="info-footer">
                <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/></svg>
                Basileia Church © {{ date('Y') }} · Conexão SSL 256-bit
            </div>
        </div>

        <!-- ═══ RIGHT: PAYMENT CARD ═══ -->
        <div class="payment-card">

            <!-- ── STEP 1: DADOS DO CARTÃO ── -->
            <div x-show="step === 1" x-cloak>
                <div class="payment-header">
                    <h2 class="payment-title">Dados do Cartão</h2>
                    <p class="payment-subtitle">Preencha os dados do seu cartão de crédito</p>
                </div>

                <!-- CARTÃO 3D -->
                <div class="card-3d-scene" @click="isFlipped = !isFlipped" title="Clique para virar">
                    <div class="card-3d-inner" :class="{ flipped: isFlipped }">

                        <!-- FRENTE -->
                        <div class="card-3d-face card-3d-front">
                            <div class="card-top-row">
                                <div class="card-chip"></div>
                                <div class="card-brand-area">
                                    <!-- VISA -->
                                    <template x-if="getCardBrand() === 'visa'">
                                        <svg viewBox="0 0 60 20" height="22" fill="white">
                                            <text x="0" y="17" font-size="18" font-weight="900" font-family="Arial">VISA</text>
                                        </svg>
                                    </template>
                                    <!-- MASTERCARD -->
                                    <template x-if="getCardBrand() === 'mastercard'">
                                        <svg viewBox="0 0 44 28" height="28">
                                            <circle cx="16" cy="14" r="12" fill="#EB001B"/>
                                            <circle cx="28" cy="14" r="12" fill="#F79E1B" opacity="0.85"/>
                                        </svg>
                                    </template>
                                    <!-- AMEX -->
                                    <template x-if="getCardBrand() === 'amex'">
                                        <svg viewBox="0 0 50 22" height="22" fill="white">
                                            <text x="0" y="17" font-size="14" font-weight="700" font-family="Arial">AMEX</text>
                                        </svg>
                                    </template>
                                    <!-- GENERIC -->
                                    <template x-if="getCardBrand() === 'generic'">
                                        <svg viewBox="0 0 44 28" height="26">
                                            <circle cx="16" cy="14" r="12" fill="rgba(255,255,255,0.3)"/>
                                            <circle cx="28" cy="14" r="12" fill="rgba(255,255,255,0.15)"/>
                                        </svg>
                                    </template>
                                </div>
                            </div>
                            <div class="card-number-display" x-text="formatCardNum(cardNumber)"></div>
                            <div class="card-bottom-row">
                                <div>
                                    <div class="card-field-label">Titular</div>
                                    <div class="card-field-value" x-text="cardHolder || 'NOME DO TITULAR'"></div>
                                </div>
                                <div style="text-align:right">
                                    <div class="card-field-label">Validade</div>
                                    <div class="card-field-value" x-text="cardExpiry || 'MM/AA'"></div>
                                </div>
                            </div>
                        </div>

                        <!-- VERSO -->
                        <div class="card-3d-face card-3d-back">
                            <div class="card-mag-strip"></div>
                            <div class="card-sig-strip">
                                <span class="card-cvv-val" x-text="cardCvv || '•••'"></span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- FORMULÁRIO -->
                <div class="form-group">
                    <label class="form-label">Número do Cartão</label>
                    <input type="text" class="form-input"
                           placeholder="0000 0000 0000 0000"
                           maxlength="19"
                           @input="updateCardNumber($event)"
                           @focus="isFlipped = false">
                </div>

                <div class="form-group">
                    <label class="form-label">Nome no Cartão</label>
                    <input type="text" class="form-input"
                           placeholder="Como está impresso no cartão"
                           x-model="cardHolder"
                           @focus="isFlipped = false"
                           style="text-transform:uppercase">
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Validade</label>
                        <input type="text" class="form-input"
                               placeholder="MM/AA" maxlength="5"
                               @input="updateExpiry($event)"
                               @focus="isFlipped = false">
                    </div>
                    <div class="form-group">
                        <label class="form-label">CVV</label>
                        <input type="text" class="form-input"
                               placeholder="•••" maxlength="4"
                               x-model="cardCvv"
                               @focus="isFlipped = true"
                               @blur="isFlipped = false">
                    </div>
                </div>

                <!-- ✅ PARCELAS com select nativo (sem dropdown customizado) -->
                <div class="form-group">
                    <label class="form-label">Parcelas</label>
                    <select class="form-input" x-model.number="installments">
                        <template x-for="n in maxInstallments" :key="n">
                            <option :value="n" x-text="installmentLabel(n)"></option>
                        </template>
                    </select>
                </div>

                <button type="button" class="btn-pay" @click="proceed()">
                    <span>Continuar para revisão</span>
                    <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </button>

                <div class="security-row">
                    <svg width="11" height="11" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/></svg>
                    Pagamento 100% seguro e criptografado
                </div>
            </div>

            <!-- ── STEP 2: CONFIRMAÇÃO + SUBMIT ── -->
            <div x-show="step === 2" x-cloak>
                <div class="payment-header">
                    <h2 class="payment-title">Confirmar Pagamento</h2>
                    <p class="payment-subtitle">Revise as informações antes de finalizar</p>
                </div>

                <!-- Resumo do cartão -->
                <div style="background:#f0f4ff; border:1px solid #c7d2fe; border-radius:12px; padding:14px 16px; margin-bottom:18px; display:flex; align-items:center; gap:10px;">
                    <svg width="18" height="18" fill="none" stroke="#4f46e5" stroke-width="2" viewBox="0 0 24 24"><rect x="1" y="4" width="22" height="16" rx="2"/><path d="M1 10h22"/></svg>
                    <span style="font-size:13px; color:#3730a3; font-weight:600;">
                        **** **** **** <span x-text="cardNumber.slice(-4) || '????'"></span>
                        &nbsp;·&nbsp;
                        <span x-text="installmentLabel(installments)"></span>
                    </span>
                </div>

                <form method="POST"
                      action="{{ route('checkout.process', $transaction->uuid) }}"
                      @submit="loading = true">
                    @csrf
                    <input type="hidden" name="payment_method" value="credit_card">
                    <input type="hidden" name="card_number"    :value="cardNumber.replace(/\s/g,'')">
                    <input type="hidden" name="card_expiry"    :value="cardExpiry">
                    <input type="hidden" name="card_cvv"       :value="cardCvv">
                    <input type="hidden" name="card_name"      :value="cardHolder">
                    {{-- ✅ PARCELAS CHEGAM AO SERVIDOR --}}
                    <input type="hidden" name="installments"   :value="installments">

                    <div class="form-group">
                        <label class="form-label">E-mail</label>
                        <input type="email" name="email" class="form-input"
                               placeholder="seu@email.com"
                               value="{{ $customerData['email'] ?? '' }}" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Nome / Organização</label>
                        <input type="text" name="customer_name" class="form-input"
                               placeholder="Nome da sua organização"
                               value="{{ $customerData['name'] ?? '' }}" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">CPF / CNPJ</label>
                        <input type="text" name="customer_document" class="form-input"
                               placeholder="00.000.000/0001-00"
                               value="{{ $customerData['document'] ?? '' }}" required>
                    </div>

                    <button type="submit" class="btn-pay" :disabled="loading">
                        <template x-if="!loading">
                            <span style="display:flex;align-items:center;gap:8px">
                                <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/></svg>
                                Finalizar Pagamento
                            </span>
                        </template>
                        <template x-if="loading">
                            <span style="display:flex;align-items:center;gap:8px">
                                <div class="spinner"></div>
                                Processando...
                            </span>
                        </template>
                    </button>

                    <button type="button" class="btn-back" x-show="!loading" @click="step = 1">
                        ← Voltar e editar
                    </button>
                </form>

                <div class="security-row">
                    <svg width="11" height="11" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/></svg>
                    Pagamento 100% seguro e criptografado
                </div>
            </div>

        </div>{{-- end .payment-card --}}
    </div>{{-- end .checkout-wrapper --}}
</div>{{-- end .page-body --}}

<script>
    document.addEventListener('alpine:init', () => {
        if (window.lucide) lucide.createIcons();
    });
</script>
</body>
</html>
