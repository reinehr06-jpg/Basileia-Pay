@extends('dashboard.layouts.app')
@section('title', 'Pagamento Realizado')

@php $hideSidebar = true; $hideTopbar = true; @endphp

@section('content')
<style>
    :root { --primary: #7c3aed; --text-main: #1e293b; --bg-light: #f8fafc; }
    body { background-color: var(--bg-light); text-align: center; }
    .success-card { max-width: 600px; margin: 80px auto; background: white; padding: 60px 40px; border-radius: 30px; box-shadow: 0 15px 35px rgba(0,0,0,0.05); }
    .check-icon { width: 80px; height: 80px; background: #ecfdf5; color: #10b981; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 2.5rem; margin: 0 auto 30px; border: 8px solid #f0fdf4; }
    .btn-receipt { background: var(--primary); color: white; border: none; padding: 16px 32px; border-radius: 12px; font-size: 1rem; font-weight: 800; cursor: pointer; text-decoration: none; display: inline-flex; align-items: center; gap: 10px; transition: all 0.2s; }
    .btn-receipt:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(124, 58, 237, 0.2); }
</style>

<div class="success-card animate-up">
    <div class="check-icon">
        <i class="fas fa-check"></i>
    </div>
    
    <h2 style="font-size: 1.75rem; font-weight: 900; color: var(--text-main); margin-bottom: 12px;">Pagamento Aprovado!</h2>
    <p style="color: #64748b; font-size: 1rem; margin-bottom: 40px; line-height: 1.6;">Obrigado por sua confiança. Sua transação foi processada com sucesso e os dados já foram sincronizados com seu sistema.</p>

    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 20px; padding: 24px; margin-bottom: 40px; text-align: left;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
            <span style="color: #64748b; font-size: 0.85rem;">Valor Pago</span>
            <strong style="color: var(--primary); font-size: 1.1rem;">R$ {{ number_format($transaction->amount, 2, ',', '.') }}</strong>
        </div>
        <div style="display: flex; justify-content: space-between;">
            <span style="color: #64748b; font-size: 0.85rem;">Protocolo</span>
            <code style="font-size: 0.8rem; font-weight: 700;">{{ strtoupper($transaction->uuid) }}</code>
        </div>
    </div>

    <div style="display: grid; gap: 16px; justify-content: center;">
        <a href="{{ route('checkout.receipt', $transaction->uuid) }}" class="btn-receipt">
            <i class="fas fa-file-invoice"></i> Exportar Comprovante
        </a>
        <p style="font-size: 0.75rem; color: #94a3b8;">Um e-mail de confirmação foi enviado para {{ $transaction->customer_email }}</p>
    </div>
</div>
@endsection
