{{-- resources/views/checkout/shared/sucesso.blade.php --}}
@extends('checkout._layout')

@section('title', 'Sucesso! - Pagamento Confirmado')

@section('payment-content')
<div class="success-container" style="text-align: center; padding: 40px 0;">
    <div class="success-icon" style="margin-bottom: 30px;">
        <div style="width: 100px; height: 100px; background: #dcfce7; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto; border: 4px solid #f0fdf4;">
            <i data-lucide="check-circle" style="width: 50px; height: 50px; color: #16a34a;"></i>
        </div>
    </div>

    <h2 class="payment-title" style="font-size: 28px; margin-bottom: 10px;">Pagamento Confirmado!</h2>
    <p class="payment-subtitle" style="font-size: 16px; margin-bottom: 30px;">Obrigado por sua contribuição. Seu acesso está sendo liberado.</p>

    <div class="transaction-details" style="background: #f8fafc; border-radius: 16px; padding: 24px; text-align: left; border: 1.5px solid #e2e8f0; margin-bottom: 30px;">
        <h4 style="font-size: 14px; color: #0f172a; margin-bottom: 16px; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;">Detalhes da Transação</h4>
        
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 13px;">
            <span style="color: #64748b;">ID da Transação:</span>
            <span style="font-family: 'Share Tech Mono', monospace; color: #0f172a;">#{{ substr($transaction->uuid, 0, 8) }}</span>
        </div>
        
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 13px;">
            <span style="color: #64748b;">Valor:</span>
            <span style="font-weight: 700; color: #0f172a;">R$ {{ number_format($transaction->amount, 2, ',', '.') }}</span>
        </div>
        
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 13px;">
            <span style="color: #64748b;">Método:</span>
            <span style="text-transform: uppercase; color: #0f172a;">{{ str_replace('_', ' ', $transaction->payment_method) }}</span>
        </div>
        
        <div style="display: flex; justify-content: space-between; font-size: 13px;">
            <span style="color: #64748b;">Data:</span>
            <span style="color: #0f172a;">{{ now()->format('d/m/Y H:i') }}</span>
        </div>
    </div>

    <a href="/" class="btn-pay" style="text-decoration: none;">
        <i data-lucide="home" style="width: 18px;"></i> Voltar ao Início
    </a>

    <p style="font-size: 12px; color: #94a3b8; margin-top: 24px;">Um comprovante foi enviado para seu e-mail.</p>
</div>
@endsection
