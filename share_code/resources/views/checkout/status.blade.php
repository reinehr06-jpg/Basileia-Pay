{{-- resources/views/checkout/status.blade.php --}}
@extends('checkout._layout')

@section('title', 'Status do Pagamento - ' . ($transaction->id ?? '#'))

@section('payment-content')
    <div class="status-container" style="text-align: center; padding: 40px 0; max-width: 600px; margin: 0 auto;">

        @if($transaction->status === 'pending')
            <div
                style="width: 100px; height: 100px; background: #fef3c7; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 24px; border: 4px solid #fde68a;">
                <i data-lucide="clock" style="width: 50px; height: 50px; color: #f59e0b;"></i>
            </div>
            <h2 class="payment-title" style="font-size: 24px; margin-bottom: 10px;">Aguardando Pagamento</h2>
            <p class="payment-subtitle" style="font-size: 14px; color: #64748b; margin-bottom: 20px;">
                Seu pagamento está sendo processado. Esta página atualiza automaticamente.
            </p>
        @elseif($transaction->status === 'approved')
            <div
                style="width: 100px; height: 100px; background: #dcfce7; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 24px; border: 4px solid #bbf7d0;">
                <i data-lucide="check-circle" style="width: 50px; height: 50px; color: #16a34a;"></i>
            </div>
            <h2 class="payment-title" style="font-size: 24px; margin-bottom: 10px;">Pagamento Aprovado!</h2>
            <p class="payment-subtitle" style="font-size: 14px; color: #64748b; margin-bottom: 20px;">
                Seu pagamento foi confirmado com sucesso.
            </p>
        @elseif($transaction->status === 'overdue')
            <div
                style="width: 100px; height: 100px; background: #fef2f2; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 24px; border: 4px solid #fecaca;">
                <i data-lucide="alert-circle" style="width: 50px; height: 50px; color: #ef4444;"></i>
            </div>
            <h2 class="payment-title" style="font-size: 24px; margin-bottom: 10px;">Pagamento Vencido</h2>
            <p class="payment-subtitle" style="font-size: 14px; color: #64748b; margin-bottom: 20px;">
                O pagamento não foi realizado dentro do prazo.
            </p>
        @elseif($transaction->status === 'cancelled')
            <div
                style="width: 100px; height: 100px; background: #f1f5f9; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 24px; border: 4px solid #cbd5e1;">
                <i data-lucide="x-circle" style="width: 50px; height: 50px; color: #64748b;"></i>
            </div>
            <h2 class="payment-title" style="font-size: 24px; margin-bottom: 10px;">Pagamento Cancelado</h2>
            <p class="payment-subtitle" style="font-size: 14px; color: #64748b; margin-bottom: 20px;">
                Este pagamento foi cancelado.
            </p>
        @elseif($transaction->status === 'refunded')
            <div
                style="width: 100px; height: 100px; background: #e0e7ff; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 24px; border: 4px solid #c7d2fe;">
                <i data-lucide="rotate-ccw" style="width: 50px; height: 50px; color: #4f46e5;"></i>
            </div>
            <h2 class="payment-title" style="font-size: 24px; margin-bottom: 10px;">Pagamento Estornado</h2>
            <p class="payment-subtitle" style="font-size: 14px; color: #64748b; margin-bottom: 20px;">
                O valor foi estornado.
            </p>
        @else
            <div
                style="width: 100px; height: 100px; background: #f1f5f9; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 24px; border: 4px solid #cbd5e1;">
                <i data-lucide="help-circle" style="width: 50px; height: 50px; color: #94a3b8;"></i>
            </div>
            <h2 class="payment-title" style="font-size: 24px; margin-bottom: 10px;">Status Desconhecido</h2>
            <p class="payment-subtitle" style="font-size: 14px; color: #64748b; margin-bottom: 20px;">
                Não foi possível determinar o status atual.
            </p>
        @endif

        <div class="transaction-details"
            style="background: #f8fafc; border-radius: 16px; padding: 24px; text-align: left; border: 1.5px solid #e2e8f0; margin-bottom: 30px;">
            <h4
                style="font-size: 14px; color: #0f172a; margin-bottom: 16px; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;">
                Detalhes da Transação</h4>

            <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 13px;">
                <span style="color: #64748b;">ID:</span>
                <span
                    style="font-family: 'Share Tech Mono', monospace; color: #0f172a;">#{{ substr($transaction->uuid, 0, 8) }}</span>
            </div>

            <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 13px;">
                <span style="color: #64748b;">Valor:</span>
                <span style="font-weight: 700; color: #0f172a;">R$
                    {{ number_format($transaction->amount, 2, ',', '.') }}</span>
            </div>

            <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 13px;">
                <span style="color: #64748b;">Status:</span>
                <span style="font-weight: 600; text-transform: uppercase;
                    @if($transaction->status === 'approved') color: #16a34a;
                    @elseif($transaction->status === 'pending') color: #f59e0b;
                    @elseif($transaction->status === 'overdue') color: #ef4444;
                    @elseif($transaction->status === 'refunded') color: #4f46e5;
                    @else color: #64748b; @endif">
                    {{ strtoupper($transaction->status) }}
                </span>
            </div>

            <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 13px;">
                <span style="color: #64748b;">Método:</span>
                <span
                    style="text-transform: uppercase; color: #0f172a;">{{ str_replace('_', ' ', $transaction->payment_method) }}</span>
            </div>

            @if($transaction->paid_at)
                <div style="display: flex; justify-content: space-between; font-size: 13px;">
                    <span style="color: #64748b;">Pago em:</span>
                    <span style="color: #0f172a;">{{ $transaction->paid_at->format('d/m/Y H:i') }}</span>
                </div>
            @endif
        </div>

        @if($autoRefresh && $transaction->status === 'pending')
            <p style="font-size: 12px; color: #94a3b8; margin-bottom: 20px;">
                Atualizando automaticamente a cada {{ $refreshInterval }} segundos...
            </p>
            <meta http-equiv="refresh" content="{{ $refreshInterval }};url={{ url()->current() }}">
        @endif

        <a href="/" class="btn-pay"
            style="text-decoration: none; display: inline-flex; align-items: center; justify-content: center; gap: 8px;">
            <i data-lucide="home" style="width: 18px;"></i> Voltar ao Início
        </a>
    </div>
@endsection