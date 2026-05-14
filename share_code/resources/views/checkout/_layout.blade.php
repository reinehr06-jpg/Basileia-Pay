{{-- resources/views/checkout/_layout.blade.php --}}
{{-- Layout base para todas as páginas de checkout (Cartão, PIX, Boleto). --}}
{{-- Cada módulo usa @extends('checkout._layout') e injeta seu conteúdo via @section. --}}
<!DOCTYPE html>
<html lang="pt-BR">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>@yield('title', ($plano ?? $transaction->description ?? 'Checkout') . ' - Checkout')</title>
    <script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js"></script>
    <script src="https://unpkg.com/lucide@latest/dist/umd/lucide.min.js"></script>
    <script defer src="{{ asset('js/card-engine.js') }}"></script>
    <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Share+Tech+Mono&display=swap"
        rel="stylesheet">
    <style>
        *,
        *::before,
        *::after {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        html,
        body {
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
            width: 600px;
            height: 600px;
            top: -200px;
            left: -200px;
            background: radial-gradient(circle, rgba(99, 102, 241, 0.35) 0%, transparent 70%);
            border-radius: 50%;
            animation: floatA 12s ease-in-out infinite;
        }

        .mesh-bg::after {
            content: '';
            position: absolute;
            width: 500px;
            height: 500px;
            bottom: -150px;
            right: -150px;
            background: radial-gradient(circle, rgba(236, 72, 153, 0.3) 0%, transparent 70%);
            border-radius: 50%;
            animation: floatB 15s ease-in-out infinite;
        }

        .mesh-ball-mid {
            position: absolute;
            width: 400px;
            height: 400px;
            top: 40%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: radial-gradient(circle, rgba(139, 92, 246, 0.2) 0%, transparent 70%);
            border-radius: 50%;
            animation: floatC 10s ease-in-out infinite;
        }

        @keyframes floatA {

            0%,
            100% {
                transform: translate(0, 0)
            }

            50% {
                transform: translate(40px, 60px)
            }
        }

        @keyframes floatB {

            0%,
            100% {
                transform: translate(0, 0)
            }

            50% {
                transform: translate(-50px, -40px)
            }
        }

        @keyframes floatC {

            0%,
            100% {
                transform: translate(-50%, -50%) scale(1)
            }

            50% {
                transform: translate(-50%, -50%) scale(1.2)
            }
        }

        /* ─── TOP BAR ────────────────────────────────────────── */
        .top-bar {
            position: relative;
            z-index: 10;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 16px 32px;
            background: rgba(255, 255, 255, 0.04);
            backdrop-filter: blur(12px);
            border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }

        .top-bar-brand {
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .top-bar-logo {
            width: 36px;
            height: 36px;
            background: white;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
        }

        .top-bar-logo img {
            width: 100%;
            height: 100%;
            object-fit: contain;
        }

        .top-bar-name {
            color: white;
            font-weight: 700;
            font-size: 16px;
        }

        .top-bar-right {
            display: flex;
            align-items: center;
            gap: 16px;
        }

        .top-bar-secure {
            display: flex;
            align-items: center;
            gap: 6px;
            color: rgba(255, 255, 255, 0.6);
            font-size: 12px;
            font-weight: 500;
        }

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
            background: rgba(255, 255, 255, 0.04);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 24px;
            padding: 40px 36px;
            color: white;
            display: flex;
            flex-direction: column;
            gap: 28px;
        }

        .info-logo-wrap {
            width: 64px;
            height: 64px;
            background: white;
            border-radius: 14px;
            overflow: hidden;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
        }

        .info-logo-wrap img {
            width: 100%;
            object-fit: contain;
        }

        .info-badge {
            display: inline-block;
            background: rgba(139, 92, 246, 0.25);
            border: 1px solid rgba(139, 92, 246, 0.4);
            color: #c4b5fd;
            font-size: 11px;
            font-weight: 700;
            letter-spacing: 1.5px;
            text-transform: uppercase;
            padding: 5px 14px;
            border-radius: 999px;
        }

        .info-plan {
            font-size: 36px;
            font-weight: 800;
            line-height: 1.1;
        }

        .info-price {
            display: flex;
            align-items: baseline;
            gap: 4px;
        }

        .info-price-sym {
            font-size: 20px;
            font-weight: 500;
            opacity: 0.7;
            margin-top: 4px;
        }

        .info-price-val {
            font-size: 52px;
            font-weight: 800;
            line-height: 1;
        }

        .info-price-per {
            font-size: 14px;
            opacity: 0.6;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .info-divider {
            height: 1px;
            background: rgba(255, 255, 255, 0.08);
        }

        .info-features {
            display: flex;
            flex-direction: column;
            gap: 14px;
        }

        .info-feature {
            display: flex;
            align-items: flex-start;
            gap: 12px;
        }

        .info-feature-check {
            width: 22px;
            height: 22px;
            min-width: 22px;
            background: rgba(34, 197, 94, 0.2);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-top: 1px;
        }

        .info-feature-check svg {
            color: #4ade80;
        }

        .info-feature-text {
            font-size: 14px;
            line-height: 1.5;
        }

        .info-feature-title {
            font-weight: 600;
        }

        .info-feature-desc {
            opacity: 0.6;
            font-size: 12px;
        }

        .info-footer {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 12px;
            color: rgba(255, 255, 255, 0.4);
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
            box-shadow: 0 32px 64px rgba(0, 0, 0, 0.4);
        }

        .payment-header {
            margin-bottom: 24px;
        }

        .payment-title {
            font-size: 22px;
            font-weight: 800;
            color: #0f0a1e;
        }

        .payment-subtitle {
            font-size: 13px;
            color: #64748b;
            margin-top: 4px;
        }

        /* ─── FORM ELEMENTS ─────────────────────────────────── */
        .form-group {
            margin-bottom: 13px;
        }

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
            box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.12);
        }

        .form-input::placeholder {
            color: #b8c0cc;
        }

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

        .form-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
        }

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
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            transition: opacity 0.2s, transform 0.2s, box-shadow 0.2s;
            box-shadow: 0 8px 24px rgba(109, 40, 217, 0.35);
            position: relative;
            overflow: hidden;
        }

        .btn-pay::before {
            content: '';
            position: absolute;
            inset: 0;
            background: linear-gradient(90deg, rgba(255, 255, 255, 0.08), transparent);
        }

        .btn-pay:hover {
            transform: translateY(-2px);
            box-shadow: 0 12px 30px rgba(109, 40, 217, 0.45);
        }

        .btn-pay:disabled {
            opacity: 0.65;
            cursor: not-allowed;
            transform: none;
        }

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

        .btn-back:hover {
            background: #f8fafc;
            border-color: #8b5cf6;
        }

        /* ─── SPINNER ───────────────────────────────────────── */
        .spinner {
            width: 18px;
            height: 18px;
            border: 2.5px solid rgba(255, 255, 255, 0.3);
            border-top-color: white;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
            to {
                transform: rotate(360deg);
            }
        }

        /* ─── SECURITY FOOTER ───────────────────────────────── */
        .security-row {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
            font-size: 11px;
            color: #94a3b8;
            margin-top: 14px;
        }

        /* ─── MOBILE ─────────────────────────────────────────── */
        @media (max-width: 800px) {
            .checkout-wrapper {
                grid-template-columns: 1fr;
                max-width: 480px;
            }

            .info-card {
                padding: 28px 24px;
            }

            .info-plan {
                font-size: 28px;
            }

            .info-price-val {
                font-size: 40px;
            }

            .payment-card {
                padding: 28px 24px;
            }

            .top-bar {
                padding: 12px 20px;
            }
        }

        [x-cloak] {
            display: none !important;
        }
    </style>
    @yield('styles')
</head>

<body x-data="{
        showDropdown: false,
        currencySymbol: 'R$',
        currentCountry: { code: 'BR', flag: '🇧🇷', name: 'Brasil' },
        countries: [
            { code: 'BR', flag: '🇧🇷', name: 'Brasil', symbol: 'R$' },
            { code: 'US', flag: '🇺🇸', name: 'USA', symbol: '$' },
            { code: 'PT', flag: '🇵🇹', name: 'Portugal', symbol: '€' },
            { code: 'ES', flag: '🇪🇸', name: 'España', symbol: '€' },
            { code: 'FR', flag: '🇫🇷', name: 'France', symbol: '€' },
            { code: 'DE', flag: '🇩🇪', name: 'Deutschland', symbol: '€' },
            { code: 'IT', flag: '🇮🇹', name: 'Italia', symbol: '€' },
            { code: 'GB', flag: '🇬🇧', name: 'United Kingdom', symbol: '£' },
            { code: 'JP', flag: '🇯🇵', name: '日本', symbol: '¥' },
            { code: 'MX', flag: '🇲🇽', name: 'México', symbol: '$' },
            { code: 'AR', flag: '🇦🇷', name: 'Argentina', symbol: '$' },
            { code: 'CO', flag: '🇨🇴', name: 'Colombia', symbol: '$' },
            { code: 'CL', flag: '🇨🇱', name: 'Chile', symbol: '$' },
            { code: 'CA', flag: '🇨🇦', name: 'Canada', symbol: '$' },
            { code: 'AU', flag: '🇦🇺', name: 'Australia', symbol: '$' },
            { code: 'CH', flag: '🇨🇭', name: 'Switzerland', symbol: 'Fr' },
            { code: 'AO', flag: '🇦🇴', name: 'Angola', symbol: 'Kz' },
            { code: 'MZ', flag: '🇲🇿', name: 'Moçambique', symbol: 'MT' },
        ],
        setCountry(c) { this.currentCountry = c; this.currencySymbol = c.symbol; this.showDropdown = false; }
    }" @click.away="showDropdown = false" {{ $section('body-attrs') }}>

    <!-- Mesh BG -->
    <div class="mesh-bg">
        <div class="mesh-ball-mid"></div>
    </div>

    <!-- ═══════════════════════════════════════════ TOP BAR -->
    <header class="top-bar">
        <div class="top-bar-brand">
            <div class="top-bar-logo">
                <img src="{{ asset('img/basileia-logo.png') }}" alt="Basileia"
                    onerror="this.parentElement.innerHTML='<span style=\'color:#7c3aed;font-weight:900;font-size:18px\'>B</span>'">
            </div>
            <span class="top-bar-name">Basileia</span>
        </div>

        <div class="top-bar-right">
            <div class="top-bar-secure">
                <svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
                </svg>
                Checkout Seguro
            </div>
            <div class="country-selector">
                <button type="button" class="country-btn" @click.stop="showDropdown = !showDropdown">
                    <span x-text="currentCountry.flag"></span>
                    <span x-text="currentCountry.code" style="font-weight:700"></span>
                    <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"
                        :style="showDropdown ? 'transform:rotate(180deg)' : ''" style="transition:transform 0.2s">
                        <path d="M6 9l6 6 6-6" />
                    </svg>
                </button>
                <div class="country-dropdown" x-show="showDropdown" x-cloak @click.stop>
                    <template x-for="c in countries" :key="c.code">
                        <div class="country-option" :class="{'active': currentCountry.code === c.code}"
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
                    <span class="info-price-sym">@yield('currency-symbol', 'R$')</span>
                    <span class="info-price-val">{{ number_format($transaction->amount, 2, ',', '.') }}</span>
                    <span class="info-price-per">{{ ($ciclo ?? 'mensal') === 'anual' ? '/ano' : '/mês' }}</span>
                </div>

                <div class="info-divider"></div>

                <div class="info-features">
                    @yield('features', View::make('checkout.shared.default-features'))
                </div>

                <div class="info-footer">
                    <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
                    </svg>
                    Basileia Church © {{ date('Y') }} · Conexão SSL 256-bit
                    <x-brand-logos :brands="['visa', 'master', 'elo']" size="sm" class="ml-2" />
                </div>
            </div>

            <!-- ═══ RIGHT: PAYMENT CARD ═══ -->
            <div class="payment-card">
                @yield('payment-content')
            </div>

        </div>{{-- end .checkout-wrapper --}}
    </div>{{-- end .page-body --}}

    @yield('scripts')

    <script>
        document.addEventListener('alpine:init', () => {
            if (window.lucide) lucide.createIcons();
        });
    </script>
</body>

</html>