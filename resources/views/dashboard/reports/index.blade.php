@extends('dashboard.layouts.app')

@section('title', 'Relatórios')

@section('content')
<div class="page-header animate-up" style="animation-delay: 0.1s;">
    <h2>Relatórios</h2>
</div>

<div class="filter-form animate-up" style="animation-delay: 0.2s;">
    <form method="GET" action="{{ route('dashboard.reports') }}">
        <div class="filter-row">
            <div class="filter-group">
                <label>Data Início</label>
                <input type="date" name="date_from" value="{{ request('date_from', now()->startOfMonth()->format('Y-m-d')) }}">
            </div>
            <div class="filter-group">
                <label>Data Fim</label>
                <input type="date" name="date_to" value="{{ request('date_to', now()->format('Y-m-d')) }}">
            </div>
            <div class="filter-actions">
                <button type="submit" class="btn btn-primary"><i class="fas fa-chart-bar"></i> Gerar</button>
                <a href="{{ route('dashboard.reports.export', request()->query()) }}" class="btn btn-secondary"><i class="fas fa-download"></i> CSV</a>
            </div>
        </div>
    </form>
</div>

<!-- KPI Cards -->
<div class="kpi-grid">
    <div class="kpi-card animate-up" style="animation-delay: 0.3s;">
        <i class="fas fa-money-bill-trend-up kpi-icon"></i>
        <span class="label">Total Transações</span>
        <div class="value">{{ number_format($total_transactions ?? 0) }}</div>
    </div>
    <div class="kpi-card animate-up" style="animation-delay: 0.4s;">
        <i class="fas fa-check-circle kpi-icon"></i>
        <span class="label">Aprovadas</span>
        <div class="value" style="color: var(--success);">{{ number_format($total_approved ?? 0) }}</div>
    </div>
    <div class="kpi-card animate-up" style="animation-delay: 0.5s;">
        <i class="fas fa-coins kpi-icon"></i>
        <span class="label">Volume Total</span>
        <div class="value">R$ {{ number_format($total_amount ?? 0, 2, ',', '.') }}</div>
    </div>
    <div class="kpi-card animate-up" style="animation-delay: 0.6s;">
        <i class="fas fa-percentage kpi-icon"></i>
        <span class="label">Taxa Aprovação</span>
        <div class="value">{{ number_format($approval_rate ?? 0, 1) }}%</div>
    </div>
</div>

<!-- Breakdown Tables -->
<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px;">
    <div class="card animate-up" style="animation-delay: 0.7s;">
        <h3 style="font-size: 1rem; font-weight: 700; margin-bottom: 16px;">Por Método de Pagamento</h3>
        <table>
            <thead>
                <tr><th>Método</th><th style="text-align: right;">Qtd</th><th style="text-align: right;">Volume</th></tr>
            </thead>
            <tbody>
                @forelse($by_method ?? [] as $row)
                    <tr>
                        <td>{{ ucfirst(str_replace('_', ' ', $row->method)) }}</td>
                        <td style="text-align: right;">{{ number_format($row->count) }}</td>
                        <td style="text-align: right; font-weight: 600;">R$ {{ number_format($row->total, 2, ',', '.') }}</td>
                    </tr>
                @empty
                    <tr><td colspan="3" class="text-center" style="padding: 20px; color: var(--text-muted);">Sem dados</td></tr>
                @endforelse
            </tbody>
        </table>
    </div>

    <div class="card animate-up" style="animation-delay: 0.8s;">
        <h3 style="font-size: 1rem; font-weight: 700; margin-bottom: 16px;">Por Status</h3>
        <table>
            <thead>
                <tr><th>Status</th><th style="text-align: right;">Qtd</th><th style="text-align: right;">Volume</th></tr>
            </thead>
            <tbody>
                @forelse($by_status ?? [] as $row)
                    <tr>
                        <td>
                            @php $labels = ['approved'=>'Aprovado','pending'=>'Pendente','refused'=>'Recusado','refunded'=>'Estornado','cancelled'=>'Cancelado']; @endphp
                            {{ $labels[$row->status] ?? ucfirst($row->status) }}
                        </td>
                        <td style="text-align: right;">{{ number_format($row->count) }}</td>
                        <td style="text-align: right; font-weight: 600;">R$ {{ number_format($row->total, 2, ',', '.') }}</td>
                    </tr>
                @empty
                    <tr><td colspan="3" class="text-center" style="padding: 20px; color: var(--text-muted);">Sem dados</td></tr>
                @endforelse
            </tbody>
        </table>
    </div>
</div>
@endsection
