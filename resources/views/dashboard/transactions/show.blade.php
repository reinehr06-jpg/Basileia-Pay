@extends('dashboard.layouts.app')

@section('title', 'Transação ' . Str::limit($transaction->uuid, 8))

@section('content')
<a href="{{ route('dashboard.transactions') }}" class="back-link animate-up">
    <i class="fas fa-arrow-left"></i> Voltar para Transações
</a>

@php
    $tx = $transaction;
    $colors = ['approved'=>'badge-success','pending'=>'badge-warning','refused'=>'badge-danger','refunded'=>'badge-gray','cancelled'=>'badge-gray','processing'=>'badge-primary','overdue'=>'badge-danger'];
    $labels = ['approved'=>'Aprovado','pending'=>'Pendente','refused'=>'Recusado','refunded'=>'Estornado','cancelled'=>'Cancelado','processing'=>'Processando','overdue'=>'Vencido'];
@endphp

<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 24px;">
    <!-- Transaction Info -->
    <div class="card animate-up" style="animation-delay: 0.1s;">
        <h3 style="font-size: 1rem; font-weight: 700; color: var(--text-primary); margin-bottom: 16px;">Informações da Transação</h3>
        <div class="space-y-3">
            <div class="flex justify-between"><span class="detail-label">UUID</span><span class="detail-value" style="font-family: monospace; font-size: 0.8rem;">{{ $tx->uuid }}</span></div>
            <div class="flex justify-between"><span class="detail-label">Status</span><span class="badge {{ $colors[$tx->status] ?? 'badge-gray' }}">{{ $labels[$tx->status] ?? ucfirst($tx->status) }}</span></div>
            <div class="flex justify-between"><span class="detail-label">Valor</span><span class="detail-value">R$ {{ number_format($tx->amount, 2, ',', '.') }}</span></div>
            <div class="flex justify-between"><span class="detail-label">Moeda</span><span class="detail-value">{{ strtoupper($tx->currency ?? 'BRL') }}</span></div>
            <div class="flex justify-between"><span class="detail-label">Método</span><span class="detail-value">{{ ucfirst(str_replace('_', ' ', $tx->payment_method ?? '-')) }}</span></div>
            <div class="flex justify-between"><span class="detail-label">Parcelas</span><span class="detail-value">{{ $tx->installments ?? 1 }}x</span></div>
            <div class="flex justify-between"><span class="detail-label">Criação</span><span class="detail-value">{{ $tx->created_at?->format('d/m/Y H:i:s') }}</span></div>
            <div class="flex justify-between"><span class="detail-label">Pagamento</span><span class="detail-value">{{ $tx->paid_at?->format('d/m/Y H:i:s') ?? '-' }}</span></div>
            <div class="flex justify-between"><span class="detail-label">External ID</span><span class="detail-value" style="font-family: monospace;">{{ $tx->external_id ?? '-' }}</span></div>
        </div>
    </div>

    <!-- Customer / Payment -->
    <div style="display: flex; flex-direction: column; gap: 24px;">
        <div class="card animate-up" style="animation-delay: 0.2s;">
            <h3 style="font-size: 1rem; font-weight: 700; color: var(--text-primary); margin-bottom: 16px;">Cliente</h3>
            <div class="space-y-3">
                <div class="flex justify-between"><span class="detail-label">Nome</span><span class="detail-value">{{ $tx->customer_name ?? ($tx->customer?->name ?? '-') }}</span></div>
                <div class="flex justify-between"><span class="detail-label">Email</span><span class="detail-value">{{ $tx->customer_email ?? ($tx->customer?->email ?? '-') }}</span></div>
                <div class="flex justify-between"><span class="detail-label">Documento</span><span class="detail-value" style="font-family: monospace;">{{ $tx->customer_document ?? ($tx->customer?->document ?? '-') }}</span></div>
            </div>
        </div>

        <div class="card animate-up" style="animation-delay: 0.3s;">
            <h3 style="font-size: 1rem; font-weight: 700; color: var(--text-primary); margin-bottom: 16px;">Gateway</h3>
            <div class="space-y-3">
                <div class="flex justify-between"><span class="detail-label">Gateway</span><span class="detail-value">{{ $tx->gateway?->name ?? '-' }}</span></div>
                <div class="flex justify-between"><span class="detail-label">Gateway ID</span><span class="detail-value" style="font-family: monospace; font-size: 0.8rem;">{{ $tx->gateway_transaction_id ?? '-' }}</span></div>
                <div class="flex justify-between"><span class="detail-label">Integração</span><span class="detail-value">{{ $tx->integration?->name ?? '-' }}</span></div>
            </div>
        </div>
    </div>
</div>

@if($tx->fraudAnalysis)
<div class="card animate-up" style="animation-delay: 0.4s; margin-bottom: 24px;">
    <h3 style="font-size: 1rem; font-weight: 700; color: var(--text-primary); margin-bottom: 16px;">Análise de Fraude</h3>
    <div class="flex gap-4" style="flex-wrap: wrap;">
        <div>
            <span class="detail-label">Score</span>
            <div class="detail-value" style="font-size: 1.4rem; color: {{ $tx->fraudAnalysis->risk_level == 'high' ? 'var(--danger)' : ($tx->fraudAnalysis->risk_level == 'medium' ? 'var(--warning)' : 'var(--success)') }};">
                {{ $tx->fraudAnalysis->score }}
            </div>
        </div>
        <div>
            <span class="detail-label">Nível</span>
            <div><span class="badge {{ $tx->fraudAnalysis->risk_level == 'high' ? 'badge-danger' : ($tx->fraudAnalysis->risk_level == 'medium' ? 'badge-warning' : 'badge-success') }}">{{ ucfirst($tx->fraudAnalysis->risk_level) }}</span></div>
        </div>
        <div>
            <span class="detail-label">Recomendação</span>
            <div class="detail-value">{{ ucfirst($tx->fraudAnalysis->recommendation) }}</div>
        </div>
    </div>
</div>
@endif

@if($tx->items && $tx->items->count())
<div class="card animate-up" style="animation-delay: 0.5s;">
    <h3 style="font-size: 1rem; font-weight: 700; color: var(--text-primary); margin-bottom: 16px;">Itens</h3>
    <table>
        <thead>
            <tr>
                <th>Nome</th>
                <th style="text-align: right;">Qtd</th>
                <th style="text-align: right;">Preço Unit.</th>
                <th style="text-align: right;">Total</th>
            </tr>
        </thead>
        <tbody>
            @foreach($tx->items as $item)
                <tr>
                    <td>{{ $item->name }}</td>
                    <td style="text-align: right;">{{ $item->quantity }}</td>
                    <td style="text-align: right;">R$ {{ number_format($item->unit_price, 2, ',', '.') }}</td>
                    <td style="text-align: right; font-weight: 700;">R$ {{ number_format($item->quantity * $item->unit_price, 2, ',', '.') }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>
</div>
@endif
@endsection
