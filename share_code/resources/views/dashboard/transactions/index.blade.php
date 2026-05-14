@extends('dashboard.layouts.app')
@section('title', 'Transações')

@section('header_actions')
    <button onclick="window.location.reload()" class="btn" style="background: rgba(255,255,255,0.2); color: white; border: 1px solid rgba(255,255,255,0.3); padding: 8px 16px; border-radius: 10px; font-weight: 800; font-size: 0.75rem; cursor: pointer; display: flex; align-items: center; gap: 8px;">
        <i class="fas fa-sync-alt"></i> ATUALIZAR LISTA
    </button>
@endsection

@section('content')
<!-- Metric Bar -->
<div class="kpi-grid" style="margin-bottom: 24px;">
    <div class="kpi-card animate-up" style="animation-delay: 0.1s;">
        <div class="label">Volume Bruto (Mês)</div>
        <div class="value">R$ {{ number_format($transactions->where('status', 'approved')->sum('amount'), 2, ',', '.') }}</div>
        <i class="fas fa-chart-line kpi-icon"></i>
    </div>
    <div class="kpi-card animate-up" style="animation-delay: 0.2s; border-left: 3px solid var(--success);">
        <div class="label">Vendas Aprovadas</div>
        <div class="value">{{ $transactions->where('status', 'approved')->count() }}</div>
        <i class="fas fa-check-circle kpi-icon"></i>
    </div>
    <div class="kpi-card animate-up" style="animation-delay: 0.3s;">
        <div class="label">Ticket Médio</div>
        <div class="value">R$ {{ number_format($transactions->where('status', 'approved')->avg('amount') ?? 0, 2, ',', '.') }}</div>
        <i class="fas fa-tag kpi-icon"></i>
    </div>
    <div class="kpi-card animate-up" style="animation-delay: 0.4s; border-left: 3px solid var(--primary-light);">
        <div class="label">Conversão</div>
        <div class="value">
            @php 
                $count = $transactions->count();
                $approved = $transactions->where('status', 'approved')->count();
                echo $count > 0 ? number_format(($approved / $count) * 100, 1) : '0';
            @endphp%
        </div>
        <i class="fas fa-percent kpi-icon"></i>
    </div>
</div>

<!-- Filter Bar Elite -->
<div class="card animate-up" style="padding: 12px 20px; margin-bottom: 24px; border-radius: 16px; display: flex; align-items: center; justify-content: space-between; background: #fff; border: 1px solid var(--border);">
    <form method="GET" action="{{ route('dashboard.transactions') }}" style="display: flex; align-items: center; gap: 15px; flex: 1;">
        <div style="font-size: 0.7rem; font-weight: 900; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px;">Filtros Avancados:</div>
        <div style="position: relative;">
            <select name="status" onchange="this.form.submit()" style="appearance: none; background: #f8fafc; border: 1px solid var(--border); padding: 8px 36px 8px 16px; border-radius: 10px; font-size: 0.8rem; font-weight: 700; color: var(--text-primary); cursor: pointer; min-width: 140px;">
                <option value="">Status</option>
                <option value="approved" {{ request('status') == 'approved' ? 'selected' : '' }}>Aprovado</option>
                <option value="pending" {{ request('status') == 'pending' ? 'selected' : '' }}>Pendente</option>
                <option value="refused" {{ request('status') == 'refused' ? 'selected' : '' }}>Recusado</option>
            </select>
            <i class="fas fa-chevron-down" style="position: absolute; right: 12px; top: 50%; transform: translateY(-50%); font-size: 0.6rem; color: var(--text-muted); pointer-events: none;"></i>
        </div>
        <div style="position: relative; flex: 1; max-width: 280px;">
            <input type="text" name="search" value="{{ request('search') }}" placeholder="UUID, Nome ou Email..." style="width: 100%; background: #f8fafc; border: 1px solid var(--border); padding: 8px 16px 8px 32px; border-radius: 10px; font-size: 0.8rem; font-weight: 600;">
            <i class="fas fa-search" style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); font-size: 0.7rem; color: var(--text-muted);"></i>
        </div>
        <div style="display: flex; align-items: center; gap: 8px;">
             <input type="date" name="date_from" value="{{ request('date_from') }}" style="background: #f8fafc; border: 1px solid var(--border); padding: 7px 12px; border-radius: 10px; font-size: 0.8rem; color: var(--text-primary); font-weight: 600;">
             <span style="font-size: 0.7rem; color: var(--text-muted);">até</span>
             <input type="date" name="date_to" value="{{ request('date_to') }}" style="background: #f8fafc; border: 1px solid var(--border); padding: 7px 12px; border-radius: 10px; font-size: 0.8rem; color: var(--text-primary); font-weight: 600;">
        </div>
        <button type="submit" style="display: none;"></button>
    </form>
    <div style="display: flex; align-items: center; gap: 12px;">
        <span style="font-size: 0.75rem; color: var(--text-muted); font-weight: 600;">{{ $transactions->total() }} registros</span>
        <a href="{{ route('dashboard.transactions') }}" class="btn" style="background: #f1f5f9; color: #475569; border: none; padding: 10px; border-radius: 10px; cursor: pointer; text-decoration: none;"><i class="fas fa-times-circle"></i></a>
    </div>
</div>

<div class="card animate-up" style="padding: 0; overflow: hidden; border-radius: 20px; border: 1px solid var(--border); box-shadow: var(--shadow-sm);">
    <div class="table-wrapper" style="border: none;">
        <table style="width: 100%; border-collapse: collapse;">
            <thead>
                <tr style="background: #f8fafc; border-bottom: 1px solid var(--border);">
                    <th style="padding: 16px 24px; text-align: left; font-size: 0.7rem; font-weight: 800; text-transform: uppercase; color: var(--text-muted); letter-spacing: 1px;">Identificação</th>
                    <th style="padding: 16px 24px; text-align: left; font-size: 0.7rem; font-weight: 800; text-transform: uppercase; color: var(--text-muted); letter-spacing: 1px;">Cliente</th>
                    <th style="padding: 16px 24px; text-align: left; font-size: 0.7rem; font-weight: 800; text-transform: uppercase; color: var(--text-muted); letter-spacing: 1px;">Status</th>
                    <th style="padding: 16px 24px; text-align: left; font-size: 0.7rem; font-weight: 800; text-transform: uppercase; color: var(--text-muted); letter-spacing: 1px;">Valor Liquido</th>
                    <th style="padding: 16px 24px; text-align: left; font-size: 0.7rem; font-weight: 800; text-transform: uppercase; color: var(--text-muted); letter-spacing: 1px;">Metodo</th>
                    <th style="padding: 16px 24px; text-align: right; font-size: 0.7rem; font-weight: 800; text-transform: uppercase; color: var(--text-muted); letter-spacing: 1px;">Data</th>
                </tr>
            </thead>
            <tbody>
                @forelse($transactions as $tx)
                    <tr style="border-bottom: 1px solid var(--border-light); transition: background 0.2s ease;">
                        <td style="padding: 16px 24px;">
                            <div style="font-family: 'JetBrains Mono', monospace; font-weight: 700; color: var(--primary); font-size: 0.85rem;">
                                <a href="{{ route('dashboard.transactions.show', $tx->id) }}" style="text-decoration: none; color: inherit;">
                                    {{ Str::limit($tx->uuid, 8) }} 
                                    <i class="fas fa-external-link-alt" style="font-size: 0.6rem; opacity: 0.5;"></i>
                                </a>
                            </div>
                            <div style="font-size: 0.7rem; color: var(--text-muted); font-weight: 600;">ID: {{ $tx->id }}</div>
                        </td>
                        <td style="padding: 16px 24px;">
                            <div style="font-weight: 800; color: var(--text-main); font-size: 0.85rem;">{{ $tx->customer_name ?? ($tx->customer?->name ?? 'Indisponível') }}</div>
                            <div style="font-size: 0.7rem; color: var(--text-muted); font-weight: 600;">{{ $tx->customer_email ?? ($tx->customer?->email ?? '---') }}</div>
                        </td>
                        <td style="padding: 16px 24px;">
                            @php
                                $statusStyle = [
                                    'approved' => ['bg' => '#ecfdf5', 'text' => '#10b981', 'label' => 'APROVADA'],
                                    'refused' => ['bg' => '#fef2f2', 'text' => '#ef4444', 'label' => 'RECUSADA'],
                                    'pending' => ['bg' => '#fffbeb', 'text' => '#f59e0b', 'label' => 'PENDENTE'],
                                    'cancelled' => ['bg' => '#f1f5f9', 'text' => '#64748b', 'label' => 'CANCELADA']
                                ];
                                $cur = $statusStyle[$tx->status] ?? ['bg' => '#f1f5f9', 'text' => '#64748b', 'label' => strtoupper($tx->status)];
                            @endphp
                            <span style="background: {{ $cur['bg'] }}; color: {{ $cur['text'] }}; padding: 5px 12px; border-radius: 8px; font-size: 0.65rem; font-weight: 900; letter-spacing: 0.5px;">{{ $cur['label'] }}</span>
                            <button onclick="copyToClipboard('{{ route('checkout.show', $tx->uuid) }}', this)" style="background: none; border: none; color: var(--primary); cursor: pointer; font-size: 0.7rem; font-weight: 700; margin-left: 8px; vertical-align: middle;" title="Copiar Link Seguro">
                                <i class="fas fa-copy"></i> LINK
                            </button>
                        </td>
                        <td style="padding: 16px 24px;">
                            <div style="font-weight: 900; color: var(--bg-sidebar); font-size: 0.95rem;">R$ {{ number_format($tx->amount, 2, ',', '.') }}</div>
                        </td>
                        <td style="padding: 16px 24px;">
                            <div style="display: flex; align-items: center; gap: 8px; font-size: 0.75rem; font-weight: 700; color: var(--text-muted);">
                                @if($tx->payment_method === 'credit_card')
                                    <i class="fas fa-credit-card"></i> CARTÃO
                                @elseif($tx->payment_method === 'pix')
                                    <i class="fas fa-qrcode"></i> PIX
                                @else
                                    <i class="fas fa-file-invoice-dollar"></i> BOLETO
                                @endif
                            </div>
                        </td>
                        <td style="padding: 16px 24px; text-align: right;">
                            <div style="font-weight: 700; color: var(--text-main); font-size: 0.85rem;">{{ $tx->created_at?->format('d/m/Y') }}</div>
                            <div style="font-size: 0.75rem; color: var(--text-muted); font-weight: 600;">{{ $tx->created_at?->format('H:i') }}</div>
                        </td>
                    </tr>
                @empty
                    <tr>
                        <td colspan="6" style="padding: 80px 24px; text-align: center; background: #fff; border: 2px dashed var(--border);">
                             <i class="fas fa-search" style="font-size: 2.5rem; color: var(--border); margin-bottom: 16px; display: block;"></i>
                             <h3 style="font-size: 1.25rem; font-weight: 900; color: var(--bg-sidebar); margin-bottom: 8px;">Nenhuma transação encontrada</h3>
                             <p style="font-size: 0.9rem; color: var(--text-muted);">Tente ajustar seus filtros ou período de busca.</p>
                        </td>
                    </tr>
                @endforelse
            </tbody>
        </table>
    </div>
    
    @if($transactions->hasPages())
    <div style="padding: 20px 24px; background: #f8fafc; border-top: 1px solid var(--border); display: flex; justify-content: flex-end;">
        {{ $transactions->links() }}
    </div>
    @endif
</div>
@endsection

@section('scripts')
<script>
function copyToClipboard(text, btn) {
    const el = document.createElement('textarea');
    el.value = text;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    
    const originalContent = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-check"></i> OK!';
    btn.style.color = '#10b981';
    
    setTimeout(() => {
        btn.innerHTML = originalContent;
        btn.style.color = 'var(--primary)';
    }, 2000);
}
</script>
@endsection
