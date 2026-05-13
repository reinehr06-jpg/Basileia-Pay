{{-- resources/views/checkout/pix/front/pagamento.blade.php --}}
@extends('checkout._layout')

@section('title', 'Pagamento via PIX - ' . ($plano ?? $transaction->description))

@section('payment-content')
<div x-data="{
    copied: false,
    copyPayload() {
        navigator.clipboard.writeText('{{ $pixData['payload'] ?? '' }}');
        this.copied = true;
        setTimeout(() => this.copied = false, 2000);
    }
}" class="pix-container" style="text-align: center; padding: 20px 0;">
    <div class="payment-header" style="margin-bottom: 30px;">
        <h2 class="payment-title">Pague com PIX</h2>
        <p class="payment-subtitle">Escaneie o QR Code ou copie a chave abaixo</p>
    </div>

    @if(!empty($pixData['encodedImage']))
        <div class="qr-code-wrapper" style="background: white; padding: 15px; border-radius: 16px; display: inline-block; box-shadow: 0 4px 20px rgba(0,0,0,0.08); margin-bottom: 20px;">
            <img src="data:image/png;base64,{{ $pixData['encodedImage'] }}" alt="QR Code PIX" style="width: 200px; height: 200px; display: block;">
        </div>
    @else
        <div class="alert alert-warning">Aguardando geração do QR Code...</div>
    @endif

    <div class="payload-box" style="background: #f1f5f9; padding: 12px; border-radius: 10px; margin-bottom: 20px; font-family: 'Share Tech Mono', monospace; font-size: 12px; word-break: break-all; position: relative;">
        {{ $pixData['payload'] ?? 'Carregando...' }}
    </div>

    <button @click="copyPayload" class="btn-pay" :class="copied ? 'copied' : ''">
        <template x-if="!copied">
            <span style="display: flex; align-items: center; gap: 8px;">
                <i data-lucide="copy" style="width: 18px;"></i> Copiar Código PIX
            </span>
        </template>
        <template x-if="copied">
            <span style="display: flex; align-items: center; gap: 8px;">
                <i data-lucide="check" style="width: 18px;"></i> Código Copiado!
            </span>
        </template>
    </button>

    <div class="pix-timer" x-data="{ seconds: 600 }" x-init="setInterval(() => { if(seconds > 0) seconds-- }, 1000)" style="margin-top: 20px; color: #64748b; font-size: 13px;">
        O código expira em <span x-text="Math.floor(seconds/60) + ':' + (seconds%60).toString().padStart(2, '0')" style="font-weight: 700; color: #ef4444;"></span>
    </div>

    <div class="status-polling" x-data="{
        checkStatus() {
            fetch('{{ route('checkout.pix.status', $transaction->uuid) }}')
                .then(r => r.json())
                .then(data => {
                    if (['approved', 'received', 'paid', 'RECEIVED', 'CONFIRMED'].includes(data.status)) {
                        window.location.href = '{{ route('checkout.pix.success', $transaction->uuid) }}';
                    }
                });
        }
    }" x-init="setInterval(() => checkStatus(), 5000)">
        <p style="font-size: 11px; color: #94a3b8; margin-top: 15px;">Detectando pagamento automaticamente...</p>
    </div>
</div>
@endsection
