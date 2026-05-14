{{-- resources/views/components/card-form.blade.php --}}
{{-- Formulário de cartão de crédito 3D reutilizável — extraído das duplicatas de basileia-vendor, pay, asaas, preview e demo --}}
@props([
    'action' => '#',
    'transaction' => null,
    'customerData' => [],
    'showI18n' => false,
    'showInstallments' => true,
    'maxInstallments' => 12,
    'amount' => 0,
    'plano' => '',
    'ciclo' => 'mensal',
])

@php
    $locale = app()->getLocale();
    $currencySymbol = match($locale) {
        'en-US' => '$',
        'es-ES' => '€',
        'pt-PT' => '€',
        default => 'R$',
    };
@endphp

<div x-data="{
    step: 1,
    loading: false,
    isFlipped: false,
    cardNumber: '',
    cardExpiry: '',
    cardCvv: '',
    cardHolder: '{{ $customerData['name'] ?? '' }}',
    installments: 1,
    maxInstallments: {{ $maxInstallments }},
    amount: {{ $amount }},
    locale: '{{ $locale }}',
    currencySymbol: '{{ $currencySymbol }}',

    formatCardNum(v) { return v ? v.replace(/(.{4})/g, '$1 ').trim() : '**** **** **** ****'; },
    updateCardNumber(e) { let raw = e.target.value.replace(/\D/g, '').substring(0, 16); this.cardNumber = raw; e.target.value = raw.replace(/(.{4})/g, '$1 ').trim(); },
    updateExpiry(e) { let raw = e.target.value.replace(/\D/g, '').substring(0, 4); if (raw.length > 2) raw = raw.substring(0, 2) + '/' + raw.substring(2); this.cardExpiry = raw; e.target.value = raw; },
    getCardBrand() {
        if (typeof window !== 'undefined' && window.CardEngine && window.CardEngine.detectCard) {
            let result = window.CardEngine.detectCard(this.cardNumber);
            return result.brand || 'generic';
        }
        // Fallback embutido caso card-engine.js não esteja carregado
        let n = this.cardNumber;
        if (n.startsWith('4')) return 'visa';
        if (/^5[1-5]/.test(n)) return 'mastercard';
        if (/^3[47]/.test(n)) return 'amex';
        if (/^(401178|401179|431274|438935|451416|457393|504175|506699|5067|636368)/.test(n)) return 'elo';
        return 'generic';
    },
    proceed() { if (!this.cardNumber || !this.cardExpiry || !this.cardCvv || !this.cardHolder) { alert('Preencha todos os dados do cartão.'); return; } this.step = 2; this.isFlipped = false; },
}">

    <!-- STEP 1: DADOS DO CARTÃO -->
    <div x-show="step === 1" x-cloak>
        <div class="payment-header">
            <h2 class="payment-title">Dados do Cartão</h2>
            <p class="payment-subtitle">Preencha os dados do seu cartão de crédito</p>
        </div>

        <!-- CARD 3D -->
        <div class="card-3d-scene" @click="isFlipped = !isFlipped" title="Clique para virar">
            <div class="card-3d-inner" :class="{ flipped: isFlipped }">
                <!-- FRENTE -->
                <div class="card-3d-face card-3d-front">
                    <div class="card-top-row">
                        <div class="card-chip"></div>
                        <div class="card-brand-area">
                            <template x-if="getCardBrand() === 'visa'">
                                <svg viewBox="0 0 60 20" height="22" fill="white"><text x="0" y="17" font-size="18" font-weight="900" font-family="Arial">VISA</text></svg>
                            </template>
                            <template x-if="getCardBrand() === 'mastercard'">
                                <svg viewBox="0 0 44 28" height="28"><circle cx="16" cy="14" r="12" fill="#EB001B"/><circle cx="28" cy="14" r="12" fill="#F79E1B" opacity="0.85"/></svg>
                            </template>
                            <template x-if="getCardBrand() === 'amex'">
                                <svg viewBox="0 0 50 22" height="22" fill="white"><text x="0" y="17" font-size="14" font-weight="700" font-family="Arial">AMEX</text></svg>
                            </template>
                            <template x-if="getCardBrand() === 'generic'">
                                <svg viewBox="0 0 44 28" height="26"><circle cx="16" cy="14" r="12" fill="rgba(255,255,255,0.3)"/><circle cx="28" cy="14" r="12" fill="rgba(255,255,255,0.15)"/></svg>
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
            <input type="text" class="form-input" placeholder="0000 0000 0000 0000" maxlength="19"
                   @input="updateCardNumber($event)" @focus="isFlipped = false">
        </div>
        <div class="form-group">
            <label class="form-label">Nome no Cartão</label>
            <input type="text" class="form-input" placeholder="Como está impresso no cartão"
                   x-model="cardHolder" @focus="isFlipped = false" style="text-transform:uppercase">
        </div>
        <div class="form-row">
            <div class="form-group">
                <label class="form-label">Validade</label>
                <input type="text" class="form-input" placeholder="MM/AA" maxlength="5"
                       @input="updateExpiry($event)" @focus="isFlipped = false">
            </div>
            <div class="form-group">
                <label class="form-label">CVV</label>
                <input type="text" class="form-input" placeholder="•••" maxlength="4"
                       x-model="cardCvv" @focus="isFlipped = true" @blur="isFlipped = false">
            </div>
        </div>
        @if($showInstallments)
        <div class="form-group">
            <label class="form-label">Parcelas</label>
            <select class="form-input" x-model.number="installments">
                <template x-for="n in maxInstallments" :key="n">
                    <option :value="n" x-text="n + 'x de ' + currencySymbol + ' ' + (amount / n).toFixed(2).replace('.', ',') + (n === 1 ? ' (à vista)' : ' sem juros')"></option>
                </template>
            </select>
        </div>
        @endif

        <button type="button" class="btn-pay" @click="proceed()">
            <span>Continuar para revisão</span>
            <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </button>

        <x-security-footer />
    </div>

    <!-- STEP 2: CONFIRMAÇÃO + SUBMIT -->
    <div x-show="step === 2" x-cloak>
        <div class="payment-header">
            <h2 class="payment-title">Confirmar Pagamento</h2>
            <p class="payment-subtitle">Revise as informações antes de finalizar</p>
        </div>

        <div style="background:#f0f4ff; border:1px solid #c7d2fe; border-radius:12px; padding:14px 16px; margin-bottom:18px; display:flex; align-items:center; gap:10px;">
            <svg width="18" height="18" fill="none" stroke="#4f46e5" stroke-width="2" viewBox="0 0 24 24"><rect x="1" y="4" width="22" height="16" rx="2"/><path d="M1 10h22"/></svg>
            <span style="font-size:13px; color:#3730a3; font-weight:600;">
                **** **** **** <span x-text="cardNumber.slice(-4) || '????'"></span>
                &nbsp;·&nbsp;
                <span x-text="installments + 'x de ' + currencySymbol + ' ' + (amount / installments).toFixed(2).replace('.', ',')"></span>
            </span>
        </div>

        <form method="POST" :action="action" @submit="loading = true">
            @csrf
            <input type="hidden" name="payment_method" value="credit_card">
            <input type="hidden" name="card_number"    :value="cardNumber.replace(/\s/g,'')">
            <input type="hidden" name="card_expiry"    :value="cardExpiry">
            <input type="hidden" name="card_cvv"       :value="cardCvv">
            <input type="hidden" name="card_name"      :value="cardHolder">
            <input type="hidden" name="installments"   :value="installments">

            <div class="form-group">
                <label class="form-label">E-mail</label>
                <input type="email" name="email" class="form-input" placeholder="seu@email.com"
                       value="{{ $customerData['email'] ?? '' }}" required>
            </div>
            <div class="form-group">
                <label class="form-label">Nome / Organização</label>
                <input type="text" name="customer_name" class="form-input" placeholder="Nome da sua organização"
                       value="{{ $customerData['name'] ?? '' }}" required>
            </div>
            <div class="form-group">
                <label class="form-label">CPF / CNPJ</label>
                <input type="text" name="customer_document" class="form-input" placeholder="00.000.000/0001-00"
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

        <x-security-footer />
    </div>
</div>