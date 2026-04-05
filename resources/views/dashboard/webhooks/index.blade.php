@extends('dashboard.layouts.app')
@section('title', 'Webhooks')

@section('header_actions')
    <button class="btn" style="background: rgba(255,255,255,0.2); color: white; border: 1px solid rgba(255,255,255,0.3); padding: 8px 16px; border-radius: 10px; font-weight: 800; font-size: 0.75rem; cursor: pointer; display: flex; align-items: center; gap: 8px;">
        <i class="fas fa-sync-alt"></i> REFRESH LOGS
    </button>
@endsection

@section('content')
<!-- Metric Bar -->
<div class="kpi-grid" style="margin-bottom: 24px;">
    <div class="kpi-card animate-up" style="animation-delay: 0.1s;">
        <div class="label">Total de Envios</div>
        <div class="value">{{ $deliveries->total() ?? $deliveries->count() }}</div>
        <i class="fas fa-tower-broadcast kpi-icon"></i>
    </div>
    <div class="kpi-card animate-up" style="animation-delay: 0.2s; border-left: 3px solid var(--success);">
        <div class="label">Taxa de Sucesso</div>
        <div class="value">
            @php 
                $total = $deliveries->total() ?? $deliveries->count();
                $success = $deliveries->where('status', 'delivered')->count();
                echo ($total > 0) ? number_format(($success / $total) * 100, 1) : '100';
            @endphp%
        </div>
        <i class="fas fa-check-double kpi-icon"></i>
    </div>
    <div class="kpi-card animate-up" style="animation-delay: 0.3s; border-left: 3px solid var(--danger);">
        <div class="label">Falhas (24h)</div>
        <div class="value" style="color: var(--danger);">{{ $deliveries->where('status', 'failed')->count() }}</div>
        <i class="fas fa-exclamation-triangle kpi-icon"></i>
    </div>
    <div class="kpi-card animate-up" style="animation-delay: 0.4s; border-left: 3px solid var(--primary-light);">
        <div class="label">Tempo Médio</div>
        <div class="value">240ms</div>
        <i class="fas fa-bolt kpi-icon"></i>
    </div>
</div>

<!-- Filter Bar Elite -->
<div class="card animate-up" style="padding: 12px 20px; margin-bottom: 24px; border-radius: 16px; display: flex; align-items: center; justify-content: space-between; background: #fff; border: 1px solid var(--border);">
    <form method="GET" action="{{ route('dashboard.webhooks') }}" style="display: flex; align-items: center; gap: 15px; flex: 1;">
        <div style="font-size: 0.7rem; font-weight: 900; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px;">Logs de Eventos:</div>
        <div style="position: relative;">
            <select name="status" onchange="this.form.submit()" style="appearance: none; background: #f8fafc; border: 1px solid var(--border); padding: 8px 36px 8px 16px; border-radius: 10px; font-size: 0.8rem; font-weight: 700; color: var(--text-primary); cursor: pointer; min-width: 160px;">
                <option value="">Todos Status</option>
                <option value="delivered" {{ request('status') == 'delivered' ? 'selected' : '' }}>Entregues</option>
                <option value="failed" {{ request('status') == 'failed' ? 'selected' : '' }}>Falhas</option>
                <option value="pending" {{ request('status') == 'pending' ? 'selected' : '' }}>Pendentes</option>
            </select>
            <i class="fas fa-chevron-down" style="position: absolute; right: 12px; top: 50%; transform: translateY(-50%); font-size: 0.6rem; color: var(--text-muted); pointer-events: none;"></i>
        </div>
        <div style="position: relative; flex: 1; max-width: 300px;">
            <input type="text" name="event_type" value="{{ request('event_type') }}" placeholder="Ex: payment.approved" style="width: 100%; background: #f8fafc; border: 1px solid var(--border); padding: 8px 16px 8px 32px; border-radius: 10px; font-size: 0.8rem; font-weight: 600;">
            <i class="fas fa-search" style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); font-size: 0.7rem; color: var(--text-muted);"></i>
        </div>
        <button type="submit" style="display: none;"></button>
    </form>
    <div style="display: flex; align-items: center; gap: 12px;">
        <span style="font-size: 0.75rem; color: var(--text-muted); font-weight: 600;">Total: {{ $deliveries->total() }} entradas</span>
        <a href="{{ route('dashboard.webhooks') }}" class="btn" style="background: #f1f5f9; color: #475569; border: none; padding: 10px; border-radius: 10px; cursor: pointer; text-decoration: none;"><i class="fas fa-times-circle"></i></a>
    </div>
</div>

<div class="card animate-up" style="padding: 0; overflow: hidden; border-radius: 20px; border: 1px solid var(--border); box-shadow: var(--shadow-sm);">
    <div class="table-wrapper" style="border: none;">
        <table style="width: 100%; border-collapse: collapse;">
            <thead>
                <tr style="background: #f8fafc; border-bottom: 1px solid var(--border);">
                    <th style="padding: 16px 24px; text-align: left; font-size: 0.7rem; font-weight: 800; text-transform: uppercase; color: var(--text-muted); letter-spacing: 1px;">Evento</th>
                    <th style="padding: 16px 24px; text-align: left; font-size: 0.7rem; font-weight: 800; text-transform: uppercase; color: var(--text-muted); letter-spacing: 1px;">Integração</th>
                    <th style="padding: 16px 24px; text-align: left; font-size: 0.7rem; font-weight: 800; text-transform: uppercase; color: var(--text-muted); letter-spacing: 1px;">Status</th>
                    <th style="padding: 16px 24px; text-align: left; font-size: 0.7rem; font-weight: 800; text-transform: uppercase; color: var(--text-muted); letter-spacing: 1px;">Tentativas</th>
                    <th style="padding: 16px 24px; text-align: left; font-size: 0.7rem; font-weight: 800; text-transform: uppercase; color: var(--text-muted); letter-spacing: 1px;">Data / Hora</th>
                    <th style="padding: 16px 24px; text-align: right; font-size: 0.7rem; font-weight: 800; text-transform: uppercase; color: var(--text-muted); letter-spacing: 1px;">Ações</th>
                </tr>
            </thead>
            <tbody>
                @forelse($deliveries as $d)
                    <tr style="border-bottom: 1px solid var(--border-light); transition: background 0.2s ease;">
                        <td style="padding: 16px 24px;">
                            <div style="font-family: 'JetBrains Mono', monospace; font-weight: 700; color: var(--text-primary); font-size: 0.85rem;">{{ $d->event_type }}</div>
                            <div style="font-size: 0.7rem; color: var(--text-muted); font-weight: 600;">UUID: {{ Str::limit($d->id, 8) }}</div>
                        </td>
                        <td style="padding: 16px 24px;">
                            <div style="font-weight: 800; color: var(--text-main); font-size: 0.85rem;">{{ $d->endpoint?->integration?->name ?? 'Sistema Externo' }}</div>
                        </td>
                        <td style="padding: 16px 24px;">
                            @php
                                $cs = ['delivered' => ['bg' => '#ecfdf5', 'text' => '#10b981', 'label' => 'DELIVERED'], 'failed' => ['bg' => '#fef2f2', 'text' => '#ef4444', 'label' => 'FAILED'], 'pending' => ['bg' => '#fffbeb', 'text' => '#f59e0b', 'label' => 'PENDING']];
                                $curr = $cs[$d->status] ?? ['bg' => '#f1f5f9', 'text' => '#64748b', 'label' => strtoupper($d->status)];
                            @endphp
                            <span style="background: {{ $curr['bg'] }}; color: {{ $curr['text'] }}; padding: 5px 12px; border-radius: 8px; font-size: 0.65rem; font-weight: 900; letter-spacing: 0.5px;">{{ $curr['label'] }}</span>
                        </td>
                        <td style="padding: 16px 24px;">
                            <div style="font-weight: 700; color: var(--text-main); font-size: 0.85rem;">{{ $d->attempts }} <span style="font-size: 0.7rem; font-weight: 600; color: var(--text-muted);">/{{ $d->max_attempts }}</span></div>
                            <div style="font-size: 0.7rem; font-weight: 700; color: {{ ($d->response_code >= 200 && $d->response_code < 300) ? 'var(--success)' : 'var(--danger)' }};">HTTP {{ $d->response_code ?? '---' }}</div>
                        </td>
                        <td style="padding: 16px 24px;">
                            <div style="font-weight: 700; color: var(--text-main); font-size: 0.85rem;">{{ $d->created_at?->format('d/m/Y') }}</div>
                            <div style="font-size: 0.75rem; color: var(--text-muted); font-weight: 600;">{{ $d->created_at?->format('H:i:s') }}</div>
                        </td>
                        <td style="padding: 16px 24px; text-align: right;">
                            <div style="display: flex; align-items: center; justify-content: flex-end; gap: 10px;">
                                <a href="{{ route('dashboard.webhooks.show', $d->id) }}" class="btn" style="background: #fff; color: #475569; border: 1px solid var(--border); padding: 10px; border-radius: 10px; display: flex; align-items: center; justify-content: center; text-decoration: none;" title="Ver Detalhes">
                                    <i class="fas fa-eye"></i>
                                </a>
                                @if($d->status === 'failed')
                                    <form method="POST" action="{{ route('dashboard.webhooks.retry', $d->id) }}" style="display: inline;">
                                        @csrf
                                        <button type="submit" class="btn" style="background: rgba(124, 58, 237, 0.1); color: var(--primary); border: none; padding: 10px; border-radius: 10px; cursor: pointer;" title="Tentar Novamente">
                                            <i class="fas fa-redo"></i>
                                        </button>
                                    </form>
                                @endif
                            </div>
                        </td>
                    </tr>
                @empty
                    <tr>
                        <td colspan="6" style="padding: 80px 24px; text-align: center; color: var(--text-muted); background: #fff; border: 2px dashed var(--border);">
                            <div style="width: 80px; height: 80px; background: #f8fafc; color: var(--border); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 2.5rem; margin: 0 auto 24px;">
                                <i class="fas fa-tower-broadcast"></i>
                            </div>
                            <h3 style="font-size: 1.25rem; font-weight: 900; color: var(--bg-sidebar); margin-bottom: 8px;">Nenhum log encontrado</h3>
                            <p style="font-size: 0.9rem;">Eventos de webhook aparecerão aqui conforme as vendas são processadas.</p>
                        </td>
                    </tr>
                @endforelse
            </tbody>
        </table>
    </div>
    
    @if($deliveries->hasPages())
    <div style="padding: 20px 24px; background: #f8fafc; border-top: 1px solid var(--border); display: flex; justify-content: flex-end;">
        {{ $deliveries->links() }}
    </div>
    @endif
</div>
@endsection
