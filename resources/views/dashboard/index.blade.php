@extends('dashboard.layouts.app')
@section('title', 'Dashboard')

@section('content')
<!-- Welcome Elite Header -->
<div class="animate-up" style="animation-delay: 0.1s; margin-bottom: 20px;">
    <div style="display: flex; align-items: center; justify-content: space-between;">
        <div>
            <h1 style="font-size: 1.25rem; font-weight: 900; color: var(--text-primary); letter-spacing: -0.5px;">Olá, {{ Auth::user()->name ?? 'Admin' }} 👋</h1>
            <p style="font-size: 0.8rem; color: var(--text-muted);">Resultados consolidados de {{ now()->translatedFormat('F Y') }}.</p>
        </div>
        <div class="topbar-user" style="background: var(--success-bg); color: var(--success); border: 1px solid rgba(16, 185, 129, 0.1);">
            <i class="fas fa-check-circle" style="margin-right: 8px;"></i>
            Operacional
        </div>
    </div>
</div>

<!-- KPI Grid High-Density -->
<div class="kpi-grid">
    <div class="kpi-card animate-up" style="animation-delay: 0.2s;">
        <i class="fas fa-money-bill-trend-up kpi-icon"></i>
        <span class="label">Volume Mensal</span>
        <div class="value" style="font-size: 1.3rem;">R$ {{ number_format($volumeMonth ?? 0, 2, ',', '.') }}</div>
        <div style="font-size: 0.7rem; color: var(--success); font-weight: 700; margin-top: 2px;">
            <i class="fas fa-arrow-trend-up"></i> {{ number_format(abs($volumeTrend ?? 0), 1) }}% <span style="color: var(--text-muted); font-weight: 500;">vs mês ant.</span>
        </div>
    </div>

    <div class="kpi-card animate-up" style="animation-delay: 0.3s; border-left: 3px solid var(--success);">
        <i class="fas fa-chart-line kpi-icon"></i>
        <span class="label">Taxa Aprovação</span>
        <div class="value" style="font-size: 1.3rem;">{{ number_format($approvalRate ?? 0, 1) }}%</div>
        <div style="font-size: 0.7rem; color: var(--text-muted); margin-top: 2px;">{{ $approvedCount ?? 0 }} aprovadas</div>
    </div>

    <div class="kpi-card animate-up" style="animation-delay: 0.4s;">
        <i class="fas fa-plug kpi-icon"></i>
        <span class="label">Conexões</span>
        <div class="value" style="font-size: 1.3rem;">{{ $activeIntegrations ?? 0 }}</div>
        <div style="font-size: 0.7rem; color: var(--text-muted); margin-top: 2px;">{{ $totalIntegrations ?? 0 }} sistemas</div>
    </div>

    <div class="kpi-card animate-up" style="animation-delay: 0.5s; border-left: 3px solid var(--primary-light);">
        <i class="fas fa-bolt kpi-icon"></i>
        <span class="label">Saúde API</span>
        <div class="value" style="font-size: 1.3rem; color: var(--primary);">{{ number_format($webhookDelivered ?? 0) }}</div>
        <div style="font-size: 0.7rem; color: {{ ($webhookFailed ?? 0) > 0 ? 'var(--danger)' : 'var(--success)' }}; font-weight: 700; margin-top: 2px;">
            @if(($webhookFailed ?? 0) > 0) {{ $webhookFailed }} falhas @else 100% Integridade @endif
        </div>
    </div>
</div>

<!-- Main Grid: Charts & Insights -->
<div style="display: grid; grid-template-columns: 2fr 1.2fr; gap: 20px; margin-bottom: 20px;">
    <div class="card animate-up" style="animation-delay: 0.6s; padding: 15px;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
            <h3 style="font-size: 0.9rem; font-weight: 800;">Volume 7 Dias</h3>
            <span class="badge badge-primary" style="font-size: 0.6rem;">Real Time</span>
        </div>
        <canvas id="volumeChart" style="height: 180px;"></canvas>
    </div>

    <div class="card animate-up" style="animation-delay: 0.7s; padding: 15px;">
        <h3 style="font-size: 0.9rem; font-weight: 800; margin-bottom: 12px;">Insights Hoje</h3>
        <div style="display: flex; flex-direction: column; gap: 10px;">
            <div style="background: var(--bg-main); padding: 8px 12px; border-radius: 8px; border: 1px solid var(--border);">
                <div style="font-size: 0.65rem; text-transform: uppercase; color: var(--text-muted); font-weight: 800;">Processado</div>
                <div style="font-size: 1rem; font-weight: 900; color: var(--text-primary);">R$ {{ number_format($todayVolume ?? 0, 2, ',', '.') }}</div>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                <div style="background: var(--bg-main); padding: 8px 12px; border-radius: 8px; border: 1px solid var(--border);">
                    <div style="font-size: 0.65rem; text-transform: uppercase; color: var(--text-muted); font-weight: 800;">Vendas</div>
                    <div style="font-size: 0.9rem; font-weight: 900;">{{ number_format($todayTransactions ?? 0) }}</div>
                </div>
                <div style="background: var(--bg-main); padding: 8px 12px; border-radius: 8px; border: 1px solid var(--border);">
                    <div style="font-size: 0.65rem; text-transform: uppercase; color: var(--text-muted); font-weight: 800;">Gateway</div>
                    <div style="font-size: 0.9rem; font-weight: 900; color: var(--primary);">Global</div>
                </div>
            </div>
            <div style="background: var(--warning-bg); padding: 8px 12px; border-radius: 8px; border: 1px solid rgba(245, 158, 11, 0.1);">
                <div style="font-size: 0.65rem; text-transform: uppercase; color: #b45309; font-weight: 800;">Aguardando</div>
                <div style="font-size: 0.9rem; font-weight: 900; color: #b45309;">{{ $pendingTransactions ?? 0 }} Pendentes</div>
            </div>
        </div>
    </div>
</div>

<!-- Recent Transactions -->
<div class="card animate-up" style="animation-delay: 0.8s; padding: 15px;">
    <div class="card-header" style="margin-bottom: 12px;">
        <h3 style="font-size: 0.9rem; font-weight: 800;">Transações Recentes</h3>
        <a href="{{ route('dashboard.transactions') }}" style="font-size: 0.75rem; color: var(--primary); font-weight: 700;">Ver Todos <i class="fas fa-arrow-right"></i></a>
    </div>
    <div class="table-wrapper">
        <table>
            <thead>
                <tr>
                    <th>UUID</th>
                    <th>Cliente</th>
                    <th>Valor</th>
                    <th>Status</th>
                    <th>Data</th>
                </tr>
            </thead>
            <tbody>
                @forelse($recentTransactions ?? [] as $tx)
                <tr>
                    <td style="font-family: monospace; font-size: 0.75rem;">{{ Str::limit($tx->uuid, 8) }}</td>
                    <td>{{ Str::limit($tx->customer_name ?? '-', 20) }}</td>
                    <td style="font-weight: 700;">R$ {{ number_format($tx->amount, 2, ',', '.') }}</td>
                    <td><span class="badge {{ $tx->status === 'approved' ? 'badge-success' : 'badge-warning' }}">{{ ucfirst($tx->status) }}</span></td>
                    <td style="color: var(--text-muted);">{{ $tx->created_at?->format('d/m H:i') }}</td>
                </tr>
                @empty
                <tr><td colspan="5" style="text-align: center; padding: 20px;">Nenhuma transação disponível.</td></tr>
                @endforelse
            </tbody>
        </table>
    </div>
</div>
@endsection

@section('scripts')
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<script>
    document.addEventListener('DOMContentLoaded', function() {
        const ctx = document.getElementById('volumeChart');
        if (!ctx) return;
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: @json($dailyLabels ?? []),
                datasets: [{
                    label: 'Volume (R$)',
                    data: @json($dailyVolumes ?? []),
                    borderColor: '#4f46e5',
                    borderWidth: 3,
                    backgroundColor: 'rgba(79, 70, 229, 0.05)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: { maintainAspectRatio: false, plugins: { legend: { display: false } } }
        });
    });
</script>
@endsection
