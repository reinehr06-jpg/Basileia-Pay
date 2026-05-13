{{-- resources/views/checkout/boleto/front/pagamento.blade.php --}}
@extends('checkout._layout')

@section('title', 'Pagamento via Boleto - ' . ($plano ?? $transaction->description))

@section('payment-content')
<div class="boleto-container" style="text-align: center; padding: 20px 0;">
    <div class="payment-header" style="margin-bottom: 30px;">
        <h2 class="payment-title">Pague com Boleto</h2>
        <p class="payment-subtitle">O boleto foi gerado com sucesso</p>
    </div>

    <div class="boleto-icon" style="margin-bottom: 30px;">
        <div style="width: 80px; height: 80px; background: #f1f5f9; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto;">
            <i data-lucide="barcode" style="width: 40px; height: 40px; color: #64748b;"></i>
        </div>
    </div>

    @if(!empty($asaasPayment['bankSlipUrl']))
        <a href="{{ $asaasPayment['bankSlipUrl'] }}" target="_blank" class="btn-pay" style="text-decoration: none;">
            <i data-lucide="external-link" style="width: 18px;"></i> Visualizar Boleto
        </a>
    @else
        <div class="alert alert-warning">Aguardando link do boleto...</div>
    @endif

    <div class="info-box" style="margin-top: 30px; text-align: left; background: #f8fafc; padding: 20px; border-radius: 16px; border: 1.5px solid #e2e8f0;">
        <h4 style="font-size: 14px; color: #0f172a; margin-bottom: 10px;">Informações Importantes:</h4>
        <ul style="font-size: 12px; color: #64748b; padding-left: 20px; line-height: 1.6;">
            <li>O pagamento via boleto pode levar até 3 dias úteis para compensar.</li>
            <li>Você receberá a confirmação no seu e-mail assim que o pagamento for identificado.</li>
            <li>Pague em qualquer banco ou casa lotérica até a data de vencimento.</li>
        </ul>
    </div>

    <x-security-footer />
</div>
@endsection
